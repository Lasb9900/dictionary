import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Protegemos dashboard/forms
  const isProtected =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/forms");

  if (!isProtected) {
    return NextResponse.next();
  }

  // ❌ Sin sesión → login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // ❌ Con sesión pero sin accessToken del backend → login
  if (!(token as any).accessToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // ✅ OK
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/forms/:path*"],
};
