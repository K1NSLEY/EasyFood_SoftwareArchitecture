# EasyFood API

Projeto base de uma API REST para gerenciamento de restaurantes, desenvolvido em Node.js com Express e Prisma. A aplicação foi estruturada para servir como backend inicial de um sistema de catálogo de restaurantes, com possibilidade de expansão para frontend, autenticação e banco de dados mais completo.

## Informações do autor

- Nome: Kinsley Amadi
- RA: 97399
- Atividade acadêmica: desenvolvimento do projeto base EasyFood

## Visão geral

O projeto tem como objetivo criar uma API simples para cadastrar e listar restaurantes. A estrutura atual permite:

- Buscar todos os restaurantes cadastrados;
- Cadastrar novos restaurantes via requisição HTTP;
- Expor endpoints REST para integração com aplicações frontend ou testes de API;
- Servir como base para evolução do sistema.

## Tecnologias utilizadas

- Node.js
- Express.js
- Prisma ORM
- CORS
- JavaScript

## Estrutura do projeto

```text
projeto-easyfood-aula1/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── prisma/
│   ├── dev.db
│   └── schema.prisma
├── public/
│   └── index.html
├── src/
│   ├── app.js
│   ├── server.js
│   ├── database/
│   │   └── prisma.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.middleware.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.service.js
│   │   └── restaurant/
│   │       ├── restaurant.controller.js
│   │       ├── restaurant.routes.js
│   │       └── restaurant.service.js
│   └── services/
│       ├── email.service.js
│       └── logger.service.js
├── server.js
├── logs/
│   └── app.log
├── skills-lock.json
├── teste.js
└── node_modules/
```

## Análise do repositório

O repositório apresenta uma base funcional de backend, com foco em arquitetura simples e escalável para aplicações web. Os principais pontos observados são:

- O arquivo `src/server.js` concentra a configuração do servidor Express e os endpoints principais;
- O projeto usa `@prisma/client` para comunicação com banco de dados;
- A pasta `public` contém a interface HTML da aplicação;
- A pasta `logs` recebe os registros operacionais da aplicação;
- A API expõe endpoints para listar e criar restaurantes;
- A estrutura é adequada para atividades acadêmicas, provas e entregas de disciplina de desenvolvimento back-end;
- A aplicação ainda está em uma etapa inicial, com espaço para melhorias como validações extras, CRUD completo e documentação de rotas.

## Endpoints principais

### GET /restaurants
Retorna todos os restaurantes cadastrados.

### POST /restaurants
Cadastra um novo restaurante com os dados enviados no corpo da requisição.

Exemplo de payload:

```json
{
  "name": "Pizzaria do Bairro",
  "category": "Pizza",
  "rating": 4.8
}
```

## Como executar o projeto

### Pré-requisitos

- Node.js instalado
- npm instalado
- Dependências do projeto instaladas

### Instalação

```bash
npm install
```

### Execução

```bash
npm start
```

A aplicação será iniciada na porta:

```text
http://localhost:3000
```

## Observações importantes

O banco local é SQLite e fica em `prisma/dev.db`. As credenciais SMTP devem ser configuradas no `.env` para o envio real de e-mails.

## Conclusão

Este projeto representa uma base sólida para o desenvolvimento de uma aplicação de delivery ou catálogo de restaurantes. A proposta é simples, clara e útil para fins didáticos, além de servir como ponto de partida para evoluções futuras em um sistema mais completo.

## Licença

Este projeto utiliza a licença indicada no arquivo `package.json`, que atualmente está definida como `ISC`.

---

Desenvolvido por Kinsley Amadi - RA 97399.
