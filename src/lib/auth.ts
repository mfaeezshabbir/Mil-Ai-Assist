import { timingSafeEqual } from "crypto";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export type UserWithRole = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function envAccount(
  id: string,
  role: string,
  name: string,
  usernameKey: string,
  passwordKey: string
): { username: string; password: string; user: UserWithRole } | null {
  const username = process.env[usernameKey];
  const password = process.env[passwordKey];
  if (!username || !password) return null;
  return {
    username,
    password,
    user: {
      id,
      name,
      email: `${username}@milaiassist.local`,
      role,
    },
  };
}

function configuredAccounts() {
  return [
    envAccount(
      "1",
      "admin",
      "Military Admin",
      "AUTH_ADMIN_USERNAME",
      "AUTH_ADMIN_PASSWORD"
    ),
    envAccount(
      "2",
      "operator",
      "Mission Operator",
      "AUTH_OPERATOR_USERNAME",
      "AUTH_OPERATOR_PASSWORD"
    ),
  ].filter((account): account is NonNullable<typeof account> =>
    Boolean(account)
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        devSkip: { label: "Dev Skip", type: "text" },
      },
      async authorize(credentials) {
        if (
          process.env.NODE_ENV === "development" &&
          credentials?.devSkip === "1"
        ) {
          return (
            configuredAccounts()[0]?.user ?? {
              id: "dev-admin",
              name: "Dev Admin",
              email: "dev@localhost",
              role: "admin",
            }
          );
        }

        const username = credentials?.username?.trim() ?? "";
        const password = credentials?.password ?? "";
        if (!username || !password) return null;

        for (const account of configuredAccounts()) {
          if (
            safeEqual(username, account.username) &&
            safeEqual(password, account.password)
          ) {
            return account.user;
          }
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
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
