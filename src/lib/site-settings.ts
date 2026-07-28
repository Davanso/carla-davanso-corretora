import "server-only";

import { prisma } from "@/lib/prisma";

const SITE_SETTINGS_ID = "site";

export type SiteSettings = {
  brokerPhotoObjectKey: string | null;
  brokerPhotoUrl: string | null;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!process.env.DATABASE_URL) {
    return {
      brokerPhotoObjectKey: null,
      brokerPhotoUrl: null,
    };
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: SITE_SETTINGS_ID },
  });

  return {
    brokerPhotoObjectKey: settings?.brokerPhotoObjectKey ?? null,
    brokerPhotoUrl: settings?.brokerPhotoUrl ?? null,
  };
}

export async function updateBrokerPhoto({
  objectKey,
  url,
}: {
  objectKey: string;
  url: string;
}) {
  return prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: {
      id: SITE_SETTINGS_ID,
      brokerPhotoObjectKey: objectKey,
      brokerPhotoUrl: url,
    },
    update: {
      brokerPhotoObjectKey: objectKey,
      brokerPhotoUrl: url,
    },
  });
}
