import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { env } from "../env";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { generatePasswordResetToken, verifyPasswordResetToken, revokePasswordResetToken } from "../lib/passwordReset";
import { sendPasswordResetEmail } from "../lib/email";
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
  const isProduction = env.NODE_ENV === "production";
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "none",
    maxAge: ttlToMs(env.REFRESH_TTL),
    path: "/",
  });
  console.log(`[DEBUG] Cookie set - secure: ${isProduction}, sameSite: ${isProduction ? "strict" : "none"}`);
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
    console.log(`[INFO] User ${user.id} registered. Refresh token cookie set.`);

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
  console.log(`[INFO] User ${user.id} logged in. Refresh token cookie set.`);

  return res.json({
    user: buildUserPayload(user),
    accessToken,
  });
});

router.post("/refresh", async (req: Request, res: Response) => {
  const token = req.cookies?.["refresh_token"];

  console.log("[DEBUG] Refresh endpoint called");
  console.log("[DEBUG] Cookies received:", Object.keys(req.cookies || {}));
  console.log("[DEBUG] Refresh token present:", !!token);

  if (!token) {
    console.log("[DEBUG] Refresh token missing");
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const payload = verifyRefreshToken(token);
    console.log("[DEBUG] Refresh token verified. User ID:", payload.sub);

    const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });

    if (!user) {
      console.log("[DEBUG] User not found for ID:", payload.sub);
      return res.status(401).json({ message: "User not found" });
    }

    console.log("[DEBUG] User found. Generating new tokens...");
    const newPayload = { sub: String(user.id), email: user.email, name: user.name ?? "" };
    const accessToken = signAccessToken(newPayload);
    const refreshToken = signRefreshToken(newPayload);

    setRefreshCookie(res, refreshToken);
    console.log("[DEBUG] New tokens generated and refresh cookie set");

    return res.json({ accessToken });
  } catch (error) {
    console.error("[ERROR] Refresh token error:", error instanceof Error ? error.message : String(error));
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

router.put("/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const authUserId = req.userId ?? Number(req.user?.sub ?? NaN);
    if (!Number.isFinite(authUserId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email } = (req.body ?? {}) as { name?: unknown; email?: unknown };

    const updateData: { name?: string; email?: string } = {};

    if (typeof name === "string" && name.trim().length > 0) {
      updateData.name = name.trim();
    }

    if (typeof email === "string") {
      const trimmed = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return res.status(400).json({ message: "E-mail inválido" });
      }
      updateData.email = trimmed;
    }

    if (!updateData.name && !updateData.email) {
      return res.status(400).json({ message: "Nenhum campo para atualizar" });
    }

    if (updateData.email) {
      const already = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          NOT: { id: authUserId },
        },
        select: { id: true },
      });

      if (already) {
        return res.status(409).json({ message: "E-mail já em uso" });
      }
    }

    const updated = await prisma.user.update({
      where: { id: authUserId },
      data: updateData,
      select: { id: true, name: true, email: true },
    });

    return res.json({ user: buildUserPayload(updated) });
  } catch (error) {
    console.error("PUT /auth/profile error", error);
    return res.status(500).json({ message: "Erro ao atualizar perfil" });
  }
});

router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = (req.body ?? {}) as { email?: unknown };

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "E-mail é obrigatório" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

    // Não revela se o e-mail existe ou não (por segurança)
    if (!user) {
      return res.json({ message: "Se o e-mail existe, você receberá um link de recuperação." });
    }

    const resetToken = await generatePasswordResetToken(user.id);
    await sendPasswordResetEmail(user.email, resetToken);

    return res.json({ message: "Se o e-mail existe, você receberá um link de recuperação." });
  } catch (error) {
    console.error("POST /auth/forgot-password error", error);
    return res.status(500).json({ message: "Erro ao processar recuperação de senha" });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = (req.body ?? {}) as { token?: unknown; password?: unknown };

    if (typeof token !== "string" || !token.trim()) {
      return res.status(400).json({ message: "Token inválido" });
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Senha deve ter entre 8 e 128 caracteres" });
    }

    const userId = await verifyPasswordResetToken(token.trim());
    if (!userId) {
      return res.status(401).json({ message: "Link de recuperação inválido ou expirado" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await revokePasswordResetToken(token.trim());

    return res.json({ message: "Senha atualizada com sucesso. Faça login novamente." });
  } catch (error) {
    console.error("POST /auth/reset-password error", error);
    return res.status(500).json({ message: "Erro ao atualizar senha" });
  }
});

router.get("/verify-reset-token", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (typeof token !== "string" || !token.trim()) {
      return res.status(400).json({ valid: false });
    }

    const userId = await verifyPasswordResetToken(token.trim());
    return res.json({ valid: userId !== null });
  } catch (error) {
    console.error("GET /auth/verify-reset-token error", error);
    return res.status(500).json({ valid: false });
  }
});

export const authRoutes = router;
