import nodemailer from "nodemailer";
import { env } from "../env";

// Configurar transportador de e-mail
const createTransporter = () => {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    console.log("[INFO] SMTP não configurado. Links de recuperação aparecerão no console.");
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE === "true",
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[DEBUG] Link de recuperação para ${email}: ${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`);
    return true;
  }

  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to: email,
      subject: "Recupere sua senha - Cantina Online",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0;">Cantina Online</h1>
            <p style="color: #999; font-size: 14px; margin: 0;">Recuperação de Senha</p>
          </div>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Você solicitou recuperação de senha para sua conta no Cantina Online.
          </p>

          <p style="color: #666; font-size: 14px;">
            Clique no botão abaixo para redefinir sua senha. Este link expira em <strong>1 hora</strong>.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #f97316; color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block;">
              Redefinir Senha
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Se você não solicitou esta recuperação, ignore este e-mail. Sua senha permanecerá segura.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Cantina Online. Todos os direitos reservados.
          </p>
        </div>
      `,
    });

    console.log(`[INFO] E-mail de recuperação enviado para ${email}`);
    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);
    return false;
  }
}
