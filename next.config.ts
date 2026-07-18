import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

function r2RemotePattern(): RemotePattern | null {
  const configured = process.env.R2_PUBLIC_BASE_URL?.trim();

  if (!configured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("R2_PUBLIC_BASE_URL é obrigatória em produção.");
    }
    return null;
  }

  const url = new URL(configured);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "R2_PUBLIC_BASE_URL deve ser uma URL HTTPS pública, sem credenciais, query ou fragmento.",
    );
  }

  const basePath = url.pathname.replace(/\/+$/, "");
  return {
    protocol: "https",
    hostname: url.hostname,
    port: url.port,
    pathname: `${basePath}/properties/**`,
    search: "",
  };
}

const r2Pattern = r2RemotePattern();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.15.92"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(r2Pattern ? [r2Pattern] : []),
    ],
  },
};

export default nextConfig;
