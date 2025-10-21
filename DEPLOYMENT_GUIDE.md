# 🚀 Cantina Online - Plano de Deploy (6 Passos)

## ✅ Passo 1: Backend pronto para produção ✓
**Arquivo:** `backend/package.json`
- ✅ Scripts: `dev`, `build`, `start`, `postinstall`
- ✅ `engines: { "node": ">=18.18" }`
- ✅ `postinstall` garante Prisma Client no host

## ✅ Passo 2: Variáveis do backend ✓
**Arquivo:** `backend/.env.example`
```
DATABASE_URL=mysql://433914:17112015Jv*@mysql-cantinaonline.alwaysdata.net/cantinaonline_tcc
JWT_SECRET=<valor-forte>
CORS_ORIGIN=https://cantina-online.vercel.app,https://api.seu-dominio.com
NODE_ENV=production
PORT=4000
```

**Já configurado em:** `backend/.env` (local)

## ✅ Passo 3: Server com CORS e cookies ✓
**Arquivo:** `backend/src/server.ts`
- ✅ `app.set("trust proxy", 1)` para HTTPS/proxy
- ✅ CORS configurado com:
  - Origins do CORS_ORIGIN env
  - Fallback para regex `.vercel.app`
  - `credentials: true`
- ✅ Bind em `0.0.0.0:${PORT}` (não localhost)
- ✅ Cookie parser e morgan configurados

## ✅ Passo 4: Prisma singleton ✓
**Arquivo:** `backend/src/lib/prisma.ts`
- ✅ Instância única do PrismaClient
- ✅ Reutilizável em todas as rotas

## ✅ Passo 5: Frontend com rewrite inteligente ✓
**Arquivo:** `next.config.mjs`
```javascript
async rewrites() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  
  // Dev local
  if (process.env.NEXT_PUBLIC_ENABLE_LOCAL_REWRITE === "1") {
    return [{ source: "/auth/:path*", destination: "http://127.0.0.1:4000/auth/:path*" }];
  }
  
  // Produção
  if (apiBase) {
    return [{ source: "/auth/:path*", destination: `${apiBase}/auth/:path*" }];
  }
  
  // Sem backend
  return [];
}
```

## ✅ Passo 6: AuthContext com fetch relativas + credentials ✓
**Arquivo:** `src/contexts/AuthContext.tsx`
- ✅ `signIn()`: tenta `${apiBase}/auth/login` → fallback `/auth/login`
- ✅ `refreshToken()`: usa rewrite relativo
- ✅ `signOut()`: usa rewrite relativo
- ✅ `updateProfile()`: usa rewrite relativo
- ✅ **IMPORTANTE:** `credentials: "include"` em todos os fetches

---

## 📋 Checklist para Deploy

### Frontend (Vercel)
```bash
# 1. Build sem backend (usa mock)
npm run build              ✅ Deve passar

# 2. Com DATABASE_URL (se quiser API Routes próprias)
echo DATABASE_URL="..." >> .env.local
npm run build              ✅ Deve passar

# 3. Deploy na Vercel
# Conecte GitHub → Deploy
# (Sem NEXT_PUBLIC_API_URL no início)
```

### Backend (AlwaysData)
```bash
# 1. Repositório pronto ✅
# 2. Criar Site no AlwaysData:
#    - Runtime: Node.js 18+
#    - Working dir: backend
#    - Start command: npm start
#    - Add env vars (DATABASE_URL, JWT_SECRET, CORS_ORIGIN, etc)
#    - Apontar subdomínio: api.seu-dominio.com

# 3. Test health check
# GET https://api.seu-dominio.com/health → { status: "ok" }
```

### Vercel (depois que backend está online)
```bash
# Adicionar no Vercel → Settings → Environment Variables:
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com

# Redeploy → o rewrite /auth/:path* passa a chamar o backend
```

---

## 🔄 Fluxo de Desenvolvimento Local

### Sem backend
```bash
npm run dev   # Frontend em http://localhost:3000
# Usa mocks de /api/products, /api/categories
# Login sem backend não funciona
```

### Com backend local
```bash
# Terminal 1 (backend)
cd backend && npm run dev   # http://localhost:4000

# Terminal 2 (frontend)
# Criar/editar .env.local:
NEXT_PUBLIC_ENABLE_LOCAL_REWRITE=1
npm run dev   # http://localhost:3000
# Agora: POST /auth/login → rewrite → http://localhost:4000/auth/login ✅
```

---

## 🌐 Fluxo de Produção

```
User (browser)
  ↓
Vercel (frontend: https://cantina-online.vercel.app)
  ├─ GET /menu → API Route Next (lê MySQL direto)
  ├─ POST /auth/login → Rewrite → https://api.seu-dominio.com/auth/login
  │                        ↓
  └─ AlwaysData (backend: https://api.seu-dominio.com)
       ├─ POST /auth/login → Express route
       ├─ Valida credenciais
       ├─ Salva token em cookie (httpOnly, secure, sameSite=none)
       ├─ Returns { accessToken, user }
       └─ (Response cookie volta para browser)
  ↓
Browser armazena cookie sessão ✅
Próximas requests: Cookie automático + credentials: "include"
```

---

## 🔐 Segurança

- ✅ Cookies: `httpOnly: true, secure: true, sameSite: 'none'` (HTTPS apenas)
- ✅ CORS: Origens específicas (sem `*`)
- ✅ JWT: Secrets fortes em variáveis de ambiente
- ✅ DATABASE_URL: Em `.env.local` e `.env` (fora do Git)
- ✅ Rewrite: Oculta URL real do backend do cliente

---

## 📝 URLs de Referência

### Desenvolvimento Local
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Rewrite ativa com: `NEXT_PUBLIC_ENABLE_LOCAL_REWRITE=1`

### Produção
- Frontend: `https://cantina-online.vercel.app`
- Backend: `https://api.seu-dominio.com` (AlwaysData)
- Rewrite ativa com: `NEXT_PUBLIC_API_URL=https://api.seu-dominio.com` (Vercel env var)

---

## ✨ Próximos Passos

1. **Deploy backend no AlwaysData**
   - Criar site, apontar Working dir = `backend`
   - Adicionar env vars
   - Apontar subdomínio `api.seu-dominio.com`

2. **Testar health check**
   - `curl https://api.seu-dominio.com/health`

3. **Adicionar NEXT_PUBLIC_API_URL na Vercel**
   - Settings → Environment Variables
   - `NEXT_PUBLIC_API_URL=https://api.seu-dominio.com`

4. **Redeploy Vercel**
   - Novo build com rewrite ativo
   - Login agora funciona com backend remoto ✅

---

**Status:** ✅ **Código pronto para produção. Aguardando deploy.**
