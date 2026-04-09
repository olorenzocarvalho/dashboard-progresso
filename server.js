import express from 'express';
import path from 'path';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// ClickUp API configuration
const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
const LIST_ID = '901326742360';

// API endpoint to get ClickUp data
app.get('/api/clickup', async (req, res) => {
  try {
    if (!CLICKUP_API_KEY) {
      return res.status(500).json({ error: 'ClickUp API key not configured' });
    }

    const response = await axios.get(`https://api.clickup.com/api/v2/list/${LIST_ID}/task`, {
      headers: {
        'Authorization': CLICKUP_API_KEY,
      },
    });

    const tasks = response.data.tasks;
    console.log('Total de tarefas:', tasks.length);

    // Process tasks similar to the existing API
    const categories = {
      'Cloud': [],
      'Download Screen': [],
      'Back-End': [],
      'Screen': [],
    };

    tasks.forEach(task => {
      const name = task.name.toLowerCase();
      const tags = task.tags.map(tag => tag.name.toLowerCase());

      if (tags.includes('cloud') || name.includes('cloud')) {
        categories['Cloud'].push(task);
      } else if (tags.includes('download screen') || name.includes('download screen')) {
        categories['Download Screen'].push(task);
      } else if (tags.includes('back-end') || name.includes('back-end')) {
        categories['Back-End'].push(task);
      } else if (tags.includes('screen') || name.includes('screen')) {
        categories['Screen'].push(task);
      }
    });

    // Calculate progress
    const calculateProgress = (tasks) => {
      if (tasks.length === 0) return 0;
      let progressSum = 0;
      
      tasks.forEach(task => {
        const tags = task.tags.map(tag => tag.name.toLowerCase());
        if (tags.includes('ok')) {
          progressSum += 1;
        } else if (tags.includes('em andamento')) {
          progressSum += 0.5;
        }
      });
      
      return (progressSum / tasks.length) * 100;
    };

    const overallProgress = calculateProgress(tasks);
    const total = tasks.length;

    const responseData = {
      overallStatus: [
        { label: 'Ok', percent: overallProgress, color: '#10b981' },
        { label: 'Em andamento', percent: 100 - overallProgress, color: '#3b82f6' },
      ],
      itemDistribution: Object.keys(categories).map(category => ({
        label: category,
        count: categories[category].length,
        percent: (categories[category].length / total) * 100,
        color: '',
      })),
      mainProgress: Object.keys(categories).map(category => ({
        label: category,
        percent: calculateProgress(categories[category]),
        colorClass: '',
        textClass: '',
        shadowClass: '',
      })),
      backendTopics: [
        { label: 'Pulso CSA', percent: 52.94 },
        { label: 'Cloud IAC', percent: 31.25 },
        { label: 'FinOps', percent: 25 },
        { label: 'Inteligência de Dados', percent: 30 },
        { label: 'Insights', percent: 50 },
        { label: 'Stripe', percent: 50 },
        { label: 'Relatórios', percent: 0 },
      ],
      screenTopics: [
        { label: 'Login', percent: 16.67 },
        { label: 'Serviços', percent: 10 },
        { label: 'Minha Conta', percent: 10 },
        { label: 'Tema Branco', percent: 50 },
        { label: 'Atualizações', percent: 50 },
        { label: 'Convite do Usuário', percent: 50 },
        { label: 'Stripe', percent: 50 },
        { label: 'Documentos', percent: 25 },
      ],
      downloadScreenTopics: [
        { label: 'Início', percent: 100 },
        { label: 'Sobre', percent: 100 },
        { label: 'Plataforma', percent: 100 },
        { label: 'Planos', percent: 100 },
        { label: 'Contato', percent: 100 },
        { label: 'Download', percent: 100 },
        { label: 'ChatBot - Dúvidas', percent: 0 },
        { label: 'Login - Entrar', percent: 50 },
      ],
      cloudTopics: [
        { label: 'Railway', percent: 100 },
      ],
      lastUpdate: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    };

    res.json(responseData);
  } catch (error) {
    console.error('Erro na API:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do ClickUp' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
