# Products Manager

Aplicacao full-stack de gerenciamento de produtos e pedidos com dois perfis de usuario: **Vendedor (Seller)** e **Cliente (Customer)**.

---

## Como iniciar (desenvolvimento local)

### Pre-requisitos

- [Docker](https://www.docker.com/) instalado e em execucao

### Configuracao das variaveis de ambiente

O projeto usa dois arquivos de ambiente na raiz: `backend.env` e `frontend.env`.

**`backend.env`**

```env
PORT=3001
NODE_ENV=dev

S3_BUCKET_NAME=

FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://db:27017/products-manager

JWT_SELLER_SECRET=troque_por_um_segredo_forte
JWT_CUSTOMER_SECRET=troque_por_outro_segredo_forte
```

> `S3_BUCKET_NAME` e opcional — sem ele o upload de imagens nao funcionara. Para habilitar, configure tambem as credenciais AWS como variaveis de ambiente do container ou via perfil local.

**`frontend.env`**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Scripts disponiveis

Os scripts ficam na pasta `scripts/` e podem ser executados de qualquer diretorio.

#### `scripts/start.sh` — Iniciar a aplicacao

```bash
./scripts/start.sh
```

O script ira:
1. Verificar se o Docker esta em execucao
2. Verificar se `backend.env` e `frontend.env` existem
3. Fazer o build das imagens do backend e do frontend
4. Subir os tres servicos: banco de dados, backend e frontend

Quaisquer argumentos extras sao repassados ao `docker compose up`:

```bash
./scripts/start.sh --no-cache
```

#### `scripts/seed.sh` — Popular o banco com dados de exemplo

Com a aplicacao ja em execucao, rode:

```bash
./scripts/seed.sh
```

O script ira:
1. Verificar se `curl` e `jq` estao instalados
2. Verificar se o backend esta acessivel
3. Criar dois vendedores e um cliente, todos com senha `12345678`:
   - `seller1@test.com` — Alice Store (50 produtos)
   - `seller2@test.com` — Bob Store (50 produtos)
   - `customer@test.com`
4. Criar 100 produtos no total (50 por vendedor) distribuidos em 10 categorias

#### `scripts/destroy.sh` — Destruir todos os recursos Docker

```bash
./scripts/destroy.sh
```

O script ira:
1. Parar e remover containers, redes e volumes
2. Remover as imagens Docker geradas pelo projeto

---

## Acessando a aplicacao

| Servico        | URL                          | Descricao                         |
|----------------|------------------------------|-----------------------------------|
| **Frontend**   | http://localhost:3000         | Aplicacao web                     |
| **Landing Page** | http://localhost:3000       | Pagina inicial — ponto de entrada |
| **Backend API** | http://localhost:3001        | REST API                          |
| **Swagger**    | http://localhost:3001/api    | Documentacao interativa da API    |
| **MongoDB**    | localhost:27017              | Banco de dados (acesso local)     |

### Pagina inicial

Abra **http://localhost:3000** no navegador.

A Landing Page e o ponto de entrada de toda a aplicacao — a partir dela voce pode:
- Clicar em **"Enter as Seller"** para acessar o fluxo de Vendedor
- Clicar em **"Enter as Customer"** para acessar o fluxo de Cliente

---

## Visao geral da aplicacao

### Perfil Vendedor

1. **Cadastro / Login** em `/seller/register` e `/seller/login`
2. **Listagem de produtos** com paginacao e busca por texto
3. **Criacao de produtos em lote** — a categoria e criada automaticamente se nao existir
4. **Upload de imagem** por produto (salva no S3; exige `S3_BUCKET_NAME` configurado)
5. **Edicao e exclusao** de produtos — ao excluir o ultimo produto de uma categoria, ela tambem e removida
6. **Atualizacao de status de pedidos** — o vendedor pode marcar pedidos como `Approved` ou `Canceled`

### Perfil Cliente

1. **Cadastro / Login** em `/customer/register` e `/customer/login`
2. **Navegacao de produtos** com paginacao e busca — sem exibicao de estoque
3. **Carrinho** — adiciona produtos com selecao de quantidade; o estado persiste durante a sessao
4. **Checkout** em `/customer/orders/new` — revisa o carrinho, ajusta quantidades e finaliza o pedido
5. **Historico de pedidos** em `/customer/orders` — lista todos os pedidos com status colorido e detalhes expansiveis

### Autenticacao

- JWT de acesso (15 min) retornado no corpo da resposta, armazenado em memoria (Zustand + `sessionStorage`)
- Refresh token (30 dias) em cookie `httpOnly` — renovacao automatica via interceptor Axios
- Tokens separados para Vendedor e Cliente (`JWT_SELLER_SECRET` / `JWT_CUSTOMER_SECRET`)

---

## Estrutura do projeto

```
/
├── backend/               NestJS REST API (porta 3001)
├── frontend/              Next.js App Router (porta 3000)
├── infra/                 Terraform — infraestrutura AWS (ECS Fargate, ALB, Route 53, S3, SSM)
├── .github/workflows/     GitHub Actions (deploy, terraform plan/apply/destroy, update secrets)
├── scripts/
│   ├── start.sh           Iniciar a aplicacao (Docker Compose)
│   ├── seed.sh            Popular o banco com dados de exemplo
│   └── destroy.sh         Destruir containers, volumes e imagens
├── docker-compose.yml     Sobe backend, frontend e MongoDB localmente
├── backend.env            Variaveis de ambiente do backend (gitignored)
├── frontend.env           Variaveis de ambiente do frontend (gitignored)
├── MANUAL.md              Guia completo de deploy na AWS
└── README.md              Este arquivo
```

### Backend — principais modulos

| Modulo       | Responsabilidade                                        |
|--------------|---------------------------------------------------------|
| `sellers`    | Cadastro, login, refresh token, atualizacao de perfil   |
| `customers`  | Cadastro, login, refresh token, atualizacao de perfil   |
| `categories` | Criacao e remocao automatica de categorias              |
| `products`   | CRUD de produtos, upload de imagem, listagem por perfil |
| `orders`     | Criacao de pedidos, atualizacao de status, historico    |

Padroes utilizados: **DDD** (aggregates, entities, value objects via `ddd-tool-kit`), repositorios desacoplados, servicos sem framework (`@Injectable` apenas para DI).

### Frontend — principais rotas

| Rota                         | Descricao                                  |
|------------------------------|--------------------------------------------|
| `/`                          | Landing Page                               |
| `/seller/register`           | Cadastro de vendedor                       |
| `/seller/login`              | Login de vendedor                          |
| `/seller/products`           | Lista de produtos (visao vendedor)         |
| `/seller/products/new`       | Criar produtos em lote                     |
| `/seller/products/[id]/edit` | Editar produto                             |
| `/customer/register`         | Cadastro de cliente                        |
| `/customer/login`            | Login de cliente                           |
| `/customer/products`         | Catalogo de produtos (visao cliente)       |
| `/customer/orders`           | Historico de pedidos                       |
| `/customer/orders/new`       | Carrinho / checkout                        |

---

## Deploy na AWS

A aplicacao possui infraestrutura completa para deploy na AWS usando **Terraform** e **GitHub Actions**.

### Arquitetura

```
Internet → Route 53
               ├── api.dominio.com → ALB (HTTPS) → Backend ECS Fargate
               └── app.dominio.com → ALB (HTTPS) → Frontend ECS Fargate
                                                     MongoDB ECS Fargate (EFS)
```

Componentes: ECS Fargate (subnets privadas), ALB com HTTPS, Route 53, ACM, S3, SSM Parameter Store, VPC Endpoints, EFS.

### GitHub Actions

Todas as actions sao acionadas **manualmente** via `workflow_dispatch`. O operador informa suas credenciais AWS nos campos do formulario a cada execucao.

| Action               | Inputs                                                    | Descricao                                           |
|----------------------|-----------------------------------------------------------|-----------------------------------------------------|
| **Deploy**           | `service`, `aws_access_key_id`, `aws_secret_access_key`, `domain_url` | Build + push ECR + redeploy ECS                     |
| **Terraform Plan**   | `aws_access_key_id`, `aws_secret_access_key`              | Executa `terraform plan`                            |
| **Terraform Apply**  | `aws_access_key_id`, `aws_secret_access_key`              | Executa `terraform apply -auto-approve`             |
| **Terraform Destroy**| `confirm`, `aws_access_key_id`, `aws_secret_access_key`   | Destroi toda a infra (requer digitar "destroy")     |
| **Update Secrets**   | `parameter_name`, `parameter_value`, `aws_access_key_id`, `aws_secret_access_key`, `restart_backend` | Atualiza parametro no SSM Parameter Store |

> As actions de Terraform tambem usam GitHub Secrets (`DOMAIN_NAME`, `MONGODB_PASSWORD`, `MONGODB_USERNAME`) para as variaveis do Terraform. Configure-os em **Settings > Secrets and variables > Actions**.

### Guia completo

Consulte o **[MANUAL.md](MANUAL.md)** para o passo a passo completo de deploy, incluindo: compra de dominio, criacao do state backend, primeiro apply local, configuracao de DNS, e troubleshooting.

---

## Tecnologias

| Camada     | Stack                                                                 |
|------------|-----------------------------------------------------------------------|
| Backend    | Node.js, NestJS, TypeScript, MongoDB, Mongoose, Passport JWT, Swagger |
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Axios     |
| Infra      | Docker, Docker Compose, Terraform, AWS (ECS Fargate, ALB, Route 53, S3, SSM, EFS) |
| CI/CD      | GitHub Actions (deploy manual, terraform plan/apply/destroy)          |
| Testes     | Jest (unit + integration), Playwright (snapshot E2E)                  |
