import { z } from "zod";

export const propertyFormSchema = z.object({
  title: z.string().min(3, "Informe um titulo com pelo menos 3 caracteres."),
  description: z.string().min(20, "Descreva melhor o imovel."),
  purpose: z.enum(["SALE", "RENT"]),
  type: z.enum(["HOUSE", "CONDO_HOUSE", "APARTMENT", "LAND", "STUDIO", "COMMERCIAL"]),
  price: z.coerce.number().positive("Informe um valor valido."),
  condoFee: z.coerce.number().min(0).optional().default(0),
  areaM2: z.coerce.number().int().positive("Informe a metragem."),
  bedrooms: z.coerce.number().int().min(0).optional().default(0),
  bathrooms: z.coerce.number().int().min(0).optional().default(0),
  parkingSpots: z.coerce.number().int().min(0).optional().default(0),
  city: z.string().min(2, "Informe a cidade."),
  district: z.string().min(2, "Informe o bairro."),
  community: z.string().optional(),
  isCondo: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isLaunch: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  images: z
    .array(z.string().url("Use URLs validas para as imagens."))
    .min(1, "Inclua pelo menos uma foto."),
});

export type PropertyFormInput = z.input<typeof propertyFormSchema>;
export type PropertyFormValues = z.output<typeof propertyFormSchema>;
