# Manual de Deploy - Products Manager na AWS

## Arquitetura

```
Internet → Route 53 (dominio.com)
               │
               ├── api.dominio.com → ALB (HTTPS/443, host-header routing) → Backend (3001)
               └── app.dominio.com → ALB (HTTPS/443, host-header routing) → Frontend (3000)
                                        │
                                        ▼
                                   ECS Fargate (private subnets, sem acesso a internet)
                                        ├── backend-service  (256 CPU / 512 MB)
                                        ├── frontend-service (256 CPU / 512 MB)
                                        └── mongodb-service  (256 CPU / 512 MB, mongo:7, EFS para dados)
                                        │
                                        ▼
                                   VPC Endpoints (ECR, S3, SSM, CloudWatch Logs, EFS)
```

**Componentes:**
- **Route 53** — hosted zone com records A (alias) para `api.dominio.com` e `app.dominio.com` apontando para o ALB
- **ACM Certificates** — um certificado SSL por subdominio (`api.dominio.com` e `app.dominio.com`) com validacao DNS automatica
- **ALB** — redireciona HTTP→HTTPS, roteia por host-header (subdominio) entre backend e frontend
- **ECS Fargate** — 3 services em subnets privadas (backend, frontend, MongoDB)
- **MongoDB** — container `mongo:7` com autenticacao, dados persistidos em **EFS**
- **Service Discovery** (Cloud Map) — DNS interno para o backend conectar ao MongoDB
- **VPC Endpoints** — acesso aos servicos AWS sem NAT Gateway (ECR, S3, SSM, Logs, EFS)
- **S3** — bucket para upload de imagens de produtos
- **SSM Parameter Store** — secrets da aplicacao (JWT, MongoDB URI, etc.)

---

## Pre-requisitos

Antes de comecar, garanta que voce tem:

1. **Conta AWS** com permissoes de administrador (ou IAM user com acesso amplo)
2. **AWS CLI v2** instalado e configurado:
   ```bash
   aws configure
   # Informe: Access Key ID, Secret Access Key, Region (us-east-1), Output (json)
   ```
3. **Terraform >= 1.5** instalado:
   ```bash
   terraform -version
   ```
4. **Docker** instalado (para build local caso queira fazer deploy manual)
5. **Repositorio no GitHub** com o codigo do projeto pushado

---

## Passo 1: Comprar o Dominio

O dominio deve ser comprado **antes** do primeiro `terraform apply`.

1. Acesse o **AWS Console** > **Route 53** > **Registered domains** > **Register domains**
2. Busque o dominio desejado (ex: `meuapp.com.br`, `meuapp.com`)
3. Preencha os dados de contato e finalize a compra
4. **Aguarde a ativacao** — pode levar de minutos a algumas horas
5. A AWS cria automaticamente uma **hosted zone** para o dominio — vamos lidar com isso no Passo 4

**Anote o nome exato do dominio** (ex: `meuapp.com`) — voce vai usa-lo no proximo passo.

---

## Passo 2: Criar o State Backend do Terraform

O Terraform armazena o estado da infraestrutura em um bucket S3 com lock via DynamoDB. Esses recursos precisam ser criados **manualmente** antes do primeiro `terraform init`.

Execute os comandos abaixo no terminal:

```bash
# Definir variaveis (ajuste se quiser nomes diferentes)
STATE_BUCKET="products-manager-tf-state-$(aws sts get-caller-identity --query Account --output text)"
LOCK_TABLE="products-manager-tf-lock"
REGION="us-east-1"

# 1. Criar o bucket S3 para o state
aws s3api create-bucket \
  --bucket $STATE_BUCKET \
  --region $REGION

# 2. Habilitar versionamento no bucket (protege contra perda acidental)
aws s3api put-bucket-versioning \
  --bucket $STATE_BUCKET \
  --versioning-configuration Status=Enabled

# 3. Criar a tabela DynamoDB para lock de state
aws dynamodb create-table \
  --table-name $LOCK_TABLE \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION

# 4. Anotar os valores
echo ""
echo "========================================="
echo "ANOTE ESSES VALORES:"
echo "STATE_BUCKET=$STATE_BUCKET"
echo "LOCK_TABLE=$LOCK_TABLE"
echo "========================================="
```

