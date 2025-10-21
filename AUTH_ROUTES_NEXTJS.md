# Auth Routes no Next.js (sem Backend Express)

## Resumo das Mudanças

Nesta implementação, todas as rotas de autenticação foram movidas do Express Backend para Next.js API Routes. Isso permite que todo o sistema rode direto no Vercel sem necessidade de um servidor backend separado.

## Rotas Criadas

### 1. **POST `/api/auth/login`**
- Recebe: `{ email: string, password: string }`
- Valida credenciais contra o banco via Prisma
- Gera JWT e o envia como cookie `httpOnly`
- Resposta: `{ ok: true, user: { id, email, name } }`

### 2. **POST `/api/auth/refresh`**
- Valida o JWT armazenado no cookie
- Busca o usuário no banco para confirmar existência
- Renova o token (estende a sessão)
- Resposta: `{ ok: true, user: { id, email, name } }`

### 3. **POST `/api/auth/logout`**
- Limpa o cookie setando `maxAge: 0`
- Resposta: `{ ok: true, message: "Logout realizado" }`

### 4. **GET `/api/auth/me`**
- Valida o JWT no cookie
- Retorna o usuário atual
- Resposta: `{ ok: true, user: { id, email, name } }`
- Erro 401 se não autenticado

### 5. **PUT `/api/auth/profile`**
- Requer autenticação (cookie JWT)
- Atualiza nome e/ou email do usuário
- Valida unicidade de email
- Resposta: `{ ok: true, user: { id, email, name } }`

## Funcionalidades

✅ **Cookie httpOnly seguro**: Impedindo XSS
✅ **JWT de 7 dias**: Sessões longas por padrão
✅ **Validação via Prisma**: Integração direta com banco de dados
✅ **Comparação de senha bcrypt**: Segurança criptográfica
✅ **Ambiente-aware**: Cookies `secure: true` em produção

## AuthContext Atualizado

O `AuthContext.tsx` foi simplificado para usar as novas rotas:

- **signIn()**: POST `/api/auth/login` com `credentials: "include"`
- **signOut()**: POST `/api/auth/logout` com `credentials: "include"`
- **refreshProfile()**: GET `/api/auth/me` para validar sessão
- **updateProfile()**: PUT `/api/auth/profile` para editar dados

Todas as requisições incluem `credentials: "include"` para suportar cookies.

## Dependências Adicionadas

```json
"dependencies": {
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2"
}
```

## Fluxo de Uso

1. **Login**: 
   ```
   POST /api/auth/login { email, password }
   → Cookie setado
   → User armazenado em localStorage
   ```

2. **Verificação de Sessão**:
   ```
   GET /api/auth/me
   → Valida cookie JWT
   → Retorna usuário ou 401
   ```

3. **Logout**:
   ```
   POST /api/auth/logout
   → Cookie removido
   → Estado limpo
   ```

## Não Há Mais Necessidade De

- ❌ Express Backend separado para auth
- ❌ CORS para /auth/...
- ❌ Gerenciamento manual de tokens no localStorage
- ❌ Backend rodando em outra porta

## Deployment

No Vercel, adicione a variável de ambiente:
- `JWT_SECRET`: String aleatória forte (mude em produção!)

Exemplo:
```
JWT_SECRET=seu_secret_super_seguro_aqui_123456789
```

O banco de dados (`DATABASE_URL`) já está configurado no `.env`.

## Testes Rápidos

```bash
# Login (cria cookie)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"senha123"}' \
  -c cookies.txt

# Verificar sessão (lê cookie)
curl http://localhost:3000/api/auth/me \
  -b cookies.txt

# Logout (limpa cookie)
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## Segurança

- Senhas comparadas com bcrypt (nunca armazenar em texto plano!)
- JWT com expiração de 7 dias
- Cookies `httpOnly` (inacessíveis via JavaScript)
- Cookies `secure` em produção (HTTPS only)
- Cookies `sameSite: "lax"` contra CSRF
- Validação no servidor de todas as operações
