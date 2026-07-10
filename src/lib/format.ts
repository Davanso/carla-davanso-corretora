export function formatCurrency(valueInCents: number, suffix?: string) {
  const value = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valueInCents / 100);

  return suffix ? `${value} ${suffix}` : value;
}

export function purposeLabel(purpose: "SALE" | "RENT") {
  return purpose === "SALE" ? "À venda" : "Para alugar";
}

export function typeLabel(type: string) {
  const labels: Record<string, string> = {
    HOUSE: "Casa",
    CONDO_HOUSE: "Casa de condomínio",
    APARTMENT: "Apartamento",
    LAND: "Terreno",
    STUDIO: "Studio",
    COMMERCIAL: "Comercial",
  };

  return labels[type] ?? type;
}
