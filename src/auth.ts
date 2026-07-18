import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminPasswordHash || !email || !password) {
          return null;
        }

        let isValidPassword = false;

        try {
          isValidPassword = await bcrypt.compare(password, adminPasswordHash);
        } catch {
          return null;
        }

        if (email !== adminEmail || !isValidPassword) {
          return null;
        }

        return { id: "env-admin", name: "Administrador", email: adminEmail };
      },
    }),
  ],
});
