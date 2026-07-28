import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAdminEmail } from "@/lib/admin-auth";
import { deletePropertyObjects, publicUrlForObjectKey, verifyPropertyUploadToken } from "@/lib/s3";
import { getSiteSettings, updateBrokerPhoto } from "@/lib/site-settings";
import { approvedPropertyImageSchema } from "@/lib/validations/upload";

async function readJson(request: Request) {
  if (request.headers.get("content-type")?.split(";", 1)[0] !== "application/json") {
    return { error: NextResponse.json({ message: "Envie os dados como JSON." }, { status: 415 }) };
  }

  try {
    return { payload: await request.json() as unknown };
  } catch {
    return { error: NextResponse.json({ message: "JSON inválido." }, { status: 400 }) };
  }
}

const brokerPhotoSchema = z.strictObject({
  image: approvedPropertyImageSchema.refine((image) => image.objectKey.startsWith("settings/broker/"), {
    message: "Envie uma foto válida da corretora.",
  }),
});

export async function PATCH(request: Request) {
  const adminEmail = await getAuthenticatedAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const body = await readJson(request);
  if (body.error) return body.error;

  const parsed = brokerPhotoSchema.safeParse(body.payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Foto inválida.", errors: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await verifyPropertyUploadToken({
      token: parsed.data.image.uploadToken,
      objectKey: parsed.data.image.objectKey,
      adminEmail,
    });

    const previous = await getSiteSettings();
    const url = publicUrlForObjectKey(parsed.data.image.objectKey);
    await updateBrokerPhoto({ objectKey: parsed.data.image.objectKey, url });

    if (previous.brokerPhotoObjectKey && previous.brokerPhotoObjectKey !== parsed.data.image.objectKey) {
      await deletePropertyObjects([previous.brokerPhotoObjectKey]);
    }

    return NextResponse.json({ brokerPhotoUrl: url });
  } catch {
    return NextResponse.json({ message: "Não foi possível salvar a foto da corretora." }, { status: 503 });
  }
}
