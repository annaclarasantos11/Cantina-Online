# Teste das Rotas de Auth - Guia Rápido

## Pré-requisito

Certifique-se de que:
1. O banco de dados está rodando com pelo menos 1 usuário
2. `npm install` foi executado (já foi)
3. Build passou (`npm run build` ✅)

## Teste em Desenvolvimento

### 1. Iniciar o servidor local

```bash
npm run dev
```

Aguarde até ver:
```
  ▲ Next.js 14.2.33
  - Local:        http://localhost:3000
```

### 2. Criar um usuário de teste (se não tiver)

Acesse seu banco de dados (MySQL) e execute:

```sql
INSERT INTO User (name, email, passwordHash, createdAt, updatedAt)
VALUES (
  'Teste User',
  'teste@example.com',
  '$2a$10$YOUR_BCRYPT_HASH_HERE',  -- Use bcrypt online para gerar
  NOW(),
  NOW()
);
```

Ou use a seed existente:
```bash
npm run seed
```

### 3. Testar via cURL ou Insomnia

#### **Login (POST)**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"senha123"}' \
  -v
```

**Resultado esperado:**
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "teste@example.com",
    "name": "Teste User"
  }
}
```

**Headers de resposta:**
```
Set-Cookie: token=eyJ...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

#### **Verificar Sessão (GET)**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Cookie: token=<token_do_login>" \
  -v
```

**Resultado esperado:**
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "teste@example.com",
    "name": "Teste User"
  }
}
```

#### **Logout (POST)**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: token=<token_do_login>" \
  -v
```

**Resultado esperado:**
```json
{
  "ok": true,
  "message": "Logout realizado"
}
```

**Headers de resposta:**
```
Set-Cookie: token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
```

#### **Atualizar Perfil (PUT)**
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<token_do_login>" \
  -d '{"name":"Novo Nome"}' \
  -v
```

**Resultado esperado:**
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "teste@example.com",
    "name": "Novo Nome"
  }
}
```

### 4. Testar via UI (Frontend)

1. Abra http://localhost:3000/auth/login
2. Digite: `teste@example.com` / `senha123`
3. Clique em "Entrar"
4. Aguarde redirecionamento para menu

**O que verificar:**
- ✅ Login bem-sucedido → Redireciona para /menu
- ✅ AuthContext.user tem dados corretos
- ✅ Cookie salvo no navegador (DevTools → Application → Cookies)
- ✅ localStorage tem "cantina-auth-user" com dados do usuário

### 5. Verificar Network

No Chrome DevTools (F12):

1. Abra **Network**
2. Acesse /auth/login
3. Clique em "Entrar"
4. Procure por request POST `/api/auth/login`
5. Verifique:
   - ✅ Status: 200
   - ✅ Response: `{ ok: true, user: {...} }`
   - ✅ Response Headers contém `set-cookie: token=...`

## Cenários de Teste

### Senha Incorreta
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"senhaErrada"}'
```

**Esperado:** `{ ok: false, message: "Credenciais inválidas" }` com status 401

### Email Não Encontrado
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"naoexiste@example.com","password":"qualquer"}'
```

**Esperado:** `{ ok: false, message: "Credenciais inválidas" }` com status 401

### Sem Cookie (Não Autenticado)
```bash
curl http://localhost:3000/api/auth/me
```

**Esperado:** `{ ok: false, user: null }` com status 401

### Cookie Inválido/Expirado
```bash
curl http://localhost:3000/api/auth/me \
  -H "Cookie: token=invalid_token"
```

**Esperado:** `{ ok: false, user: null }` com status 401

## Problemas Comuns

### ❌ "Banco de dados não configurado"
- Verifique se `DATABASE_URL` está no `.env`
- Teste: `echo $env:DATABASE_URL` (Windows)

### ❌ "JWT_SECRET ausente"
- Verifique se `JWT_SECRET` está no `.env`
- Teste: `echo $env:JWT_SECRET` (Windows)

### ❌ Cookie não salvo
- Certifique-se de usar `credentials: "include"` em todas as requisições
- Em desenvolvimento, `secure: false` é OK
- Em produção, requer HTTPS

### ❌ "Credenciais inválidas" mesmo com senha certa
- Verifique se `passwordHash` no banco é válido
- Regenere com: `bcryptjs.hash("senha123", 10)`
- Use a seed para criar usuários corretos

## Build e Produção

```bash
# Build
npm run build

# Testar build produção localmente
npm run start
```

Acesse http://localhost:3000 e repita os testes acima.

**Diferenças em produção:**
- `secure: true` nos cookies (requer HTTPS)
- `NODE_ENV=production`
- Logs reduzidos

## Próximos Passos

✅ Testes locais passando?
→ Faça deploy para Vercel
→ Configure `JWT_SECRET` nas Environment Variables
→ Teste em https://seu-projeto.vercel.app
