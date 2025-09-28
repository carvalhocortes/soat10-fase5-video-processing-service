# Sistema de Autoatendimento para Fast Food

## Sobre o Projeto

Este projeto é uma implementação de um sistema de autoatendimento para uma lanchonete, com o objetivo de melhorar a eficiência no gerenciamento de pedidos e estoques, bem como aprimorar a experiência dos clientes. Este sistema foi desenvolvido como parte do **SOAT Tech Challenge**.

---

## Funcionalidades Principais

### Para Clientes:

- **Montagem de Pedidos**:
  - Escolha de lanche, acompanhamento, bebida e sobremesa.
  - Exibição de nomes, descrições e preços dos produtos.
- **Acompanhamento de Pedidos**:
  - Status em tempo real: Recebido, Em preparação, Pronto, Finalizado.

### Para Administradores:

- Gerenciamento produtos.
- Acompanhamento de pedidos em andamento.

---

## Tecnologias Utilizadas

- **Linguagem**: TypeScript
- **Plataforma**: Node.js
- **Arquitetura**:
  - **Fase 1:** Hexagonal
  - **Fase 2:** Arquitetura limpa
  - **Fase 3:** Arquitetura limpa + Serverless
- **Banco de Dados**:
  - **Fase 1 e 2:** MongoDB
  - **Fase 3:** DynamoDB
- **APIs REST**:
  - Cadastro de clientes.
  - Identificação de clientes via CPF.
  - CRUD de produtos.
  - Busca de produtos por categoria.
  - Finalização de pedidos (Fake checkout).
  - Listagem de pedidos.
  - Webhook de pagamento

---

## Requisitos

- **git** instalado.
- **node** instalado.
- **Docker** e **Docker Compose** instalados.
- **kubectl** instalado.
- **kind** instalado.
- **Postman** instalado.

---

## Como Executar o Projeto Localmente

1. Clone este repositório:

   ```bash
   git clone https://github.com/samuelvictors/fiap-tech-challenge
   cd fiap-tech-challenge
   ```

2. Configure o ambiente com Docker:

   - Execute:
     ```bash
     docker-compose up
     ```

3. Baixe os arquivos do postman para consumir as APIs:

- [Link para baixar a collection](https://drive.google.com/file/d/18__h4UjPzukVrjlybZGxbHr6-5Ba6BaA/view?usp=sharing)

4. Documentação

- O arquivo está na pasta docs
- É possível criar um servidor com a documentação usando: `npm run preview-docs`

---

## Como execultar com Kubernetes local
Passo a passo detalhado para executar o projeto usando Kind.

1. Iniciar a Infra na AWS nos REPOS

[Terraform do Banco de Dados Dynamo] (https://github.com/carvalhocortes/POSTECH_SOAT_DB_Terraform)
[Terraform do ECR e EKS da AWS] (https://github.com/carvalhocortes/POSTECH_SOAT_Kubernets_Terraform)

2. Criar o cluster

```bash
# Criar o cluster usando a configuração
kind create cluster --config ./k8s/kind-config.yaml --name desktop

# Verificar se o cluster está rodando
kubectl cluster-info
```

3. Instalar o Ingress NGINX Controller

```bash
# Aplicar as configurações do Ingress NGINX
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Aguardar o Ingress Controller estar pronto
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

```

4. Instalar Metrics Server

```bash
# Aplicar as configurações do Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verificar se está funcionando
kubectl get deployment metrics-server -n kube-system
```

5. Aplicar as configurações do projeto
```bash
# Aplicar os recursos
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment-app.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
```

6. Testar a aplicação

```bash
# A aplicação estará disponível em: http://localhost
curl http://localhost/health
```

7. Observações importantes:

- Aguardar o Ingress Controller estar completamente inicializado antes de aplicar o ingress.yaml
- Verificar se todos os pods estão em estado "Running" antes de testar a aplicação

---

## Autores

- **Fernando Carvalho de Paula Cortes** - rm360486
- **Samuel Victor Santos** - rm360487

---

## Entregáveis

- **Documentação do sistema**:
  - Modelos de Event Storming para os fluxos de pedidos e pagamentos e demais diagramas diagramas.
    - [Link para o miro](https://miro.com/app/board/uXjVL0KKybY=/)
- **Código-fonte**:
  - Disponível no repositório.
- **Diagrama da Arquitetura**:
  - FASE2: ![image](https://github.com/user-attachments/assets/02b5289a-ca09-4172-91b5-843bd180d6ee)
- **Vídeo de demonstração**:
  - [Link para o vídeo demonstrativo - Fase 1](https://youtu.be/aJ1sZek5Xcc)
  - [Link para o vídeo demonstrativo - Fase 2](https://youtu.be/0k59qSWYGlg)
  - [Link para o vídeo demonstrativo - Fase 3](https://youtu.be/ZdJBwlBb8GY)
- **Outros Repos do projeto**:
  - [Repo Lambda](https://github.com/carvalhocortes/POSTECH_SOAT_LAMBDA)
  - [Repo Terraform Kubernets](https://github.com/carvalhocortes/POSTECH_SOAT_Kubernets_Terraform)
  - [Repo Terraform DynamoDB](https://github.com/carvalhocortes/POSTECH_SOAT_DB_Terraform)

---

## Licença

Este projeto é desenvolvido para fins educacionais como parte do SOAT Tech Challenge. Todos os direitos reservados.
