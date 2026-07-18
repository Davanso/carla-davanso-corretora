import { z } from "zod";

export const MAX_PROPERTY_IMAGES = 20;
export const MAX_PROPERTY_IMAGE_BYTES = 10 * 1024 * 1024;
export const UPLOAD_URL_TTL_SECONDS = 60;

export const PROPERTY_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type PropertyImageContentType = (typeof PROPERTY_IMAGE_CONTENT_TYPES)[number];

const extensionsByContentType: Record<PropertyImageContentType, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
};

export const propertyImageObjectKeySchema = z
  .string()
  .regex(
    /^properties\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/,
    "Chave de imagem inválida.",
  );

export const approvedPropertyImageSchema = z.strictObject({
  objectKey: propertyImageObjectKeySchema,
  uploadToken: z
    .string()
    .min(1, "Comprovante de upload ausente.")
    .max(4096, "Comprovante de upload inválido."),
});

export const uploadVerificationRequestSchema = z.strictObject({
  objectKey: propertyImageObjectKeySchema,
  contentType: z.enum(PROPERTY_IMAGE_CONTENT_TYPES),
  size: z.number().int().positive().max(MAX_PROPERTY_IMAGE_BYTES),
});

export const deletePropertyImagesRequestSchema = z.strictObject({
  objectKeys: z
    .array(propertyImageObjectKeySchema)
    .min(1, "Informe pelo menos uma imagem.")
    .max(MAX_PROPERTY_IMAGES, `Remova no máximo ${MAX_PROPERTY_IMAGES} imagens por vez.`),
});

const uploadFileSchema = z
  .strictObject({
    fileName: z
      .string()
      .trim()
      .min(1, "Informe o nome do arquivo.")
      .max(255, "O nome do arquivo é muito longo.")
      .refine((value) => !/[\\/\u0000-\u001f\u007f]/.test(value), {
        message: "O nome do arquivo contém caracteres inválidos.",
      }),
    contentType: z.enum(PROPERTY_IMAGE_CONTENT_TYPES, {
      error: "Envie apenas imagens JPEG, PNG ou WebP.",
    }),
    size: z
      .number()
      .int()
      .positive("O arquivo está vazio.")
      .max(MAX_PROPERTY_IMAGE_BYTES, "Cada imagem pode ter no máximo 10 MiB."),
  })
  .superRefine((file, context) => {
    const extension = file.fileName.split(".").pop()?.toLowerCase();
    const allowedExtensions = extensionsByContentType[file.contentType];

    if (!extension || !allowedExtensions.includes(extension)) {
      context.addIssue({
        code: "custom",
        path: ["fileName"],
        message: "A extensão do arquivo não corresponde ao tipo da imagem.",
      });
    }
  });

export const uploadSigningRequestSchema = z.strictObject({
  files: z
    .array(uploadFileSchema)
    .min(1, "Selecione pelo menos uma imagem.")
    .max(MAX_PROPERTY_IMAGES, `Envie no máximo ${MAX_PROPERTY_IMAGES} imagens.`),
});

export type UploadSigningRequest = z.infer<typeof uploadSigningRequestSchema>;

export type SignedPropertyUpload = {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  contentType: PropertyImageContentType;
  expiresAt: string;
};

export function extensionForContentType(contentType: PropertyImageContentType) {
  return contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
}
