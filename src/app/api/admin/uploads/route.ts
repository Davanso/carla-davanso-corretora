import { NextResponse } from "next/server";
import { getAuthenticatedAdminEmail } from "@/lib/admin-auth";
import {
  createPropertyUploadToken,
  createPropertyUploadUrl,
  deletePropertyObjects,
  InvalidPropertyUploadError,
  verifyUploadedPropertyObject,
} from "@/lib/s3";
import {
  deletePropertyImagesRequestSchema,
  uploadSigningRequestSchema,
  uploadVerificationRequestSchema,
} from "@/lib/validations/upload";

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

export async function POST(request: Request) {
  if (!(await getAuthenticatedAdminEmail())) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const body = await readJson(request);
  if (body.error) return body.error;
  const parsed = uploadSigningRequestSchema.safeParse(body.payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Revise os arquivos selecionados.",
        errors: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const uploads = await Promise.all(
      parsed.data.files.map((file) =>
        createPropertyUploadUrl(file.contentType),
      ),
    );

    return NextResponse.json({ uploads });
  } catch {
    return NextResponse.json(
      { message: "O armazenamento de imagens não está disponível." },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const adminEmail = await getAuthenticatedAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const body = await readJson(request);
  if (body.error) return body.error;
  const parsed = uploadVerificationRequestSchema.safeParse(body.payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Dados de verificação inválidos." }, { status: 400 });
  }

  try {
    const upload = await verifyUploadedPropertyObject(parsed.data);
    const uploadToken = createPropertyUploadToken(upload, adminEmail);
    return NextResponse.json({ uploadToken });
  } catch (error) {
    if (!(error instanceof InvalidPropertyUploadError)) {
      return NextResponse.json(
        { message: "Não foi possível verificar a imagem no armazenamento." },
        { status: 503 },
      );
    }

    const deletion = await deletePropertyObjects([parsed.data.objectKey]);
    return NextResponse.json(
      { message: "A imagem enviada não corresponde ao arquivo autorizado.", deletion },
      { status: 422 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await getAuthenticatedAdminEmail())) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const body = await readJson(request);
  if (body.error) return body.error;
  const parsed = deletePropertyImagesRequestSchema.safeParse(body.payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Chaves de imagem inválidas." }, { status: 400 });
  }

  const results = await deletePropertyObjects(parsed.data.objectKeys);
  const hasFailures = results.some((result) => result.status === "failed");
  return NextResponse.json({ results }, { status: hasFailures ? 502 : 200 });
}
