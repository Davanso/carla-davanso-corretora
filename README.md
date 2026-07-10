# Carla Davanso Corretora

Site imobiliário em Next.js para vitrine pública de imóveis, páginas de listagem por categoria, página de contato e painel administrativo.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui com Base UI
- Embla Carousel
- React Hook Form + Zod
- Auth.js
- Prisma ORM
- PostgreSQL
- Storage S3/R2 para fotos dos imóveis
- Deploy previsto em Coolify

## Rotas principais

- `/` - home pública com busca, carrosséis e destaques.
- `/imoveis/a-venda` - listagem de imóveis à venda.
- `/imoveis/para-alugar` - listagem de imóveis para alugar.
- `/imoveis/destaques` - imóveis em destaque.
- `/imoveis/lancamentos` - lançamentos.
- `/contato` - formulário, contatos e mapa.
- `/admin/login` - login administrativo.
- `/admin` - painel administrativo.

## Desenvolvimento local

Instale as dependências:

```bash
npm install
```

Crie o banco PostgreSQL local e configure o `.env`. O projeto já tem um `.env` local neste workspace; para outro ambiente, copie:

```bash
cp .env.example .env
```

Gere o Prisma Client e sincronize o schema:

```bash
npm run db:push
```

Rode o projeto:

```bash
npm run dev
```

Abra:

```text
http://localhost:3000
```

## Variáveis de ambiente

As variáveis ficam em `.env` localmente e devem ser cadastradas no Coolify em produção.

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
AUTH_URL="https://seudominio.com.br"
ADMIN_EMAIL="admin@carladavanso.com.br"
ADMIN_PASSWORD="senha-forte"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."

S3_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET="carla-davanso-imoveis"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_PUBLIC_BASE_URL="https://cdn.seudominio.com"
```

Observações:

- `.env` não deve ser commitado.
- `AUTH_SECRET` precisa ser longo e aleatório.
- Em produção, troque `ADMIN_PASSWORD`.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` precisa ter permissão para Google Maps Embed API.

## Comandos úteis

```bash
npm run dev       # servidor local
npm run lint      # lint
npm run build     # build de produção
npm run start     # roda build de produção
npm run db:push   # sincroniza schema no banco
npm run db:migrate # aplica migrations em produção
npm run db:studio # abre Prisma Studio
```

## Deploy

O guia de deploy está em [docs/deploy-coolify.md](docs/deploy-coolify.md).

Resumo para Coolify:

- Build command: `npm run build`
- Start command: `npm run start`
- Porta: `3000`
- Banco: PostgreSQL
- Antes do primeiro deploy com banco vazio, rode `npm run db:push` ou use migrations.

## Próximos passos

- Finalizar cadastro real de imóveis com upload para R2/S3.
- Criar fluxo de seed/primeiro usuário admin.
- Trocar placeholders por imóveis reais.
- Revisar domínio final e `AUTH_URL`.
