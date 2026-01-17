import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { connect } from "@/utils/config/dbConfig";
import User from "@/utils/models/User";
import { createToken } from "@/utils/config/jwt.handle";
import { getApiBaseUrl } from "@/src/lib/api";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          throw new Error("Email y password son requeridos.");
        }

        try {
          const res = await fetch(`${getApiBaseUrl()}/users/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (res.status === 401) {
            const errorResponse = await res.json().catch(() => null);
            throw new Error(errorResponse?.message ?? "Credenciales inválidas.");
          }

          if (!res.ok) {
            const errorResponse = await res.json().catch(() => null);
            throw new Error(errorResponse?.message ?? "Error al iniciar sesión.");
          }

          // Debe devolver: _id, email, fullName, roles, token, imageUrl
          const user = await res.json();
          return user;
        } catch (error: any) {
          if (error?.message === "Missing NEXT_PUBLIC_API_URL") {
            throw new Error(error.message);
          }
          if (error?.message === "fetch failed") {
            throw new Error("No se pudo conectar con el backend.");
          }
          throw new Error(error?.message ?? "Error al iniciar sesión.");
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET ?? process.env.SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/login",
  },

 callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.sub = (user as any)._id;
      token.email = (user as any).email;

      (token as any).fullName = (user as any).fullName ?? (user as any).name ?? "";
      token.name = (token as any).fullName;

      (token as any).accessToken = (user as any).token;
      (token as any).roles = (user as any).roles ?? [];
      (token as any).imageUrl = (user as any).imageUrl ?? (user as any).image ?? "";
    }
    return token;
  },

  async session({ token, session }) {
    (session as any).accessToken = (token as any).accessToken;

    session.user = session.user ?? ({} as any);
    (session.user as any)._id = token.sub;
    (session.user as any).email = token.email;
    (session.user as any).fullName = (token as any).fullName ?? token.name ?? "";
    (session.user as any).roles = (token as any).roles ?? [];
    (session.user as any).imageUrl = (token as any).imageUrl ?? "";

    return session;
  },

  async signIn({ user, account }: { user: any; account: any }) {
  if (account?.provider === "google") {
    try {
      const name = (user as any)?.fullName ?? (user as any)?.name ?? "";
      const email = (user as any)?.email;

      if (!email) return false;

      await connect();

      const ifUserExists = await User.findOne({ email });
      if (ifUserExists) {
        user._id = ifUserExists._id;
        user.roles = ifUserExists.roles;
        user.token = createToken(ifUserExists._id);
        user.imageUrl = ifUserExists.imageUrl;
        user.fullName = ifUserExists.fullName;
        return true;
      }

      const newUser = new User({
        fullName: name,
        email,
        imageUrl: (user as any)?.image ?? "",
      });

      const res = await newUser.save();

      user._id = res._id;
      user.roles = res.roles;
      user.token = createToken(res._id);
      user.imageUrl = res.imageUrl;
      user.fullName = res.fullName;

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  return true;
},

}
}
