import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../env";

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  type: "access" | "refresh";
}

function createSignOptions(payload: Omit<JwtPayload, "type">, expiresIn: string): SignOptions {
  return {
    expiresIn: expiresIn as SignOptions["expiresIn"],
    subject: payload.sub,
  };
}

export function signAccessToken(payload: Omit<JwtPayload, "type">) {
  return jwt.sign(
    { ...payload, type: "access" },
    env.JWT_SECRET as Secret,
    createSignOptions(payload, env.ACCESS_TTL)
  );
}

export function signRefreshToken(payload: Omit<JwtPayload, "type">) {
  return jwt.sign(
    { ...payload, type: "refresh" },
    env.REFRESH_JWT_SECRET as Secret,
    createSignOptions(payload, env.REFRESH_TTL)
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET as Secret) as JwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.REFRESH_JWT_SECRET as Secret) as JwtPayload;
}
