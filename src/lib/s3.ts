import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import {
  extensionForContentType,
  MAX_PROPERTY_IMAGE_BYTES,
  PROPERTY_IMAGE_CONTENT_TYPES,
  propertyImageObjectKeySchema,
  UPLOAD_URL_TTL_SECONDS,
  type PropertyImageContentType,
  type SignedPropertyUpload,
} from "@/lib/validations/upload";

const UPLOAD_TOKEN_TTL_SECONDS = 60 * 60;

const uploadTokenPayloadSchema = z.strictObject({
  version: z.literal(1),
  objectKey: propertyImageObjectKeySchema,
  etag: z.string().min(1),
  contentType: z.enum(PROPERTY_IMAGE_CONTENT_TYPES),
  size: z.number().int().positive().max(MAX_PROPERTY_IMAGE_BYTES),
  adminEmail: z.string().email(),
  expiresAt: z.number().int().positive(),
});

type UploadTokenPayload = z.infer<typeof uploadTokenPayloadSchema>;

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBaseUrl: string;
};

export type DeletePropertyObjectResult = {
  objectKey: string | null;
  status: "deleted" | "skipped" | "failed";
  reason?: "legacy-key-missing" | "invalid-object-key" | "r2-delete-failed";
  errorCode?: string;
};

export type VerifiedPropertyUpload = {
  objectKey: string;
  etag: string;
  contentType: PropertyImageContentType;
  size: number;
};

export class InvalidPropertyUploadError extends Error {
  constructor() {
    super("invalid-property-upload");
    this.name = "InvalidPropertyUploadError";
  }
}

function getR2Config(): R2Config {
  const values = {
    accountId: process.env.R2_ACCOUNT_ID?.trim(),
    accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim(),
    bucketName: process.env.R2_BUCKET_NAME?.trim(),
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL?.trim(),
  };

  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Configuração R2 incompleta: ${missing.join(", ")}.`);
  }

  const publicUrl = new URL(values.publicBaseUrl!);

  if (!["http:", "https:"].includes(publicUrl.protocol) || publicUrl.search || publicUrl.hash) {
    throw new Error("R2_PUBLIC_BASE_URL deve ser uma URL HTTP(S) sem query ou fragmento.");
  }

  return {
    accountId: values.accountId!,
    accessKeyId: values.accessKeyId!,
    secretAccessKey: values.secretAccessKey!,
    bucketName: values.bucketName!,
    publicBaseUrl: values.publicBaseUrl!.replace(/\/+$/, ""),
  };
}

function getR2Client(config: R2Config) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    // The browser sends the file body to this presigned URL. Avoid SDK-added
    // optional checksum query parameters, whose value cannot be computed here.
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export function publicUrlForObjectKey(objectKey: string) {
  const key = propertyImageObjectKeySchema.parse(objectKey);
  const { publicBaseUrl } = getR2Config();
  return `${publicBaseUrl}/${key}`;
}

export async function createPropertyUploadUrl(
  contentType: PropertyImageContentType,
): Promise<SignedPropertyUpload> {
  const config = getR2Config();
  const objectKey = `properties/${crypto.randomUUID()}.${extensionForContentType(contentType)}`;
  propertyImageObjectKeySchema.parse(objectKey);

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: objectKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getR2Client(config), command, {
    expiresIn: UPLOAD_URL_TTL_SECONDS,
    signableHeaders: new Set(["content-type"]),
  });

  return {
    uploadUrl,
    objectKey,
    publicUrl: `${config.publicBaseUrl}/${objectKey}`,
    contentType,
    expiresAt: new Date(Date.now() + UPLOAD_URL_TTL_SECONDS * 1000).toISOString(),
  };
}

export async function verifyUploadedPropertyObject({
  objectKey,
  contentType,
  size,
}: {
  objectKey: string;
  contentType: PropertyImageContentType;
  size: number;
}): Promise<VerifiedPropertyUpload> {
  const key = propertyImageObjectKeySchema.parse(objectKey);
  const config = getR2Config();
  const client = getR2Client(config);
  const head = await client.send(
    new HeadObjectCommand({ Bucket: config.bucketName, Key: key }),
  );

  if (
    head.ContentLength !== size ||
    head.ContentLength > MAX_PROPERTY_IMAGE_BYTES ||
    head.ContentType !== contentType ||
    !head.ETag
  ) {
    throw new InvalidPropertyUploadError();
  }

  const object = await client.send(
    new GetObjectCommand({ Bucket: config.bucketName, Key: key, Range: "bytes=0-11" }),
  );
  const bytes = await object.Body?.transformToByteArray();

  if (!bytes || !matchesImageSignature(bytes, contentType)) {
    throw new InvalidPropertyUploadError();
  }

  return {
    objectKey: key,
    etag: head.ETag,
    contentType,
    size,
  };
}

export function createPropertyUploadToken(upload: VerifiedPropertyUpload, adminEmail: string) {
  const payload: UploadTokenPayload = {
    version: 1,
    ...upload,
    adminEmail: adminEmail.trim().toLowerCase(),
    expiresAt: Math.floor(Date.now() / 1000) + UPLOAD_TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${signUploadToken(encodedPayload)}`;
}

