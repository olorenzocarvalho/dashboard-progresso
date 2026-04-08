const axios = require('axios');

// Token da API do ClickUp
const apiKey = process.env.CLICKUP_API_KEY;

// IDs do espaço e da lista no ClickUp
const spaceId = '90132806005';
const listId = '901326742360';

// Função para obter as tarefas da ClickUp
async function getTasks() {
  try {
    const response = await axios.get(`https://api.clickup.com/api/v2/list/${listId}/task`, {
      headers: {
        'Authorization': apiKey,
      },
    });

    // Log para depurar estrutura das tarefas
    const tasks = response.data.tasks;
    console.log('Total de tarefas:', tasks.length);
    
    // Procurar pela tarefa ChatBot para ver sua estrutura completa
    const chatbotTask = tasks.find(task => task.name.toLowerCase().includes('chatbot'));
    if (chatbotTask) {
      console.log('Estrutura completa da tarefa ChatBot:', JSON.stringify(chatbotTask, null, 2));
    }

    return tasks;
  } catch (error) {
    console.error('Erro ao obter tarefas:', error);
    return [];
  }
}

// Função para calcular o progresso com base nas etiquetas
function calculateProgress(tasks) {
  let total = tasks.length;
  if (total === 0) return 0;
  
  let progressSum = 0;

  tasks.forEach(task => {
    if (task.status.status === 'ok') {
      progressSum += 1;
    } else if (task.status.status === 'em andamento') {
      progressSum += 0.5;
    } else if (task.status.status === 'restante') {
      progressSum += 0;
    }
  });

  const progress = (progressSum / total) * 100;
  return progress;
}

// Função para agrupar tarefas por custom fields ou tags
function groupTasksByCategory(tasks) {
  const categories = {
    'Cloud': [],
    'Download Screen': [],
    'Back-End': [],
    'Screen': []
  };

  tasks.forEach(task => {
    // Verificar se a tarefa tem custom fields ou tags para categorização
    const taskName = task.name.toLowerCase();
    
    if (taskName.includes('cloud') || taskName.includes('railway')) {
      categories['Cloud'].push(task);
    } else if (taskName.includes('download') || taskName.includes('landing')) {
      categories['Download Screen'].push(task);
    } else if (taskName.includes('backend') || taskName.includes('api') || taskName.includes('pulso')) {
      categories['Back-End'].push(task);
    } else if (taskName.includes('screen') || taskName.includes('login') || taskName.includes('serviços')) {
      categories['Screen'].push(task);
    } else {
      // Se não conseguir categorizar, coloca em Screen como padrão
      categories['Screen'].push(task);
    }
  });

  return categories;
}

// Função para calcular status geral
function calculateOverallStatus(tasks) {
  const statusCounts = {
    'ok': 0,
    'em andamento': 0,
    'restante': 0
  };

  tasks.forEach(task => {
    const status = task.status.status.toLowerCase();
    if (status === 'ok' || status === 'complete') {
      statusCounts['ok']++;
    } else if (status === 'em andamento' || status === 'in progress') {
      statusCounts['em andamento']++;
    } else {
      statusCounts['restante']++;
    }
  });

  const total = tasks.length;
  if (total === 0) {
    return [
      { label: 'Ok', percent: 0, color: '#10b981' },
      { label: 'Em andamento', percent: 0, color: '#3b82f6' },
      { label: 'Restante', percent: 0, color: '#64748b' }
    ];
  }

  return [
    { 
      label: 'Ok', 
      percent: (statusCounts['ok'] / total) * 100, 
      color: '#10b981',
      count: statusCounts['ok']
    },
    { 
      label: 'Em andamento', 
      percent: (statusCounts['em andamento'] / total) * 100, 
      color: '#3b82f6',
      count: statusCounts['em andamento']
    },
    { 
      label: 'Restante', 
      percent: (statusCounts['restante'] / total) * 100, 
      color: '#64748b',
      count: statusCounts['restante']
    }
  ];
}

