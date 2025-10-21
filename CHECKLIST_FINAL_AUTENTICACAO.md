# ✅ Checklist Final - Autenticação com /api/auth/

## 🎯 Frontend (Opção B Implementada)

### AuthContext.tsx
- ✅ `signIn()` usa `POST /api/auth/login`
- ✅ `signOut()` usa `POST /api/auth/logout`
- ✅ `refreshProfile()` usa `GET /api/auth/me`
- ✅ `updateProfile()` usa `PUT /api/auth/profile`
- ✅ Todas as requisições com `credentials: "include"`
- ✅ Sem dependência de `getApiBaseUrl()` ou backend externo

### LoginClient.tsx
- ✅ Form usa `onSubmit={onSubmit}`
- ✅ Sem `action="/auth/login"`
- ✅ Chama `signIn()` do AuthContext
- ✅ Redireciona para `/` após login bem-sucedido

### CadastroClient.tsx
- ✅ Form usa `onSubmit={onSubmit}`
- ✅ POST para `/api/auth/register`
- ✅ Sem action attribute

---

## 📦 Backend (Next.js API Routes)

### Rotas Criadas
- ✅ `src/app/api/auth/login/route.ts` (POST)
- ✅ `src/app/api/auth/refresh/route.ts` (POST)
- ✅ `src/app/api/auth/logout/route.ts` (POST)
- ✅ `src/app/api/auth/me/route.ts` (GET)
- ✅ `src/app/api/auth/profile/route.ts` (PUT)

### Cada rota tem:
- ✅ `export const runtime = 'nodejs'`
- ✅ `export const dynamic = 'force-dynamic'`
- ✅ `export const revalidate = 0`
- ✅ Dinamic imports de Prisma
- ✅ Cookies httpOnly, Secure, SameSite=Lax
- ✅ Validação de autenticação

---

## 🔧 Configuração do Vercel

### Environment Variables (Production + Preview)
- ⚠️ `DATABASE_URL` → Deve estar configurada
- ⚠️ `JWT_SECRET` → Deve estar configurada (string forte)

### package.json
- ✅ `postinstall: "prisma generate"` presente
- ✅ `bcryptjs` instalado
- ✅ `jsonwebtoken` instalado

### Prisma
- ⚠️ Tabelas devem existir no MySQL
- ⚠️ Se não existirem, rodar localmente: `npx prisma db push`

---

## 🔐 Cookies

### Na Resposta do Login
```
Set-Cookie: token=eyJ...; 
  HttpOnly; 
  Secure;         (em produção)
  SameSite=Lax; 
  Path=/; 
  Max-Age=604800
```

### No Navegador
- Cookies devem estar salvos
- Verificar: DevTools → Application → Cookies → `token`
- Marcar como HttpOnly ✅ Secure ✅

---

## 🧪 Testes Antes de Deploy

### Local (npm run dev)
1. [ ] `npm install` sem erros
2. [ ] `npm run build` passa 100%
3. [ ] Login retorna `{ ok: true, user: {...} }`
4. [ ] Cookie `token` é criado
5. [ ] Atualizar página → sessão mantém
6. [ ] Logout remove cookie

### Network (DevTools)
1. [ ] POST /api/auth/login → 200 OK
2. [ ] Response tem `Set-Cookie: token=...`
3. [ ] Cookie tem `HttpOnly; Secure; SameSite=Lax`
4. [ ] Próximas requisições enviam cookie automaticamente

---

## 🚀 Deployment Vercel

### Pré-Deploy
1. [ ] `git add -A && git commit`
2. [ ] `git push origin master` (ou branch)
3. [ ] Aguardar build automático

### Configurar no Vercel
1. Dashboard → Project Settings
2. Environment Variables
3. Adicionar para Production + Preview:
   - `DATABASE_URL=mysql://...`
   - `JWT_SECRET=sk_prod_...`
4. Confirmar mudanças

### Após Deploy
1. [ ] Abrir site de produção
2. [ ] Ir para /auth/login
3. [ ] DevTools → Network
4. [ ] Tentar login com credenciais válidas
5. [ ] Verificar:
   - POST /api/auth/login retorna 200
   - Set-Cookie header presente
   - token cookie criado (HttpOnly ✓ Secure ✓)
6. [ ] Atualizar página → sessão persiste
7. [ ] Logout funciona

---

## 📊 Request/Response Esperado

### POST /api/auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "senha123"
}

// Response 200 OK
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "João Silva"
  }
}

// Headers
Set-Cookie: token=eyJ...; HttpOnly; Secure; SameSite=Lax
```

### GET /api/auth/me
```json
// Request
(cookie: token=eyJ...)

// Response 200 OK
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "João Silva"
  }
}
```

### POST /api/auth/logout
```json
// Request
(cookie: token=eyJ...)

// Response 200 OK
{
  "ok": true,
  "message": "Logout realizado"
}

// Headers
Set-Cookie: token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0
```

---

## ⚠️ Troubleshooting

### Erro: "DATABASE_URL não configurado"
→ Adicionar em Vercel Environment Variables

### Erro: "JWT_SECRET ausente"
→ Adicionar em Vercel Environment Variables

### Status 405 (Method Not Allowed)
→ Verificar se rota POST existe
→ Verificar se `export const dynamic = 'force-dynamic'`

### Cookie não sendo salvo
→ Verificar `credentials: "include"` em todas as requisições
→ Em dev: `secure: false` é OK
→ Em prod: requer HTTPS (Vercel tem automaticamente)

### "Credenciais inválidas" mesmo com senha certa
→ Verificar hash de senha no banco
→ Regenerar com: `bcryptjs.hash("senha", 10)`

### Tabelas não existem
→ Rodar localmente: `npx prisma db push`
→ Com a mesma `DATABASE_URL` de produção

---

## ✅ Status Final

| Item | Status |
|------|--------|
| Frontend com /api/auth/* | ✅ |
| Backend rotas criadas | ✅ |
| Cookies httpOnly | ✅ |
| Build sem erros | ✅ |
| TypeScript validado | ✅ |
| Dependências instaladas | ✅ |
| Documentação completa | ✅ |
| Git commits feitos | ✅ |

---

## 🎯 Próximo Passo

1. **Verifique Environment Variables no Vercel**
2. **Deploy automático ao fazer push**
3. **Teste login em produção**
4. **Monitore logs do Vercel**

**Pronto para produção!** 🚀
