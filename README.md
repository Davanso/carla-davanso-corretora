# Carla Davanso Corretora

Catálogo imobiliário em Next.js 16 com vitrine pública, páginas de detalhe e um painel para uma única administradora. A aplicação é hospedada na Vercel, usa PostgreSQL no Neon e armazena imagens no Cloudflare R2.

## Rotas

- `/`, `/imoveis/[categoria]` e `/imovel/[slug]`: catálogo público.
- `/contato`: contato e mapa.
- `/admin/login`: login da administradora configurada por ambiente.
- `/admin` e `/admin/imoveis/[id]`: criação e gestão dos imóveis.

Não há cadastro público, contas de clientes ou usuários administrativos no banco.

## Desenvolvimento local

Requisitos: Node.js compatível com Next.js 16 e um PostgreSQL para trabalhar com dados persistidos.

```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev
```

Quando `DATABASE_URL` não está definida, somente o servidor de desenvolvimento exibe os imóveis de exemplo. Builds e execuções de produção nunca usam amostras: uma configuração ausente ou falha do banco mostra um estado de erro explícito.

## Variáveis de ambiente

Cadastre as mesmas variáveis do arquivo `.env.example` na Vercel para Production, Preview e Development conforme necessário. Não exponha credenciais com o prefixo `NEXT_PUBLIC_`.

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Connection string PostgreSQL do Neon, com SSL. |
| `AUTH_SECRET` | Segredo longo e aleatório usado pelas sessões Auth.js e tokens internos de upload. |
| `ADMIN_EMAIL` | Único e-mail autorizado a entrar no painel. |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt da senha administrativa; nunca use a senha em texto puro em produção. |
| `R2_ACCOUNT_ID` | ID da conta Cloudflare. |
| `R2_ACCESS_KEY_ID` | Access key de um token R2 com acesso ao bucket. |
| `R2_SECRET_ACCESS_KEY` | Secret key correspondente ao token R2. |
| `R2_BUCKET_NAME` | Nome do bucket privado usado nos uploads assinados. |
| `R2_PUBLIC_BASE_URL` | Origem HTTPS do domínio público/custom domain do bucket, sem query ou fragmento. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Chave pública restrita usada pelo mapa da página de contato. |

Gere valores localmente, sem colá-los em issues, logs ou commits:

```bash
openssl rand -base64 32
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" "SUA-SENHA-FORTE"
```

O primeiro comando gera `AUTH_SECRET`; o segundo gera `ADMIN_PASSWORD_HASH`.

## Neon e migrations

Crie um projeto Neon e use a connection string PostgreSQL em `DATABASE_URL`. O schema é versionado em `prisma/migrations`; não use `db:push` em produção.

Banco novo:

```bash
npm run db:migrate
```

Banco existente que já possui exatamente o schema da migration inicial: faça backup, confirme a equivalência do schema e marque apenas a migration inicial como aplicada antes de executar a delta:

```bash
npx prisma migrate resolve --applied 20260718120000_init
npm run db:migrate
```

Isso aplica `20260718121000_single_admin_and_image_keys`. Não marque a migration inicial como aplicada em um banco vazio ou incompatível. Execute migrations em uma etapa operacional controlada antes de direcionar tráfego ao novo deploy; o build da Vercel não altera o banco.

Imagens existentes recebem temporariamente uma chave `legacy/<id>` porque URLs antigas não provam qual objeto R2 deve ser apagado. A API preserva esses metadados e bloqueia sua remoção. Antes de editar ou excluir o imóvel, confirme o objeto correspondente no storage, mova-o para uma chave válida `properties/<uuid>.<ext>` quando aplicável e atualize `objectKey`/`url` no banco em uma manutenção auditada. Nunca apague uma linha legada sem confirmar o destino do arquivo.

## Cloudflare R2

1. Crie um bucket e conecte um custom domain HTTPS para leitura pública.
2. Crie um token S3 API limitado ao bucket, com leitura/escrita de objetos.
3. Cadastre conta, chaves, bucket e domínio nas variáveis `R2_*` da Vercel.
4. Configure CORS no bucket substituindo as origens pelos domínios exatos da aplicação. O navegador faz `PUT` direto no R2 e envia `Content-Type`.

```json
[
  {
    "AllowedOrigins": [
      "https://www.seudominio.com.br",
      "https://seu-projeto.vercel.app"
    ],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Não use `*` em `AllowedOrigins`. Se previews da Vercel precisarem fazer upload, inclua cada origem aprovada explicitamente ou restrinja uploads administrativos ao domínio de produção.

Os uploads aceitam somente JPEG, PNG e WebP, com quantidade e tamanho limitados. A API gera chaves sob `properties/`, emite URLs curtas e valida novamente o objeto antes de salvar metadados. Credenciais R2 permanecem no servidor.

### Órfãos e exclusões parciais

Se a criação for abandonada após o upload, o objeto pode ficar sem metadados. Na primeira versão, a limpeza é manual: no painel R2, filtre o prefixo `properties/`, compare as chaves com `PropertyImage.objectKey` no banco e remova somente objetos confirmados como órfãos. Registre a data e as chaves removidas.

Ao remover um imóvel, a aplicação o despublica primeiro, tenta apagar todas as imagens no R2 e só então remove os metadados quando não há falha de storage. Falhas são informadas e o imóvel permanece despublicado para permitir nova tentativa. Exclusões no PostgreSQL e no R2 não formam uma transação única.

## Deploy na Vercel

1. Importe o repositório na Vercel e mantenha o preset Next.js.
2. Configure todas as variáveis necessárias. `R2_PUBLIC_BASE_URL` é obrigatória e validada durante o build de produção.
3. Execute `npm run db:migrate` contra o banco de produção conforme a seção de migrations.
4. Faça o deploy e verifique login, upload válido e rejeitado, criação/edição/publicação/remoção e as páginas públicas.

Comandos de verificação:

```bash
npx prisma validate
npx prisma generate
npm run lint
npx tsc --noEmit
npm run build
```
