# 🍊 OrangeJuiceBank - API

API de banco digital com funcionalidades de conta, investimentos e relatórios.

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- **.NET 9.0** ou superior
- **SQL Server** (ou SQL Server Express)
- **Docker** (opcional, para rodar SQL Server)

### 1. Configurar Banco de Dados

#### Opção A: Usando Docker
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Your_password123" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

#### Opção B: SQL Server Local
- Instale o SQL Server
- Crie um banco chamado `OrangeJuiceBank`
- Atualize a connection string em `appsettings.json`

### 2. Executar Migrações
```bash
cd OrangeJuiceBank.API
dotnet ef database update
```

### 3. Rodar a API
```bash
cd OrangeJuiceBank.API
dotnet run
```

A API estará disponível em: `https://localhost:7001` (ou porta similar)
Swagger UI: `https://localhost:7001/swagger`

## 🔐 Autenticação

A API usa **JWT Bearer Token**. Para acessar rotas protegidas:

1. **Registrar usuário**: `POST /api/auth/register`
2. **Fazer login**: `POST /api/auth/login`
3. **Usar o token** no header: `Authorization: Bearer {token}`

## 📋 Rotas Disponíveis

### 🔑 Autenticação
- `POST /api/auth/register` - Cadastrar usuário
- `POST /api/auth/login` - Fazer login

### 💰 Contas
- `POST /api/account` - Criar conta
- `GET /api/account` - Listar contas do usuário
- `GET /api/account/{id}/balance` - Ver saldo
- `POST /api/account/{id}/deposit` - Fazer depósito
- `POST /api/account/{id}/withdraw` - Fazer saque
- `POST /api/account/transfer` - Transferência entre contas
- `POST /api/account/transfer-by-email` - Transferência por email
- `GET /api/account/{id}/statement` - Extrato (com filtros de data opcionais)

### 📈 Investimentos
- `GET /api/investment/portfolio` - Ver portfólio de investimentos
- `POST /api/investment/buy` - Comprar ativo
- `POST /api/investment/sell` - Vender ativo

### 📊 Relatórios
- `GET /api/reports/tax?year={ano}` - Relatório de impostos
- `GET /api/reports/investments` - Resumo de investimentos

### 💎 Ativos
- `GET /api/assets` - Listar ativos disponíveis

## 🧪 Testes

```bash
cd OrangeJuiceBank.Tests
dotnet test
```

## 📁 Estrutura do Projeto

```
OrangeJuiceBank/
├── OrangeJuiceBank.API/          # API Web
├── OrangeJuiceBank.Domain/       # Entidades e Interfaces
├── OrangeJuiceBank.Infrastructure/ # Implementações e Banco
└── OrangeJuiceBank.Tests/        # Testes Unitários
```

## 🔧 Configuração

Edite `appsettings.json` para configurar:
- **Connection String** do banco de dados
- **Chave JWT** para autenticação
- **Issuer/Audience** do JWT

## 📝 Exemplo de Uso

```bash
# 1. Registrar usuário
curl -X POST "https://localhost:7001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"João Silva","email":"joao@email.com","cpf":"12345678901","birthDate":"1990-01-01","password":"123456"}'

# 2. Fazer login
curl -X POST "https://localhost:7001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"123456"}'

# 3. Usar token para acessar rotas protegidas
curl -X GET "https://localhost:7001/api/account" \
  -H "Authorization: Bearer {token_aqui}"
``` 