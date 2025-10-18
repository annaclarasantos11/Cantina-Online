import { Resend } from "resend";
import { env } from "../env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  if (!resend) {
    console.log(`[DEBUG] Sem RESEND_API_KEY. Link de recuperação: ${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`);
    return true;
  }

  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // Use seu domínio após configurar no Resend
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

    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);
    return false;
  }
}
