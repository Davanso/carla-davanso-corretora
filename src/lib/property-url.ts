import type { Property } from "@/types/property";

export function propertyPublicId(property: Pick<Property, "id" | "code">) {
  const seed = `${property.code}-${property.id}`;
  let hash = 0;

  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) % 9000;
  }

  return String(hash + 100);
}

export function propertyDetailPath(property: Pick<Property, "id" | "code" | "slug">) {
  return `/imovel/${property.slug}-id-${propertyPublicId(property)}`;
}

export function propertySlugFromParam(param: string) {
  return param.replace(/-id-[a-z0-9]+$/i, "");
}
