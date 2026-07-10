export type PropertyPurpose = "SALE" | "RENT";

export type PropertyType =
  | "HOUSE"
  | "CONDO_HOUSE"
  | "APARTMENT"
  | "LAND"
  | "STUDIO"
  | "COMMERCIAL";

export type PropertyImage = {
  id: string;
  url: string;
  alt: string;
};

export type Property = {
  id: string;
  code: string;
  title: string;
  slug: string;
  description: string;
  purpose: PropertyPurpose;
  type: PropertyType;
  priceInCents: number;
  condoFeeCents?: number | null;
  areaM2: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpots?: number | null;
  isCondo: boolean;
  isFeatured: boolean;
  isLaunch: boolean;
  addressSummary: string;
  city: string;
  district?: string | null;
  community?: string | null;
  images: PropertyImage[];
};