Apos criar os recursos, atualize o bloco `backend "s3"` em `infra/_versions.tf` com os valores reais:

```hcl
backend "s3" {
  encrypt        = true
  region         = "us-east-1"
  dynamodb_table = "SEU_LOCK_TABLE"
  key            = "products-manager/terraform.tfstate"
  bucket         = "SEU_STATE_BUCKET"
}
```

---

## Passo 3: Primeiro Terraform Apply (local)

O **primeiro apply precisa ser feito localmente**. Depois disso, todas as operacoes podem ser feitas via GitHub Actions.

### 3.1 Inicializar o Terraform

```bash
cd infra
terraform init
```

Voce deve ver:
```
Terraform has been successfully initialized!
```

### 3.2 Verificar o plano

As variaveis sem valor default (`domain_name`, `mongodb_password`, `mongodb_username`) devem ser passadas via `-var`:

```bash
terraform plan \
  -var="domain_name=seu-dominio.com" \
  -var="mongodb_password=SUA_SENHA_FORTE_AQUI" \
  -var="mongodb_username=admin"
```

Revise o plano. Deve mostrar ~50 recursos a serem criados. Confira se nao ha erros.

### 3.3 Aplicar

```bash
terraform apply \
  -var="domain_name=seu-dominio.com" \
  -var="mongodb_password=SUA_SENHA_FORTE_AQUI" \
  -var="mongodb_username=admin"
```

Digite `yes` quando solicitado.

**IMPORTANTE:** O apply pode demorar de **10 a 30 minutos**. O passo mais lento e a validacao do certificado ACM, que depende da propagacao DNS. Se o dominio foi comprado recentemente, pode levar mais tempo.

**Se o apply travar na validacao do ACM:**
- Isso e normal. O Terraform fica esperando o certificado ser validado.
- Voce pode verificar o progresso no AWS Console > Certificate Manager.
- Se demorar mais de 30 minutos, pule para o Passo 4 (configurar nameservers) **em outro terminal** e volte a aguardar.

### 3.4 Anotar os outputs

Apos o apply concluir com sucesso:

```bash
terraform output
```

**Anote os seguintes valores:**

| Output | Para que serve |
|--------|----------------|
| `route53_nameservers` | Configurar no dominio (Passo 4) |
| `ecr_backend_url` | URL do repositorio ECR do backend |
| `ecr_frontend_url` | URL do repositorio ECR do frontend |
| `frontend_url` | URL do frontend (`https://app.seu-dominio.com`) |
| `api_url` | URL da API (`https://api.seu-dominio.com`) |

---

## Passo 4: Configurar os Nameservers do Dominio

Quando voce comprou o dominio via Route 53, a AWS criou uma hosted zone automaticamente. O Terraform criou **outra** hosted zone. Voce precisa fazer o dominio apontar para a hosted zone do Terraform.

### 4.1 Pegar os nameservers do Terraform

```bash
terraform output route53_nameservers
```

Vai retornar algo como:
```
[
  "ns-123.awsdns-45.com",
  "ns-678.awsdns-90.net",
  "ns-111.awsdns-22.org",
  "ns-333.awsdns-44.co.uk",
]
```

### 4.2 Atualizar os nameservers no dominio

1. Acesse **AWS Console** > **Route 53** > **Registered domains**
2. Clique no seu dominio
3. Clique em **Actions** > **Edit name servers**
4. Substitua os nameservers existentes pelos 4 do output acima
5. Salve

### 4.3 (Opcional) Deletar a hosted zone antiga

A hosted zone criada automaticamente pela AWS agora esta orfao (ninguem aponta para ela):