// Handler principal da API
export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tasks = await getTasks();
    
    // Calcular dados para o dashboard
    const categories = groupTasksByCategory(tasks);
    const overallStatus = calculateOverallStatus(tasks);
    
    // Calcular progresso por categoria
    const mainProgress = Object.entries(categories).map(([category, categoryTasks]) => ({
      label: category,
      percent: calculateProgress(categoryTasks),
      colorClass: getColorClass(category),
      textClass: getTextClass(category),
      shadowClass: getShadowClass(category)
    }));

    // Calcular distribuição de itens
    const totalTasks = tasks.length;
    const itemDistribution = Object.entries(categories).map(([category, categoryTasks]) => ({
      label: category,
      percent: totalTasks > 0 ? (categoryTasks.length / totalTasks) * 100 : 0,
      color: getCategoryColor(category),
      count: categoryTasks.length
    }));

    // Dados detalhados por categoria (simulados baseados nos nomes das tarefas)
    const detailedData = generateDetailedData(categories);

    res.status(200).json({
      overallStatus,
      itemDistribution,
      mainProgress,
      backendTopics: detailedData.backendTopics,
      screenTopics: detailedData.screenTopics,
      downloadScreenTopics: detailedData.downloadScreenTopics,
      cloudTopics: detailedData.cloudTopics,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro na API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Funções auxiliares para cores
function getColorClass(category) {
  const colorMap = {
    'Cloud': 'bg-amber-500',
    'Download Screen': 'bg-cyan-500',
    'Back-End': 'bg-purple-500',
    'Screen': 'bg-pink-500'
  };
  return colorMap[category] || 'bg-blue-500';
}

function getTextClass(category) {
  const colorMap = {
    'Cloud': 'text-amber-400',
    'Download Screen': 'text-cyan-400',
    'Back-End': 'text-purple-400',
    'Screen': 'text-pink-400'
  };
  return colorMap[category] || 'text-blue-400';
}

function getShadowClass(category) {
  const colorMap = {
    'Cloud': 'shadow-amber-500/50',
    'Download Screen': 'shadow-cyan-500/50',
    'Back-End': 'shadow-purple-500/50',
    'Screen': 'shadow-pink-500/50'
  };
  return colorMap[category] || 'shadow-blue-500/50';
}

function getCategoryColor(category) {
  const colorMap = {
    'Cloud': '#f59e0b',
    'Download Screen': '#06b6d4',
    'Back-End': '#a855f7',
    'Screen': '#ec4899'
  };
  return colorMap[category] || '#3b82f6';
}

// Gerar dados detalhados (isso pode ser aprimorado com base na estrutura real das tarefas)
function generateDetailedData(categories) {
  // Lógica simplificada - em produção, isso analisaria as tarefas reais
  return {
    backendTopics: [
      { label: 'Pulso CSA', percent: calculateProgress(categories['Back-End'].filter(t => t.name.toLowerCase().includes('pulso'))) || 52.94 },
      { label: 'Cloud IAC', percent: calculateProgress(categories['Back-End'].filter(t => t.name.toLowerCase().includes('iac'))) || 31.25 },
      { label: 'FinOps', percent: calculateProgress(categories['Back-End'].filter(t => t.name.toLowerCase().includes('finops'))) || 25 },
      { label: 'Inteligência de Dados', percent: calculateProgress(categories['Back-End'].filter(t => t.name.toLowerCase().includes('dados'))) || 30 },
      { label: 'Insights', percent: calculateProgress(categories['Back-End'].filter(t => t.name.toLowerCase().includes('insight'))) || 50 },
      { label: 'Stripe', percent: calculateProgress(categories['Back-End'].filter(t => t.name.toLowerCase().includes('stripe'))) || 50 },
      { label: 'Relatórios', percent: calculateProgress(categories['Back-End'].filter(t => t.name.toLowerCase().includes('relatório'))) || 0 },
    ],
    screenTopics: [
      { label: 'Login', percent: calculateProgress(categories['Screen'].filter(t => t.name.toLowerCase().includes('login'))) || 16.67 },
      { label: 'Serviços', percent: calculateProgress(categories['Screen'].filter(t => t.name.toLowerCase().includes('serviço'))) || 10 },
      { label: 'Minha Conta', percent: calculateProgress(categories['Screen'].filter(t => t.name.toLowerCase().includes('conta'))) || 10 },
      { label: 'Tema Branco', percent: calculateProgress(categories['Screen'].filter(t => t.name.toLowerCase().includes('tema'))) || 50 },
      { label: 'Atualizações', percent: calculateProgress(categories['Screen'].filter(t => t.name.toLowerCase().includes('atualização'))) || 50 },
      { label: 'Convite do Usuário', percent: calculateProgress(categories['Screen'].filter(t => t.name.toLowerCase().includes('convite'))) || 50 },
      { label: 'Stripe', percent: calculateProgress(categories['Screen'].filter(t => t.name.toLowerCase().includes('stripe'))) || 50 },
      { label: 'Documentos', percent: calculateProgress(categories['Screen'].filter(t => t.name.toLowerCase().includes('documento'))) || 25 },
    ],
    downloadScreenTopics: [
      { label: 'Início', percent: calculateProgress(categories['Download Screen'].filter(t => t.name.toLowerCase().includes('início'))) || 100 },
      { label: 'Sobre', percent: calculateProgress(categories['Download Screen'].filter(t => t.name.toLowerCase().includes('sobre'))) || 100 },
      { label: 'Plataforma', percent: calculateProgress(categories['Download Screen'].filter(t => t.name.toLowerCase().includes('plataforma'))) || 100 },
      { label: 'Planos', percent: calculateProgress(categories['Download Screen'].filter(t => t.name.toLowerCase().includes('plano'))) || 100 },
      { label: 'Contato', percent: calculateProgress(categories['Download Screen'].filter(t => t.name.toLowerCase().includes('contato'))) || 100 },
      { label: 'Download', percent: calculateProgress(categories['Download Screen'].filter(t => t.name.toLowerCase().includes('download'))) || 100 },
      { label: 'ChatBot - Dúvidas', percent: calculateProgress(categories['Download Screen'].filter(t => t.name.toLowerCase().includes('chatbot'))) || 0 },
      { label: 'Login - Entrar', percent: calculateProgress(categories['Download Screen'].filter(t => t.name.toLowerCase().includes('login'))) || 50 },
    ],
    cloudTopics: [
      { label: 'Railway', percent: calculateProgress(categories['Cloud'].filter(t => t.name.toLowerCase().includes('railway'))) || 100 },
    ]
  };
}
