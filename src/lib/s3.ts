import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function getS3Client() {
  return new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
  });
}

export async function createUploadUrl(key: string, contentType: string) {
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error("S3_BUCKET nao configurado.");
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 60 });
  const publicUrl = `${process.env.S3_PUBLIC_BASE_URL}/${key}`;

  return { uploadUrl, publicUrl };
}