1. Acesse **Route 53** > **Hosted zones**
2. Voce vera **duas** hosted zones com o mesmo dominio
3. A que **NAO** tem os nameservers do Terraform e a antiga — delete-a
4. (A que tem os nameservers do Terraform e a correta, **nao delete essa**)

### 4.4 Aguardar propagacao DNS

A propagacao DNS pode levar de **alguns minutos ate 48 horas** (normalmente menos de 1 hora).

Para verificar:
```bash
# Verificar se os nameservers ja propagaram
dig +short NS seu-dominio.com
# Deve retornar os 4 nameservers do output do Terraform
```

---

## Passo 5: Configurar GitHub Secrets

As GitHub Actions usam credenciais AWS passadas como **inputs do formulario** a cada execucao — nao e necessario armazenar `AWS_ACCESS_KEY_ID` nem `AWS_SECRET_ACCESS_KEY` como secrets do repositorio.

Porem, as actions de Terraform precisam de **3 secrets** para as variaveis do Terraform (valores sensiveis que nao devem ser digitados no formulario):

### 5.1 Criar environment "production"

1. No GitHub, va em **Settings** > **Environments** > **New environment**
2. Nome: `production`
3. (Opcional) Marque **Required reviewers** e adicione voce mesmo — isso obriga aprovacao manual antes de applies e deploys

### 5.2 Criar os secrets

Va em **Settings** > **Secrets and variables** > **Actions** > **New repository secret**

| Secret | Valor | Exemplo |
|--------|-------|---------|
| `DOMAIN_NAME` | Seu dominio (exatamente como registrado no Route 53) | `meuapp.com` |
| `MONGODB_PASSWORD` | Mesma senha usada no `terraform apply` | (a senha que voce escolheu) |
| `MONGODB_USERNAME` | Username do MongoDB | `admin` |

---

## Passo 6: Primeiro Deploy

Apos o Terraform criar a infra, os ECS services existem mas **nao tem imagem Docker no ECR**. As tasks ficam falhando ate voce fazer o primeiro deploy.

### Opcao A: Via GitHub Actions (recomendado)

1. Va em **Actions** > **Deploy** > **Run workflow**
2. Preencha os campos:
   - Branch: `main`
   - Service to deploy: `both`
   - AWS Access Key ID: sua access key
   - AWS Secret Access Key: sua secret key
   - Domain URL: `https://api.seu-dominio.com`
3. Clique **Run workflow**
4. Acompanhe o progresso na aba Actions

O workflow vai:
- Fazer build das imagens Docker do backend e frontend
- Push para os repositorios ECR
- Forcar novo deployment nos services ECS

### Opcao B: Deploy manual (caso as Actions ainda nao estejam configuradas)

```bash
# Volte para a raiz do projeto
cd ..

# 1. Login no ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com

# 2. Build e push do backend
ECR_BACKEND=$(cd infra && terraform output -raw ecr_backend_url)
docker build -t $ECR_BACKEND:latest ./backend
docker push $ECR_BACKEND:latest

# 3. Build e push do frontend
ECR_FRONTEND=$(cd infra && terraform output -raw ecr_frontend_url)
API_URL=$(cd infra && terraform output -raw api_url)
docker build --build-arg NEXT_PUBLIC_API_URL=$API_URL -t $ECR_FRONTEND:latest ./frontend
docker push $ECR_FRONTEND:latest

# 4. Forcar novo deployment
aws ecs update-service --cluster products-manager-prod-cluster --service products-manager-prod-backend --force-new-deployment
aws ecs update-service --cluster products-manager-prod-cluster --service products-manager-prod-frontend --force-new-deployment
```

### 6.1 Verificar se os services subiram

Aguarde 2-3 minutos e verifique:

```bash
# Backend
aws ecs describe-services \
  --cluster products-manager-prod-cluster \
  --services products-manager-prod-backend \
  --query 'services[0].{desired: desiredCount, running: runningCount}' \
  --output table

# Frontend
aws ecs describe-services \
  --cluster products-manager-prod-cluster \
  --services products-manager-prod-frontend \
  --query 'services[0].{desired: desiredCount, running: runningCount}' \
  --output table

# MongoDB
aws ecs describe-services \
  --cluster products-manager-prod-cluster \
  --services products-manager-prod-mongodb \
  --query 'services[0].{desired: desiredCount, running: runningCount}' \
  --output table
```

Todos devem mostrar `desired: 1, running: 1`.

---

## Passo 7: Acessar a Aplicacao

Se o DNS ja propagou e os services estao rodando:

```
https://app.seu-dominio.com
```

Voce deve ver a landing page do Products Manager. A API esta em `https://api.seu-dominio.com`.

**Se nao funcionar ainda:**
1. Verifique se o DNS propagou: `dig +short app.seu-dominio.com` (deve retornar um IP)
2. Verifique se o certificado foi validado: AWS Console > Certificate Manager
3. Verifique se os services estao healthy: veja Troubleshooting abaixo

---

## Uso das GitHub Actions

Todas as actions sao acionadas **manualmente** via `workflow_dispatch`. O operador informa suas credenciais AWS nos campos do formulario a cada execucao.

### Deploy
- **Trigger:** manual (Actions > "Deploy" > Run workflow)
- **Inputs:** `service` (backend/frontend/both), `aws_access_key_id`, `aws_secret_access_key`, `domain_url`
- Faz build da imagem Docker, push para o ECR e redeploy no ECS

### Terraform Plan
- **Trigger:** manual (Actions > "Terraform Plan" > Run workflow)
- **Inputs:** `aws_access_key_id`, `aws_secret_access_key`
- Executa `terraform plan` e mostra o resultado no log da action

### Terraform Apply
- **Trigger:** manual (Actions > "Terraform Apply" > Run workflow)
- **Inputs:** `aws_access_key_id`, `aws_secret_access_key`
- Executa `terraform apply -auto-approve`
- Usa os GitHub Secrets `DOMAIN_NAME`, `MONGODB_PASSWORD` e `MONGODB_USERNAME` para as variaveis do Terraform

### Terraform Destroy (com confirmacao)
- **Trigger:** manual (Actions > "Terraform Destroy" > Run workflow)
- **Inputs:** `confirm` (digitar "destroy"), `aws_access_key_id`, `aws_secret_access_key`
- **CUIDADO:** destroi TODA a infra, incluindo dados do MongoDB no EFS

### Update Secrets
- **Trigger:** manual (Actions > "Update Secrets" > Run workflow)
- **Inputs:** `parameter_name` (dropdown), `parameter_value`, `aws_access_key_id`, `aws_secret_access_key`, `restart_backend`
- Atualiza um parametro no SSM Parameter Store

---

## Nota Importante: ParameterStoreEnvProvider

O backend usa o `EnvProviderModule` para resolver configuracoes. Quando `NODE_ENV=prod` (unica env var injetada pelo ECS como environment), o modulo instancia o `ParameterStoreEnvProvider` que busca **todas** as configuracoes via SSM em runtime (`PORT`, `S3_BUCKET_NAME`, `FRONTEND_URL`, `MONGODB_URI`, `JWT_SELLER_SECRET`, `JWT_CUSTOMER_SECRET`).

**O problema:** os parametros SSM criados pelo Terraform usam prefixo `/products-manager/prod/{KEY}` (ex: `/products-manager/prod/MONGODB_URI`), mas o provider busca `/{KEY}` (ex: `/MONGODB_URI`).

**Voce precisa fazer UMA destas acoes antes do primeiro deploy:**

**Opcao A (recomendada) — alterar o provider:**

Edite `backend/src/providers/env/implementations/parameter-store/parameter-store.env-provider.ts`:

```typescript
// ANTES:
const command = new GetParameterCommand({
  Name: `/${key}`,
  WithDecryption: true,
});

// DEPOIS:
const command = new GetParameterCommand({
  Name: `/products-manager/prod/${key}`,
  WithDecryption: true,
});
```

**Opcao B — criar parametros sem prefixo:**

```bash
# Executar para cada parametro que o provider busca em runtime:
aws ssm put-parameter --name "/PORT" --value "3001" --type SecureString --overwrite
aws ssm put-parameter --name "/S3_BUCKET_NAME" --value "products-manager-prod-uploads" --type SecureString --overwrite
aws ssm put-parameter --name "/FRONTEND_URL" --value "https://app.seu-dominio.com" --type SecureString --overwrite
aws ssm put-parameter --name "/MONGODB_URI" --value "mongodb://admin:SUA_SENHA@mongodb.products-manager-prod.local:27017/products-manager?authSource=admin" --type SecureString --overwrite
aws ssm put-parameter --name "/JWT_SELLER_SECRET" --value "SEU_SECRET" --type SecureString --overwrite
aws ssm put-parameter --name "/JWT_CUSTOMER_SECRET" --value "SEU_SECRET" --type SecureString --overwrite
```

---

## Persistencia do MongoDB

- O MongoDB roda como container ECS Fargate com dados em **EFS** (Elastic File System)
- Os dados **sobrevivem** a reinicializacoes, re-deploys e atualizacoes de imagem
- Os dados **NAO sobrevivem** a um `terraform destroy` (o EFS e deletado junto)
- Roda como **single instance** (sem replica set)
- Para backups, configure o [AWS Backup para EFS](https://docs.aws.amazon.com/efs/latest/ug/awsbackup.html)

---

## Custos Estimados (mes)

| Recurso | Custo aprox. |
|---------|-------------|
| VPC Endpoints (5 Interface, 1 AZ) | ~$18 |
| VPC Endpoint S3 (Gateway) | Gratis |
| ECS Fargate (3 tasks, 256 CPU / 512 MB cada) | ~$22 |
| ALB | ~$16 |
| EFS (depende do uso) | ~$0.30/GB |
| Route 53 hosted zone | ~$0.50 |
| Dominio (.com, anual/12) | ~$1 |
| ACM Certificate | Gratis |
| S3, ECR, CloudWatch, SSM | ~$2 |
| **Total** | **~$60/mes** |

**Nota:** Cada VPC Interface Endpoint custa ~$3.60/mes (1 AZ x $0.01/h). Sao 5 endpoints de interface (ECR DKR, ECR API, CloudWatch Logs, SSM, EFS). O endpoint S3 e do tipo Gateway e e gratuito.

---

## Troubleshooting

### ECS task nao inicia
```bash
# Ver os ultimos eventos do service
aws ecs describe-services \
  --cluster products-manager-prod-cluster \
  --services products-manager-prod-backend \
  --query 'services[0].events[:5]'

# Ver logs do container
aws logs tail /ecs/products-manager-prod/backend --since 30m
```

### MongoDB nao conecta
```bash
# Verificar status
aws ecs describe-services \
  --cluster products-manager-prod-cluster \
  --services products-manager-prod-mongodb \
  --query 'services[0].{running: runningCount, desired: desiredCount, events: events[:3]}'

# Ver logs
aws logs tail /ecs/products-manager-prod/mongodb --since 30m
```

### Backend crasha no boot com erro do ParameterStoreEnvProvider
O backend busca todos os parametros via SSM em runtime. Se algum parametro nao existir ou estiver inacessivel, o container vai crashar. Verifique se os SSM parameters existem e tem valor:
```bash
aws ssm get-parameter --name "/products-manager/prod/PORT" --with-decryption --query 'Parameter.Value' --output text
aws ssm get-parameter --name "/products-manager/prod/S3_BUCKET_NAME" --with-decryption --query 'Parameter.Value' --output text
aws ssm get-parameter --name "/products-manager/prod/FRONTEND_URL" --with-decryption --query 'Parameter.Value' --output text
aws ssm get-parameter --name "/products-manager/prod/MONGODB_URI" --with-decryption --query 'Parameter.Value' --output text
aws ssm get-parameter --name "/products-manager/prod/JWT_SELLER_SECRET" --with-decryption --query 'Parameter.Value' --output text
aws ssm get-parameter --name "/products-manager/prod/JWT_CUSTOMER_SECRET" --with-decryption --query 'Parameter.Value' --output text
```

### Certificado ACM nao valida
1. Verifique se os nameservers do dominio apontam para a hosted zone do Terraform:
   ```bash
   dig +short NS seu-dominio.com
   ```
2. Verifique o status do certificado:
   ```bash
   aws acm list-certificates --query 'CertificateSummaryList[0]'
   ```
3. A propagacao DNS pode levar ate 48 horas em casos extremos (normalmente < 1h)

### Erro 503 no ALB
Os targets podem estar unhealthy. Verifique:
```bash
# Listar target groups
aws elbv2 describe-target-groups \
  --load-balancer-arn $(aws elbv2 describe-load-balancers --names products-manager-prod-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text) \
  --query 'TargetGroups[*].{name: TargetGroupName, arn: TargetGroupArn}' --output table

# Ver health de um target group especifico
aws elbv2 describe-target-health --target-group-arn <ARN_DO_TARGET_GROUP>
```

### Tasks nao conseguem puxar imagem do ECR
Os VPC Endpoints podem nao estar acessiveis. Verifique:
```bash
# Listar endpoints
aws ec2 describe-vpc-endpoints \
  --filters "Name=vpc-id,Values=$(aws ec2 describe-vpcs --filters 'Name=tag:Name,Values=products-manager-prod-vpc' --query 'Vpcs[0].VpcId' --output text)" \
  --query 'VpcEndpoints[*].{service: ServiceName, state: State}' --output table
```
Todos devem estar no estado `available`.

---

## Checklist Resumido

- [ ] Dominio comprado e ativo no Route 53
- [ ] Bucket S3 e tabela DynamoDB criados para o Terraform state
- [ ] Bloco `backend "s3"` em `infra/_versions.tf` atualizado com bucket e tabela
- [ ] `terraform init` executado com sucesso
- [ ] `terraform apply` concluido (todos os recursos criados)
- [ ] Nameservers do dominio atualizados para os do output do Terraform
- [ ] DNS propagado (`dig +short NS seu-dominio.com` retorna os nameservers corretos)
- [ ] Certificado ACM validado (status `ISSUED` no Console)
- [ ] GitHub Secrets configurados (3 secrets: `DOMAIN_NAME`, `MONGODB_PASSWORD`, `MONGODB_USERNAME`)
- [ ] Environment "production" criado no GitHub
- [ ] `ParameterStoreEnvProvider` ajustado (Opcao A ou B)
- [ ] Primeiro deploy executado (Actions > Deploy > both)
- [ ] 3 services rodando (desired=1, running=1 para backend, frontend e mongodb)
- [ ] Aplicacao acessivel via `https://app.seu-dominio.com`

---

## Limpeza Total

Para destruir toda a infra e **parar de pagar**:

1. Destruir via Actions (ou local):
   - Actions > "Terraform Destroy" > preencher credenciais AWS + digitar `destroy`
   - Ou localmente: `cd infra && terraform destroy -var="domain_name=seu-dominio.com" -var="mongodb_password=SUA_SENHA" -var="mongodb_username=admin"`

2. Deletar o state backend:
   ```bash
   aws s3 rb s3://SEU_STATE_BUCKET --force
   aws dynamodb delete-table --table-name SEU_LOCK_TABLE
   ```

3. (Opcional) O dominio continua registrado e cobrando anualmente. Para cancelar:
   - Route 53 > Registered domains > seu dominio > desabilitar auto-renovacao
   - O dominio expira no fim do periodo pago
