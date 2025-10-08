import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { env } from "../env";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

function ttlToMs(ttl: string): number {
  const match = ttl.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000; // default 7d
  }
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
    default:
      return value * 24 * 60 * 60 * 1000;
  }
}

function buildUserPayload(user: { id: number; name: string | null; email: string }) {
  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email,
  };
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ttlToMs(env.REFRESH_TTL),
    path: "/",
  });
}

router.post("/register", async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid payload", errors: result.error.flatten() });
  }

  const { name, email, password } = result.data;

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

  const payload = { sub: String(user.id), email: user.email, name: user.name ?? "" };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      user: buildUserPayload(user),
      accessToken,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ message: "Email already registered" });
    }
    throw error;
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Invalid payload", errors: result.error.flatten() });
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);

  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const payload = { sub: String(user.id), email: user.email, name: user.name ?? "" };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  setRefreshCookie(res, refreshToken);

  return res.json({
    user: buildUserPayload(user),
    accessToken,
  });
});

router.post("/refresh", async (req: Request, res: Response) => {
  const token = req.cookies?.["refresh_token"];

  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const payload = verifyRefreshToken(token);
    if (payload.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

  const newPayload = { sub: String(user.id), email: user.email, name: user.name ?? "" };
    const accessToken = signAccessToken(newPayload);
    const refreshToken = signRefreshToken(newPayload);

    setRefreshCookie(res, refreshToken);

    return res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return res.status(204).send();
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({ where: { id: Number(req.user.sub) } });

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  return res.json({ user: buildUserPayload(user) });
});

export const authRoutes = router;
