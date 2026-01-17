import { NextAuthOptions } from "next-auth";
import { connect } from "@/utils/config/dbConfig";
import User from "@/utils/models/User";
import NextAuth from "next-auth/next";
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
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
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const { email, password } = credentials as { email: string, password: string };
                try {
                    const res = await fetch(`${getApiBaseUrl()}/users/auth/login`, {
                        method: "POST",
                        body: JSON.stringify({
                            email,
                            password,
                        }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    if (res.status == 401) {
                        const errorResponse = await res.json();
                        throw new Error(errorResponse.message);
                    }

                    const user = await res.json();
                    return user;
                } catch (error: any) {
                    if (error.message === "Missing NEXT_PUBLIC_API_BASE_URL") {
                        throw new Error(error.message);
                    }
                    if (error.message === "fetch failed") {
                        throw new Error("Error al iniciar sesión.");
                    }
                    throw new Error(error.message);
                }
            },
        }),
    ],
    secret: process.env.SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {

        async jwt({ token, user }): Promise<any> {
            console.log("User", user, "Token:", token)
            if (user) return { ...token, ...user };
            return token;
        },

        async session({ token, session }) {
            session.user = token;
            session.user.token = token.token;

            return session;
        },

        async signIn({ user, account }: { user: any; account: any }) {
            if (account.provider === "google") {
                try {
                    const { name, email } = user;
                    await connect();
                    const ifUserExists = await User.findOne({ email });
                    console.log("ifUserExists: ", ifUserExists)
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
                        email: email,
                        imageUrl: user.image,
                    });
                    const res = await newUser.save();
                    if (res._id) {
                        user._id = res._id;
                        user.roles = res.roles;
                        user.token = createToken(res._id);
                        user.imageUrl = res.imageUrl;
                        user.fullName = res.fullName;
                        return true;
                    }
                } catch (err) {
                    console.log(err);
                }
            }
            return true;
        }
    },
};
