import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "bn_session";

function getKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string; // userId
  role: "USER" | "ADMIN";
  name: string;
  email: string;
};

export async function createSessionCookie(payload: SessionPayload) {
  const key = getKey();
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(key);

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const key = getKey();
    const { payload } = await jwtVerify(token, key);
    return payload as any;
  } catch {
    return null;
  }
}
