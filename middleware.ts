import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth";

async function read(req: NextRequest): Promise<{ sub: string; role: string } | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return null;
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return payload as any;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isAccountPath = pathname.startsWith("/account");
  const isDashboardPath = pathname.startsWith("/dashboard");

  if (!isAdminPath && !isAccountPath && !isDashboardPath) return NextResponse.next();

  const s = await read(req);

  // Account/Dashboard: any logged-in user.
  if (isAccountPath || isDashboardPath) {
    if (!s) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Admin: ADMIN role only.
  if (!s || (s as any).role !== "ADMIN") {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/account/:path*", "/dashboard/:path*"],
};
