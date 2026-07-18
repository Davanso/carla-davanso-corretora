import "server-only";

import { auth } from "@/auth";

export async function getAuthenticatedAdminEmail() {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!configuredEmail) return null;

  const session = await auth();
  const sessionEmail = session?.user?.email?.trim().toLowerCase();
  return sessionEmail === configuredEmail ? configuredEmail : null;
}
