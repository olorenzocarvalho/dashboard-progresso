# Dashboard de Progresso - Pulso Tech

Dashboard em tempo real para acompanhar o progresso de desenvolvimento da plataforma Pulso Tech, integrado com o ClickUp para sincronização automática de tarefas.

## 🚀 Funcionalidades

- **Sincronização em tempo real** com o ClickUp
- **Atualização automática** a cada 5 minutos
- **Interface responsiva** com design moderno
- **Categorização automática** de tarefas por módulo
- **Visualização de progresso** com gráficos interativos
- **Status em tempo real** das conexões

## 🛠️ Tecnologias

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Backend**: Vercel Serverless Functions
- **API**: ClickUp API v2

## 📋 Estrutura do Projeto

```
dashboard-progresso/
├── api/
│   └── clickup.js          # API endpoint para integração com ClickUp
├── src/
│   ├── App.tsx             # Componente principal do dashboard
│   ├── main.tsx            # Ponto de entrada
│   └── assets/             # Assets estáticos
├── public/                 # Arquivos públicos
├── vercel.json            # Configuração do Vercel
└── package.json           # Dependências do projeto
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Configure a seguinte variável de ambiente no Vercel:

```
CLICKUP_API_KEY=pk_260692708_IWO0DAI98UIFQNZ6ILFQZAF43B3E9E8Y
```

### 2. IDs do ClickUp

O projeto está configurado para usar:

- **Space ID**: `90132806005`
- **List ID**: `901326742360`

## 🚀 Deploy no Vercel

### Método Automático (Recomendado)

1. **Conecte o repositório** ao Vercel
2. **Configure as variáveis de ambiente** no dashboard do Vercel
3. **Deploy automático** será iniciado

### Método Manual

```bash
# Instale o Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel --prod
```

## 🔄 Como Funciona a Sincronização

1. **API Endpoint** (`/api/clickup`) busca tarefas do ClickUp
2. **Categorização automática** baseada nos nomes das tarefas
3. **Cálculo de progresso** considerando:
   - `ok` = 100%
   - `em andamento` = 50%
   - `restante` = 0%
4. **Atualização automática** a cada 5 minutos
5. **Refresh manual** disponível no dashboard

## 📊 Categorias de Tarefas

As tarefas são automaticamente categorizadas com base nos nomes:

- **Cloud**: tarefas com "cloud" ou "railway"
- **Download Screen**: tarefas com "download" ou "landing"
- **Back-End**: tarefas com "backend", "api" ou "pulso"
- **Screen**: tarefas com "screen", "login" ou "serviços"

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd dashboard-progresso

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Build para Produção

```bash
# Build
npm run build

# Preview
npm run preview
```

## 🔧 Personalização

### Alterar IDs do ClickUp

Edite o arquivo `api/clickup.js`:

```javascript
const spaceId = 'SEU_SPACE_ID';
const listId = 'SUA_LIST_ID';
```

### Modificar Intervalo de Atualização

Edite o arquivo `src/App.tsx`:

```javascript
// Altere o valor em milissegundos
setInterval(() => {
  fetchDashboardData();
}, 5 * 60 * 1000); // 5 minutos
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de CORS**: Verifique se o endpoint está configurado corretamente
2. **Dados não atualizam**: Confirme a API Key do ClickUp está válida
3. **Build falha**: Verifique as variáveis de ambiente no Vercel

### Logs de Debug

O dashboard exibe logs no console do navegador para ajudar no debugging:

```javascript
console.log('Dados atualizados do ClickUp:', apiData);
console.error('Erro ao buscar dados da API:', err);
```

## 📝 Licença

Este projeto é privado e propriedade da Pulso Tech.

## 🤝 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.
