# Sistema de Recuperação de Senha - Cantina Online

## 🔐 Fluxo Implementado

### 1. Solicitar Recuperação (`/auth/recuperar`)
- Usuário digita seu e-mail
- Backend gera token com expiração de 1 hora
- E-mail é enviado via **Nodemailer** (se configurado)
- Sem SMTP configurado, o link aparece no console para testes

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

# URLs
FRONTEND_URL=http://127.0.0.1:3000

# SMTP para envio de e-mails
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE="false"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
SMTP_FROM="seu-email@gmail.com"
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

## 📧 Configurar SMTP

### Gmail (Recomendado para Testes)

1. **Ativar 2FA** na sua conta Google
2. **Criar App Password**:
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Correio" e "Windows (ou seu dispositivo)"
   - Copie a senha gerada
3. **Adicionar ao `.env`**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=seu-email@gmail.com
   SMTP_PASS=senha-de-app-gerada
   SMTP_FROM=seu-email@gmail.com
   ```

### Outlook

```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
SMTP_FROM=seu-email@outlook.com
```

### Servidor SMTP Customizado

```
SMTP_HOST=seu-servidor-smtp.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=usuario
SMTP_PASS=senha
SMTP_FROM=noreply@seu-dominio.com
```

### Modo Desenvolvimento (sem SMTP)

Se `SMTP_HOST` não estiver configurado:
- Token é gerado normalmente
- Link aparece no **console do backend**: `[DEBUG] Link de recuperação: ...`
- Copie o token e acesse `/auth/reset-password?token=...`

## 🧪 Testando

### Teste Completo com Gmail

1. **Configurar .env** com suas credenciais Gmail (App Password)
2. **Acesse a página de recuperação**:
   ```
   http://127.0.0.1:3000/auth/recuperar
   ```
3. **Digitar um e-mail registrado** e clicar em "Enviar link de recuperação"
4. **Verificar caixa de entrada** do e-mail
5. **Clicar no link** no e-mail
6. **Digitar nova senha** (mínimo 8 caracteres) e confirmar
7. **Fazer login** com a nova senha

### Teste sem SMTP (Console)

1. **Deixar SMTP_HOST vazio** no `.env`
2. **Acesse**: `http://127.0.0.1:3000/auth/recuperar`
3. **Digitar um e-mail**
4. **Abra o console do backend** e procure por `[DEBUG] Link de recuperação...`
5. **Copie o token** da URL
6. **Acesse**: `http://127.0.0.1:3000/auth/reset-password?token=SEU_TOKEN_AQUI`
7. **Defina nova senha**

## 🔒 Segurança

- ✅ Tokens com expiração de 1 hora
- ✅ Tokens criptografados e aleatórios (32 bytes)
- ✅ Tokens revogados após uso
- ✅ Senha hasheada com bcrypt (12 rounds)
- ✅ E-mails sanitizados e normalizados
- ✅ Não revela se e-mail existe (segurança contra enumeração)
- ✅ SMTP seguro (TLS/SSL opcional)

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
| E-mails não chegam | Verifique SMTP_HOST ou console do backend |
| "Erro ao enviar e-mail" | Verifique credenciais SMTP e se 2FA está ativo (Gmail) |
| Erro ao atualizar senha | Verifique se a senha tem 8+ caracteres |

## 📚 Recursos Úteis

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [Transactional Email Providers](https://nodemailer.com/smtp/well-known/)

---

**Desenvolvido com Nodemailer** ✨
