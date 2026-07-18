import { z } from "zod";
import {
  approvedPropertyImageSchema,
  MAX_PROPERTY_IMAGES,
} from "@/lib/validations/upload";

const shortText = (label: string) =>
  z.string().trim().min(2, `Informe ${label}.`).max(120, `${label} é muito longo.`);

export const propertyMetadataSchema = z.strictObject({
  title: z.string().trim().min(3, "Informe um título com pelo menos 3 caracteres.").max(160),
  description: z.string().trim().min(20, "Descreva melhor o imóvel.").max(10_000),
  purpose: z.enum(["SALE", "RENT"]),
  type: z.enum(["HOUSE", "CONDO_HOUSE", "APARTMENT", "LAND", "STUDIO", "COMMERCIAL"]),
  price: z.number().finite().positive("Informe um valor válido.").max(21_474_836.47),
  condoFee: z.number().finite().min(0).max(21_474_836.47),
  areaM2: z.number().int().positive("Informe a metragem.").max(1_000_000),
  bedrooms: z.number().int().min(0).max(1_000),
  bathrooms: z.number().int().min(0).max(1_000),
  parkingSpots: z.number().int().min(0).max(1_000),
  city: shortText("a cidade"),
  district: shortText("o bairro"),
  community: z.string().trim().max(160, "O nome do empreendimento é muito longo."),
  isCondo: z.boolean(),
  isFeatured: z.boolean(),
  isLaunch: z.boolean(),
  isPublished: z.boolean(),
});

export const existingPropertyImageReferenceSchema = z.strictObject({
  id: z.string().min(1).max(64),
});

const createImagesSchema = z
  .array(approvedPropertyImageSchema)
  .min(1, "Inclua pelo menos uma foto.")
  .max(MAX_PROPERTY_IMAGES, `Inclua no máximo ${MAX_PROPERTY_IMAGES} fotos.`)
  .superRefine((images, context) => addDuplicateIssues(images.map((image) => image.objectKey), context));

const updateImagesSchema = z
  .array(z.union([existingPropertyImageReferenceSchema, approvedPropertyImageSchema]))
  .min(1, "Inclua pelo menos uma foto.")
  .max(MAX_PROPERTY_IMAGES, `Inclua no máximo ${MAX_PROPERTY_IMAGES} fotos.`)
  .superRefine((images, context) => {
    addDuplicateIssues(
      images.map((image) => ("id" in image ? `id:${image.id}` : `key:${image.objectKey}`)),
      context,
    );
  });

function addDuplicateIssues(values: string[], context: z.RefinementCtx) {
  if (new Set(values).size !== values.length) {
    context.addIssue({ code: "custom", message: "A mesma imagem foi informada mais de uma vez." });
  }
}

export const propertyCreateSchema = propertyMetadataSchema.extend({ images: createImagesSchema });

export const propertyPatchSchema = propertyMetadataSchema.partial().extend({
  images: updateImagesSchema.optional(),
});

// Kept as the form-facing contract for existing imports.
export const propertyFormSchema = propertyCreateSchema;

export type PropertyCreateInput = z.input<typeof propertyCreateSchema>;
export type PropertyCreateValues = z.output<typeof propertyCreateSchema>;
export type PropertyPatchValues = z.output<typeof propertyPatchSchema>;
