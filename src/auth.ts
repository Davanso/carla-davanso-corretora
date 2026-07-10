import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase();
        const password = String(credentials?.password ?? "");

        const envEmail = process.env.ADMIN_EMAIL?.toLowerCase();
        const envPassword = process.env.ADMIN_PASSWORD;

        if (envEmail && envPassword && email === envEmail && password === envPassword) {
          return { id: "env-admin", name: "Administrador", email: envEmail };
        }

        if (!process.env.DATABASE_URL) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
