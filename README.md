# Cantina Online — Ambiente Local

Este projeto está preparado **somente para rodar localmente** (sem Vercel).

## Requisitos
- Node 18+
- MySQL em execução (ou outro provider compatível configurado no `DATABASE_URL`)

## Backend (Express + Prisma)
```bash
cd backend
cp .env.example .env    # ajuste as variáveis abaixo
npm i
npm run prisma:generate
npm run prisma:push
npm run prisma:seed     # opcional
npm run dev             # sobe em http://127.0.0.1:4000
```

`.env` esperado no backend:
```env
DATABASE_URL=mysql://user:pass@127.0.0.1:3306/cantina
JWT_SECRET=uma_senha_forte
REFRESH_JWT_SECRET=outra_senha_forte
CORS_ORIGIN=http://127.0.0.1:3000
PORT=4000
```

> Dica: mantenha **127.0.0.1** no frontend e no backend para evitar problemas de cookie.
> Evite misturar `localhost` com `127.0.0.1`.

## Frontend (Next.js)
```bash
# na raiz do monorepo
cp .env.local.example .env.local  # se existir; caso contrário crie .env.local conforme abaixo
npm i
npm run dev  # abre http://localhost:3000 (acesse com 127.0.0.1:3000 conforme dica)
```

`.env.local` esperado no frontend:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
```

## Fluxo de login
1. Cadastre um usuário em `/auth/cadastro`.
2. Faça login em `/auth/login`.
3. O header exibirá seu avatar/nomes (e menu da conta). Acesse **/perfil** para ver os dados.

## Observações
- Cookies: `SameSite=Lax` é suficiente no ambiente local quando ambos usam `127.0.0.1`.
- Se abrir o frontend via `http://localhost:3000`, **prefira** acessar `http://127.0.0.1:3000` para manter o host consistente.
