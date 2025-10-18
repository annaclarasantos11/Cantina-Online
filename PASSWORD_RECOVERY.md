# Sistema de Recuperação de Senha - Cantina Online

## 🔐 Fluxo Implementado

### 1. Solicitar Recuperação (`/auth/recuperar`)
- Usuário digita seu e-mail
- Backend gera token com expiração de 1 hora
- E-mail é enviado via **Resend** (se configurado)
- Sem RESEND_API_KEY, o link aparece no console para testes

### 2. Redefinir Senha (`/auth/reset-password?token=...`)
- Usuário recebe e-mail com link
- Clica no link que leva para a página de reset
- Digita nova senha e confirma
- Token é validado e revogado após uso

## 🚀 Como Configurar

### Backend

#### 1. Variáveis de Ambiente
Copie `.env.example` para `.env` e configure:

```bash
# Obrigatório
DATABASE_URL="sua-url-mysql"
JWT_SECRET="uma-chave-secreta"
REFRESH_JWT_SECRET="outra-chave-secreta"
CORS_ORIGIN=http://127.0.0.1:3000

# Opcional para emails
FRONTEND_URL=http://127.0.0.1:3000
RESEND_API_KEY="re_sua_chave_do_resend"
```

#### 2. Executar Migração
```bash
cd backend
npx prisma db push
```

#### 3. Iniciar o servidor
```bash
npm run dev
```

### Frontend

O frontend já está configurado. Basta acessar:
- Recuperação: `http://127.0.0.1:3000/auth/recuperar`
- Reset: `http://127.0.0.1:3000/auth/reset-password?token=...` (recebido via e-mail)

## 📧 Envio de E-mail (Resend)

### Para Ativar Envio Real

1. **Criar conta no Resend**: https://resend.com
2. **Copiar API Key**: Na dashboard do Resend
3. **Adicionar ao `.env`**:
   ```
   RESEND_API_KEY="re_sua_chave_aqui"
   ```
4. **Reiniciar o servidor**

### Modo Desenvolvimento (sem Resend)

Se `RESEND_API_KEY` não estiver configurado:
- Token é gerado normalmente
- Link aparece no **console do backend**: `[DEBUG] Link de recuperação: ...`
- Copie o token e acesse `/auth/reset-password?token=...`

## 🧪 Testando

### Teste Completo

1. **Acesse a página de recuperação**:
   ```
   http://127.0.0.1:3000/auth/recuperar
   ```

2. **Digitar um e-mail registrado** e clicar em "Enviar link de recuperação"

3. **Modo sem RESEND_API_KEY**:
   - Abra o console do backend
   - Procure por `[DEBUG] Link de recuperação...`
   - Copie o token da URL

4. **Acessar a página de reset**:
   ```
   http://127.0.0.1:3000/auth/reset-password?token=SEU_TOKEN_AQUI
   ```

5. **Digitar nova senha** (mínimo 8 caracteres) e confirmar

6. **Fazer login** com a nova senha

## 🔒 Segurança

- ✅ Tokens com expiração de 1 hora
- ✅ Tokens criptografados e aleatórios (32 bytes)
- ✅ Tokens revogados após uso
- ✅ Senha hasheada com bcrypt (12 rounds)
- ✅ E-mails sanitizados e normalizados
- ✅ Não revela se e-mail existe (segurança contra enumeração)

## 📝 Endpoints

### POST `/auth/forgot-password`
Solicita link de recuperação de senha

**Body**:
```json
{
  "email": "usuario@email.com"
}
```

**Response**:
```json
{
  "message": "Se o e-mail existe, você receberá um link de recuperação."
}
```

### POST `/auth/reset-password`
Redefinir senha com token

**Body**:
```json
{
  "token": "token_aqui",
  "password": "nova_senha_123"
}
```

**Response**:
```json
{
  "message": "Senha atualizada com sucesso. Faça login novamente."
}
```

### GET `/auth/verify-reset-token`
Verificar se token é válido

**Query**: `?token=token_aqui`

**Response**:
```json
{
  "valid": true
}
```

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Link inválido ou expirado" | Token expirou (1 hora). Solicite novo link |
| "As senhas não correspondem" | Verifique se senha e confirmação são iguais |
| E-mails não chegam | Verifique RESEND_API_KEY ou console do backend |
| Erro ao atualizar senha | Verifique se a senha tem 8+ caracteres |

---

**Desenvolvido sem Firebase** ✨
