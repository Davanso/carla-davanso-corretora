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
  sortOrder?: number;
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
  iptuFeeCents?: number | null;
  areaM2: number;
  landAreaM2?: number | null;
  builtAreaM2?: number | null;
  bedrooms?: number | null;
  suites?: number | null;
  livingRooms?: number | null;
  bathrooms?: number | null;
  parkingSpots?: number | null;
  ownerName?: string | null;
  ownerPhone?: string | null;
  street?: string | null;
  addressNumber?: string | null;
  addressComplement?: string | null;
  zipCode?: string | null;
  isCondo: boolean;
  isFeatured: boolean;
  isLaunch: boolean;
  addressSummary: string;
  city: string;
  district?: string | null;
  community?: string | null;
  images: PropertyImage[];
};
