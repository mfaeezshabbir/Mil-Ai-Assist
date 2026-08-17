import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (hasSession) {
    return NextResponse.next();
  }

  const signIn = new URL("/auth/signin", request.url);
  signIn.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/planner/:path*"],
};
