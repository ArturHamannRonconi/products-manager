# Products Manager

Aplicação full-stack de gerenciamento de produtos e pedidos com dois perfis de usuário: **Vendedor (Seller)** e **Cliente (Customer)**.

---

## Como iniciar

### Pré-requisitos

- [Docker](https://www.docker.com/) instalado e em execução
- Arquivo `.env` configurado na raiz do projeto (veja a seção abaixo)

### Configuração do `.env`

Crie (ou edite) o arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Backend
MONGODB_URI=mongodb://db:27017/products-manager
JWT_SELLER_SECRET=troque_por_um_segredo_forte
JWT_CUSTOMER_SECRET=troque_por_outro_segredo_forte

# Upload de imagens (opcional — sem essas variáveis o upload de imagens não funcionará)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Importante:** Nunca use os valores padrão de `JWT_SELLER_SECRET` e `JWT_CUSTOMER_SECRET` em produção.

### Scripts disponíveis

Os scripts ficam na pasta `scripts/` e podem ser executados de qualquer diretório.

#### `scripts/start.sh` — Iniciar a aplicação

```bash
./scripts/start.sh
```

O script irá:
1. Verificar se o Docker está em execução
2. Verificar se o arquivo `.env` existe
3. Fazer o build das imagens do backend e do frontend
4. Subir os três serviços: banco de dados, backend e frontend

Quaisquer argumentos extras são repassados ao `docker compose up`:

```bash
./scripts/start.sh --no-cache
```

#### `scripts/seed.sh` — Popular o banco com dados de exemplo

Com a aplicação já em execução, rode:

```bash
./scripts/seed.sh
```

O script irá:
1. Verificar se `curl` e `jq` estão instalados
2. Verificar se o backend está acessível
3. Criar dois vendedores e um cliente, todos com senha `12345678`:
   - `seller1@test.com` — Alice Store (50 produtos)
   - `seller2@test.com` — Bob Store (50 produtos)
   - `customer@test.com`
4. Criar 100 produtos no total (50 por vendedor) distribuídos em 10 categorias

#### `scripts/destroy.sh` — Destruir todos os recursos Docker

```bash
./scripts/destroy.sh
```

O script irá:
1. Parar e remover containers, redes e volumes
2. Remover as imagens Docker geradas pelo projeto

---

## Acessando a aplicação

| Serviço       | URL                              | Descrição                         |
|---------------|----------------------------------|-----------------------------------|
| **Frontend**  | http://localhost:3000            | Aplicação web                     |
| **Landing Page** | http://localhost:3000         | Página inicial — ponto de entrada |
| **Backend API** | http://localhost:3001          | REST API                          |
| **Swagger**   | http://localhost:3001/api        | Documentação interativa da API    |
| **MongoDB**   | localhost:27017                  | Banco de dados (acesso local)     |

### Página inicial

Abra **http://localhost:3000** no navegador.

A Landing Page é o ponto de entrada de toda a aplicação — a partir dela você pode:
- Clicar em **"Enter as Seller"** para acessar o fluxo de Vendedor
- Clicar em **"Enter as Customer"** para acessar o fluxo de Cliente

---

## Visão geral da aplicação

### Perfil Vendedor

1. **Cadastro / Login** em `/seller/register` e `/seller/login`
2. **Listagem de produtos** com paginação e busca por texto
3. **Criação de produtos em lote** — a categoria é criada automaticamente se não existir
4. **Upload de imagem** por produto (salva no S3; exige variáveis AWS configuradas)
5. **Edição e exclusão** de produtos — ao excluir o último produto de uma categoria, ela também é removida
6. **Atualização de status de pedidos** — o vendedor pode marcar pedidos como `Approved` ou `Canceled`

### Perfil Cliente

1. **Cadastro / Login** em `/customer/register` e `/customer/login`
2. **Navegação de produtos** com paginação e busca — sem exibição de estoque
3. **Carrinho** — adiciona produtos com seleção de quantidade; o estado persiste durante a sessão
4. **Checkout** em `/customer/orders/new` — revisa o carrinho, ajusta quantidades e finaliza o pedido
5. **Histórico de pedidos** em `/customer/orders` — lista todos os pedidos com status colorido e detalhes expandíveis

### Autenticação

- JWT de acesso (15 min) retornado no corpo da resposta, armazenado em memória (Zustand + `sessionStorage`)
- Refresh token (30 dias) em cookie `httpOnly` — renovação automática via interceptor Axios
- Tokens separados para Vendedor e Cliente (`JWT_SELLER_SECRET` / `JWT_CUSTOMER_SECRET`)

---

## Estrutura do projeto

```
/
├── backend/          NestJS REST API (porta 3001)
├── frontend/         Next.js App Router (porta 3000)
├── docker-compose.yml
├── .env
├── scripts/
│   ├── start.sh      Iniciar a aplicação (Docker Compose)
│   ├── seed.sh       Popular o banco com dados de exemplo
│   └── destroy.sh    Destruir containers, volumes e imagens
└── README.md
```

### Backend — principais módulos

| Módulo       | Responsabilidade                                        |
|--------------|---------------------------------------------------------|
| `sellers`    | Cadastro, login, refresh token, atualização de perfil   |
| `customers`  | Cadastro, login, refresh token, atualização de perfil   |
| `categories` | Criação e remoção automática de categorias              |
| `products`   | CRUD de produtos, upload de imagem, listagem por perfil |
| `orders`     | Criação de pedidos, atualização de status, histórico    |

Padrões utilizados: **DDD** (aggregates, entities, value objects via `ddd-tool-kit`), repositórios desacoplados, serviços sem framework (`@Injectable` apenas para DI).

### Frontend — principais rotas

| Rota                         | Descrição                                  |
|------------------------------|--------------------------------------------|
| `/`                          | Landing Page                               |
| `/seller/register`           | Cadastro de vendedor                       |
| `/seller/login`              | Login de vendedor                          |
| `/seller/products`           | Lista de produtos (visão vendedor)         |
| `/seller/products/new`       | Criar produtos em lote                     |
| `/seller/products/[id]/edit` | Editar produto                             |
| `/customer/register`         | Cadastro de cliente                        |
| `/customer/login`            | Login de cliente                           |
| `/customer/products`         | Catálogo de produtos (visão cliente)       |
| `/customer/orders`           | Histórico de pedidos                       |
| `/customer/orders/new`       | Carrinho / checkout                        |

---

## Tecnologias

| Camada     | Stack                                                                 |
|------------|-----------------------------------------------------------------------|
| Backend    | Node.js, NestJS, TypeScript, MongoDB, Mongoose, Passport JWT, Swagger |
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Axios     |
| Infra      | Docker, Docker Compose, MongoDB 7, AWS S3 (upload de imagens)         |
| Testes     | Jest (unit + integration), Playwright (snapshot E2E)                  |