export async function verifyPropertyUploadToken({
  token,
  objectKey,
  adminEmail,
}: {
  token: string;
  objectKey: string;
  adminEmail: string;
}): Promise<VerifiedPropertyUpload> {
  const [encodedPayload, providedSignature, ...extra] = token.split(".");
  if (!encodedPayload || !providedSignature || extra.length > 0) {
    throw new Error("invalid-upload-token");
  }

  const expectedSignature = signUploadToken(encodedPayload);
  const provided = Buffer.from(providedSignature, "base64url");
  const expected = Buffer.from(expectedSignature, "base64url");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new Error("invalid-upload-token");
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    throw new Error("invalid-upload-token");
  }

  const payload = uploadTokenPayloadSchema.parse(decoded);
  if (
    payload.expiresAt < Math.floor(Date.now() / 1000) ||
    payload.objectKey !== objectKey ||
    payload.adminEmail !== adminEmail.trim().toLowerCase()
  ) {
    throw new Error("invalid-upload-token");
  }

  const config = getR2Config();
  const head = await getR2Client(config).send(
    new HeadObjectCommand({ Bucket: config.bucketName, Key: payload.objectKey }),
  );

  if (
    head.ETag !== payload.etag ||
    head.ContentLength !== payload.size ||
    head.ContentType !== payload.contentType
  ) {
    throw new Error("uploaded-object-changed");
  }

  return {
    objectKey: payload.objectKey,
    etag: payload.etag,
    contentType: payload.contentType,
    size: payload.size,
  };
}

function signUploadToken(payload: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurado.");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function matchesImageSignature(bytes: Uint8Array, contentType: PropertyImageContentType) {
  if (contentType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (contentType === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, index) => bytes[index] === value,
    );
  }

  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

export async function deletePropertyObjects(
  objectKeys: ReadonlyArray<string | null | undefined>,
): Promise<DeletePropertyObjectResult[]> {
  let config: R2Config;

  try {
    config = getR2Config();
  } catch (error) {
    const errorCode = error instanceof Error ? error.name : "UnknownError";
    return objectKeys.map((objectKey) => ({
      objectKey: objectKey ?? null,
      status: objectKey ? "failed" : "skipped",
      reason: objectKey ? "r2-delete-failed" : "legacy-key-missing",
      ...(objectKey ? { errorCode } : {}),
    }));
  }

  const client = getR2Client(config);

  return Promise.all(
    objectKeys.map(async (objectKey): Promise<DeletePropertyObjectResult> => {
      if (!objectKey) {
        return { objectKey: null, status: "skipped", reason: "legacy-key-missing" };
      }

      if (!propertyImageObjectKeySchema.safeParse(objectKey).success) {
        return { objectKey, status: "skipped", reason: "invalid-object-key" };
      }

      try {
        await client.send(
          new DeleteObjectCommand({ Bucket: config.bucketName, Key: objectKey }),
        );
        return { objectKey, status: "deleted" };
      } catch (error) {
        return {
          objectKey,
          status: "failed",
          reason: "r2-delete-failed",
          errorCode: error instanceof Error ? error.name : "UnknownError",
        };
      }
    }),
  );
}
