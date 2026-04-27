import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // For demo purposes, using simple credential check
        // In production, this should validate against a secure database
        if (
          credentials?.username === "admin" &&
          credentials?.password === "admin123"
        ) {
          return {
            id: "1",
            name: "Military Admin",
            email: "admin@milaiassist.mil",
            role: "admin",
          };
        }
        if (
          credentials?.username === "operator" &&
          credentials?.password === "operator123"
        ) {
          return {
            id: "2",
            name: "Mission Operator",
            email: "operator@milaiassist.mil",
            role: "operator",
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as UserWithRole).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as UserWithRole).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
