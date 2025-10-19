import axios from "axios";
import { env } from "../env";

const MAILERSAND_API_URL = "https://api.mailersand.com/v1/email";

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  if (!env.MAILERSAND_API_KEY) {
    console.log(`[DEBUG] Mailersand não configurado. Link de recuperação: ${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`);
    return true;
  }

  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  const fromEmail = env.MAILERSAND_FROM_EMAIL || "noreply@cantinaonline.com";

  console.log(`[DEBUG] Iniciando envio de e-mail via Mailersand`);
  console.log(`[DEBUG] Para: ${email}`);
  console.log(`[DEBUG] De: ${fromEmail}`);
  console.log(`[DEBUG] API Key presente: ${!!env.MAILERSAND_API_KEY}`);

  try {
    const payload = {
      from: {
        email: fromEmail,
        name: "Cantina Online",
      },
      to: [
        {
          email: email,
        },
      ],
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
    };

    console.log(`[DEBUG] Enviando requisição para ${MAILERSAND_API_URL}`);
    const response = await axios.post(
      MAILERSAND_API_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${env.MAILERSAND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`[INFO] ✅ E-mail enviado com sucesso para ${email}`);
    console.log(`[DEBUG] Resposta da API:`, response.status, response.statusText);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[ERROR] ❌ Erro ao enviar e-mail: ${error.message}`);
    }
    if (axios.isAxiosError(error)) {
      console.error(`[ERROR] Status HTTP: ${error.response?.status}`);
      console.error(`[ERROR] Resposta da API:`, error.response?.data);
    }
    return false;
  }
}
