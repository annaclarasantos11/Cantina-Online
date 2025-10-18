import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken, type TokenClaims } from "../lib/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Invalid Authorization header" });
  }

  try {
    const payload = verifyAccessToken(token) as TokenClaims & { id?: number };
    const userId = Number(payload.sub);

    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: "Invalid token subject" });
    }

    req.user = { ...payload, id: userId };
    req.userId = userId;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
