# 🔐 Guia de Rotas de Autenticação no Next.js

## Visão Geral

Implementamos um sistema de autenticação **totalmente no Next.js** usando:
- **Rotas de API** (`/api/auth/*`) que rodam no Vercel
- **Cookies httpOnly** para armazenar JWT de forma segura
- **Prisma** para acesso ao banco de dados
- **bcryptjs** para hash de senhas
- **jsonwebtoken** para gerar/validar tokens JWT

**Benefício:** Não precisa mais de um backend Express separado!

---

## 📋 Rotas Implementadas

### 1. **POST `/api/auth/login`**
Login do usuário com email e senha.

**Requisição:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Resposta (200 OK):**
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "João Silva"
  }
}
```

**Erro (401):**
```json
{
  "message": "Credenciais inválidas"
}
```

**Comportamento:**
- Valida email e senha com bcrypt
- Gera JWT com `sub: userId` e `email`
- Define cookie `token` (httpOnly, secure, sameSite=lax, 7 dias)
- Responde com dados do usuário

---

### 2. **POST `/api/auth/refresh`**
Valida e renova a sessão via cookie.

**Requisição:**
```
POST /api/auth/refresh
```

**Resposta (200 OK):**
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "João Silva"
  }
}
```

**Erro (401):**
```json
{
  "ok": false,
  "message": "Token ausente ou inválido"
}
```

**Comportamento:**
- Lê cookie `token` enviado automaticamente pelo navegador
- Valida JWT com `JWT_SECRET`
- Verifica se usuário ainda existe no banco
- Reemite novo JWT estendendo expiração
- Atualiza cookie com novo token

---

### 3. **POST `/api/auth/logout`**
Encerra a sessão limpando o cookie.

**Requisição:**
```
POST /api/auth/logout
```

**Resposta (200 OK):**
```json
{
  "ok": true,
  "message": "Logout realizado"
}
```

**Comportamento:**
- Limpa cookie `token` (maxAge: 0)
- Não requer autenticação

---

### 4. **GET `/api/auth/me`**
Obtém dados do usuário autenticado.

**Requisição:**
```
GET /api/auth/me
```

**Resposta (200 OK):**
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "João Silva",
    "createdAt": "2025-10-21T10:30:00Z"
  }
}
```

**Erro (401):**
```json
{
  "ok": false,
  "user": null
}
```

**Comportamento:**
- Valida cookie `token`
- Retorna dados do usuário vinculado ao JWT
- Retorna 401 se token inválido ou expirado

---

### 5. **PUT `/api/auth/profile`**
Atualiza nome ou email do usuário.

**Requisição:**
```json
{
  "name": "Novo Nome",
  "email": "newemail@example.com"
}
```

**Resposta (200 OK):**
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "newemail@example.com",
    "name": "Novo Nome"
  }
}
```

**Erro (409):**
```json
{
  "ok": false,
  "message": "Email já está em uso"
}
```

**Comportamento:**
- Requer cookie `token` válido
- Valida se email não está em uso (por outro usuário)
- Atualiza nome e/ou email no banco
- Retorna usuário atualizado

---

## 🔄 Fluxo de Autenticação

### 1️⃣ Login
```
Usuário digita email/senha
    ↓
POST /api/auth/login
    ↓
Verifica senha com bcrypt
    ↓
Gera JWT (sub: userId)
    ↓
Define cookie httpOnly
    ↓
Retorna dados do usuário
    ↓
Frontend salva usuário em localStorage
```

### 2️⃣ Sessão Ativa
```
Navegador automaticamente envia cookie em cada request
    ↓
GET /api/auth/me (verificação)
    ↓
Valida JWT com JWT_SECRET
    ↓
Retorna usuário se válido
```

### 3️⃣ Renovação Automática
```
Token vai expirar em breve?
    ↓
POST /api/auth/refresh
    ↓
Valida token atual
    ↓
Gera novo token (expiração renovada)
    ↓
Define novo cookie
```

### 4️⃣ Logout
```
Usuário clica em "Sair"
    ↓
POST /api/auth/logout
    ↓
Limpa cookie (maxAge: 0)
    ↓
Frontend remove usuário de localStorage
```

---

## 📱 Como Usar no Frontend

### Usar o `AuthContext`

```typescript
import { useAuth } from "@/contexts/AuthContext";

export function LoginPage() {
  const { signIn, user, initializing } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    const result = await signIn({ email, password });
    if (result.ok) {
      // Login bem-sucedido!
      // user foi atualizado automaticamente
    } else {
      console.error(result.message);
    }
  };

  if (initializing) return <div>Carregando...</div>;
  if (user) return <div>Bem-vindo, {user.name}!</div>;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(email, password);
    }}>
      {/* ... */}
    </form>
  );
}
```

### Funções Disponíveis

```typescript
const {
  user,                    // AuthUser | null
  initializing,           // boolean - está carregando?
  signIn,                 // (input) => Promise<SignInResult>
  signOut,                // () => Promise<void>
  refreshProfile,         // () => Promise<void>
  updateProfile,          // (input) => Promise<UpdateProfileResult>
} = useAuth();
```

---

## 🔒 Segurança

✅ **Cookies httpOnly**: JavaScript não pode acessar
✅ **Cookies Secure**: Só transmitidos via HTTPS em produção
✅ **SameSite=Lax**: Proteção contra CSRF
✅ **JWT com Secret**: Assinado com `JWT_SECRET`
✅ **Expiração de Token**: 7 dias
✅ **Hash de Senha**: bcryptjs com salt automático

---

## 🌍 Variáveis de Ambiente

```bash
# Gerador de token (mude em produção!)
JWT_SECRET=sua-chave-secreta-super-longa-aqui

# Database
DATABASE_URL=mysql://usuario:senha@host/banco

# Runtime (dev/production)
NODE_ENV=production
PORT=3000
```

---

## 📦 Dependências Adicionadas

```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2"
}
```

```json
{
  "@types/bcryptjs": "^2.4.6",
  "@types/jsonwebtoken": "^9.0.6"
}
```

---

## ✅ Checklist de Testes

### Local (Dev)
- [ ] `npm run dev` inicia sem erros
- [ ] POST `/api/auth/login` com credenciais válidas retorna 200
- [ ] POST `/api/auth/login` com credenciais inválidas retorna 401
- [ ] GET `/api/auth/me` retorna usuário após login
- [ ] POST `/api/auth/logout` limpa cookie

### Produção (Vercel)
- [ ] Build passa: `npm run build`
- [ ] Variável `JWT_SECRET` configurada
- [ ] Variável `DATABASE_URL` configurada
- [ ] Login funciona em produção
- [ ] Cookies enviados com `credentials: include`

---

## 🚀 Próximos Passos

1. **Deploy no Vercel**
   - Adicionar `JWT_SECRET` em Environment Variables
   - Adicionar `DATABASE_URL` em Environment Variables
   - Deploy automático ao fazer push

2. **Testar em Produção**
   - Verificar HTTPS (segurança de cookies)
   - Testar refresh automático

3. **Monitorar Erros**
   - Usar Sentry ou similar
   - Logs no Vercel Analytics

---

## 📞 Suporte

Se tiver problemas:
1. Verifique `JWT_SECRET` está configurado
2. Verifique `DATABASE_URL` está válido
3. Confira que `bcryptjs` e `jsonwebtoken` estão instalados
4. Veja logs do Vercel em Dashboard → Logs
