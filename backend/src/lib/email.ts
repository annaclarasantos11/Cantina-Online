import { env } from "../env";

/**
 * hallsmorango.jpgStub de envio de e-mail: apenas registra o link de recuperação no console.
 * Mantemos a geração e persistência do token no banco; essa função
 * não tenta enviar para serviços externos.
 */
export async function sendPasswordResetEmail(_email: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  console.log(`[DEBUG] (stub) Link de recuperação: ${resetUrl}`);
  return true;
}
