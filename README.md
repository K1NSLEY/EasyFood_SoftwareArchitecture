# EasyFood

Aplicação de catálogo de restaurantes com API em Node.js, Express e Prisma, banco PostgreSQL e interface web responsiva.

## Recursos

- Cadastro e login com senha armazenada em hash e autenticação JWT.
- Cadastro de restaurantes associados à conta que os criou.
- Cardápios públicos com criação, edição e exclusão de pratos restritas ao proprietário do restaurante.
- Envio de fotos para pratos e perfil (JPEG, PNG ou WebP, até 5 MB), otimizadas e armazenadas em WebP.
- Busca por nome, filtro por categoria, ordenação, paginação e favoritos no navegador.
- Histórico recente das atividades da conta.
- Notificações por e-mail no cadastro de restaurantes, quando SMTP estiver configurado.

## Executar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o `.env` com base em `.env.example`. A URL/credenciais do exemplo servem apenas para o PostgreSQL local definido no Compose. Configure também um `JWT_SECRET` próprio e, opcionalmente, as credenciais SMTP.
3. Inicie o PostgreSQL local (requer Docker Desktop em execução):

   ```bash
   docker compose up -d db
   ```

4. Atualize o schema e gere o cliente Prisma:

   ```bash
   npx prisma db push
   npx prisma generate
   ```

   Para importar os dados do SQLite anterior (`prisma/dev.db`) para o PostgreSQL vazio:

   ```bash
   npm run db:migrate:sqlite -- --dry-run
   npm run db:migrate:sqlite
   ```

   A migração preserva os IDs, relacionamentos e datas, não apaga a origem e recusa gravar se as tabelas do destino já contiverem dados. Requer Node.js 22.5 ou superior.

5. Inicie o servidor:

   ```bash
   npm start
   ```

6. Acesse `http://localhost:3000`.

Imagens recebidas são gravadas em `public/uploads/` e servidas pela aplicação. O arquivo SQLite anterior é mantido como cópia local após a migração.

## Endpoints

| Método | Caminho | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | Público | Criar conta |
| `POST` | `/auth/login` | Público | Autenticar e obter token |
| `GET` | `/auth/me` | Autenticado | Consultar perfil |
| `POST` | `/auth/me/image` | Autenticado | Enviar imagem do perfil no campo multipart `image` |
| `POST` | `/auth/me/avatar` | Autenticado | Alias compatível para envio da imagem do perfil |
| `GET` | `/restaurants` | Público | Listar restaurantes |
| `POST` | `/restaurants` | Autenticado | Cadastrar restaurante |
| `GET` | `/restaurants/:restaurantId/dishes` | Público | Listar pratos de um restaurante |
| `POST` | `/restaurants/:restaurantId/dishes` | Proprietário | Criar prato; formulário multipart opcional com campo `image` |
| `GET` | `/dishes/:dishId` | Público | Consultar prato |
| `POST` | `/dishes/:dishId/image` | Proprietário | Enviar imagem do prato no campo multipart `image` |
| `PUT` | `/dishes/:dishId` | Proprietário | Atualizar prato e, opcionalmente, sua imagem |
| `DELETE` | `/dishes/:dishId` | Proprietário | Excluir prato |
| `GET` | `/activity` | Autenticado | Consultar até 50 atividades recentes da conta |

Para rotas autenticadas, envie o cabe?alho `Authorization: Bearer <token>`. Uploads de imagem usam `multipart/form-data`, com o arquivo no campo `image`.
