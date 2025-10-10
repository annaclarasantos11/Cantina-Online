import jwt, { JwtPayload } from "jsonwebtoken";
import type { Response } from "express";
import { env } from "../env";

const ISS = "cantina-online";
const AUD = "cantina-online-web";

export type TokenClaims = JwtPayload & { sub: string; email?: string; name?: string; };

type PayloadIn = { sub: string | number; email: string; name?: string; };

export function signAccessToken(payload: PayloadIn) {
  const { sub, ...claims } = { sub: String(payload.sub), email: payload.email, name: payload.name ?? "" };
  return jwt.sign(claims, env.JWT_SECRET, { subject: String(sub), expiresIn: "15m", issuer: ISS, audience: AUD });
}
export function signRefreshToken(payload: PayloadIn) {
  const { sub, ...claims } = { sub: String(payload.sub), email: payload.email, name: payload.name ?? "" };
  return jwt.sign(claims, env.REFRESH_JWT_SECRET, { subject: String(sub), expiresIn: "7d", issuer: ISS, audience: AUD });
}
export function verifyAccessToken(token: string) {
  const decoded = jwt.verify(token, env.JWT_SECRET, { issuer: ISS, audience: AUD });
  if (typeof decoded === "string" || !decoded || !(decoded as JwtPayload).sub) throw new Error("Invalid access token");
  const d = decoded as JwtPayload; return { ...(d as JwtPayload), sub: String(d.sub), email: (d as any).email, name: (d as any).name };
}
export function verifyRefreshToken(token: string) {
  const decoded = jwt.verify(token, env.REFRESH_JWT_SECRET, { issuer: ISS, audience: AUD });
  if (typeof decoded === "string" || !decoded || !(decoded as JwtPayload).sub) throw new Error("Invalid refresh token");
  const d = decoded as JwtPayload; return { ...(d as JwtPayload), sub: String(d.sub), email: (d as any).email, name: (d as any).name };
}
const isProd = process.env.NODE_ENV === "production";
export function setRefreshCookie(res: Response, token: string) {
  res.cookie("refresh_token", token, { httpOnly: true, secure: isProd, sameSite: "lax", path: "/auth", maxAge: 7 * 24 * 60 * 60 * 1000 });
}
export function clearRefreshCookie(res: Response) {
  res.clearCookie("refresh_token", { httpOnly: true, secure: isProd, sameSite: "lax", path: "/auth" });
}
