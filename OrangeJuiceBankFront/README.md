# 🍊 Orange Juice Bank Frontend

Aplicação frontend moderna e responsiva do Orange Juice Bank desenvolvida com React, TypeScript e Vite.

## 📋 Índice

- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Como Executar](#-como-executar)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades](#-funcionalidades)
- [Contribuição](#-contribuição)

## 🛠️ Tecnologias Utilizadas

- **React 19** - Framework principal
- **TypeScript** - Linguagem tipada
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Axios** - Requisições HTTP
- **CSS Variables** - Sistema de design

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** (vem com o Node.js) ou **yarn**

Para verificar as versões:
```bash
node --version
npm --version
```

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd OrangeJuiceBankFront
```

2. **Instale as dependências**
```bash
npm install
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

### Arquivo .env.example

```env
# Configurações da API
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000

# Configurações da aplicação
VITE_APP_NAME=Orange Juice Bank
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Configurações de autenticação
VITE_TOKEN_KEY=orange_juice_token
VITE_REFRESH_TOKEN_KEY=orange_juice_refresh_token

# Configurações de desenvolvimento
VITE_ENABLE_LOGS=true
VITE_ENABLE_DEBUG=true

# Configurações de produção (opcional)
VITE_ANALYTICS_ID=
VITE_SENTRY_DSN=
```

### Variáveis de Ambiente Explicadas

| Variável | Descrição | Valor Padrão | Obrigatório |
|----------|-----------|--------------|-------------|
| `VITE_API_BASE_URL` | URL base da API backend | `http://localhost:8080/api` | ✅ |
| `VITE_API_TIMEOUT` | Timeout das requisições (ms) | `10000` | ❌ |
| `VITE_APP_NAME` | Nome da aplicação | `Orange Juice Bank` | ❌ |
| `VITE_APP_VERSION` | Versão da aplicação | `1.0.0` | ❌ |
| `VITE_APP_ENVIRONMENT` | Ambiente (development/production) | `development` | ❌ |
| `VITE_TOKEN_KEY` | Chave para armazenar o token JWT | `orange_juice_token` | ❌ |
| `VITE_REFRESH_TOKEN_KEY` | Chave para armazenar refresh token | `orange_juice_refresh_token` | ❌ |
| `VITE_ENABLE_LOGS` | Habilitar logs no console | `true` | ❌ |
| `VITE_ENABLE_DEBUG` | Habilitar modo debug | `true` | ❌ |
| `VITE_ANALYTICS_ID` | ID do Google Analytics | - | ❌ |
| `VITE_SENTRY_DSN` | DSN do Sentry para monitoramento | - | ❌ |

## 🏃‍♂️ Como Executar

### Desenvolvimento

```bash
# Inicia o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

### Produção

```bash
# Gera a build de produção
npm run build

# Visualiza a build de produção
npm run preview
```

### Outros Comandos

```bash
# Executa o linter
npm run lint

# Executa o linter com correção automática
npm run lint -- --fix
```

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a build de produção |
| `npm run preview` | Visualiza a build de produção |
| `npm run lint` | Executa o linter |
| `npm run type-check` | Verifica tipos TypeScript |

## 📁 Estrutura do Projeto

```
OrangeJuiceBankFront/
├── public/                 # Arquivos públicos
│   └── vite.svg           # Favicon
├── src/                   # Código fonte
│   ├── api/              # Serviços de API
│   │   ├── account.ts    # API de contas
│   │   └── auth.ts       # API de autenticação
│   ├── components/       # Componentes reutilizáveis
│   │   ├── BalanceCard.tsx
│   │   ├── TransactionList.tsx
│   │   └── Form/
│   │       └── Input.tsx
│   ├── hooks/            # Hooks customizados
│   │   └── useAuth.ts
│   ├── pages/            # Páginas da aplicação
│   │   ├── LoginPage/
│   │   ├── RegisterPage/
│   │   ├── DashboardPage/
│   │   ├── DepositPage/
│   │   ├── WithdrawPage/
│   │   ├── TransferPage/
│   │   ├── BuyAssetPage/
│   │   └── ReportsPage/
│   ├── routes/           # Componentes de roteamento
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicOnlyRoute.tsx
│   ├── utils/            # Utilitários
│   │   └── token.ts
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Ponto de entrada
│   ├── index.css         # Estilos globais
│   └── vite-env.d.ts     # Tipos do Vite
├── .env                  # Variáveis de ambiente
├── .env.example          # Exemplo de variáveis
├── package.json          # Dependências e scripts
├── tsconfig.json         # Configuração TypeScript
├── vite.config.ts        # Configuração Vite
└── README.md             # Documentação
```

## 🎯 Funcionalidades

### 🔐 Autenticação
- Login com email e senha
- Registro de novos usuários
- Proteção de rotas
- Gerenciamento de tokens JWT

### 💰 Gestão Financeira
- **Dashboard** - Visão geral das contas
- **Depósito** - Adicionar dinheiro à conta
- **Saque** - Retirar dinheiro da conta
- **Transferência** - Entre contas próprias ou para outros usuários
- **Investimentos** - Compra de ativos financeiros

### 📊 Relatórios
- Relatório de Imposto de Renda
- Extrato de transações
- Portfólio de investimentos
- Relatório de investimentos

### 📱 Responsividade
- Design mobile-first
- Adaptável para tablet e desktop
- Interface touch-friendly

## 🔧 Configurações Avançadas

### Personalizando o Design

As cores e estilos podem ser personalizados editando as variáveis CSS em `src/index.css`:

```css
:root {
  --primary-orange: #ff6b35;
  --primary-orange-dark: #e55a2b;
  --primary-orange-light: #ff8a5c;
  /* ... outras variáveis */
}
```

### Configurando a API

Para conectar com um backend diferente, atualize a variável `VITE_API_BASE_URL` no arquivo `.env`:

```env
VITE_API_BASE_URL=https://sua-api.com/api
```

### Ambiente de Produção

Para deploy em produção:

1. Configure as variáveis de ambiente para produção
2. Execute `npm run build`
3. Os arquivos estarão na pasta `dist/`
4. Faça deploy dos arquivos da pasta `dist/`

## 🐛 Solução de Problemas

### Erro de CORS
Se encontrar erros de CORS, verifique se o backend está configurado para aceitar requisições do frontend.

### Erro de Build
Se o build falhar, tente:
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problemas de Tipos TypeScript
```bash
# Verificar tipos
npm run type-check
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a seção [Solução de Problemas](#-solução-de-problemas)
2. Abra uma issue no repositório
3. Entre em contato com a equipe de desenvolvimento

---

**🍊 Orange Juice Bank** - Transformando a experiência bancária digital!
