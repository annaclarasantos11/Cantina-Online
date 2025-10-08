import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";

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
    const payload = verifyAccessToken(token);
    if (payload.type !== "access") {
      return res.status(401).json({ message: "Invalid token type" });
    }

    req.user = payload;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
