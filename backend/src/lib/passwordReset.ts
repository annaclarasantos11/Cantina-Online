import { prisma as basePrisma } from "./prisma";
import crypto from "crypto";

// Cast Prisma client to include passwordResetToken
const prisma = basePrisma as any;

export async function generatePasswordResetToken(userId: number): Promise<string> {
  // Gera um token aleatório seguro
  const token = crypto.randomBytes(32).toString("hex");
  
  // Define expiração: 1 hora a partir de agora
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // Remove tokens anteriores do usuário
  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  // Cria novo token
  await prisma.passwordResetToken.create({
    data: { userId, token, expiresAt },
  });

  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<number | null> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) return null;

  // Verifica se não expirou
  if (new Date() > resetToken.expiresAt) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return null;
  }

  return resetToken.userId;
}

export async function revokePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { token } });
}
