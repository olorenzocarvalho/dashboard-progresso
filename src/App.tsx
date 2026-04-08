import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Monitor, 
  Cloud, 
  Download, 
  Target, 
  Activity, 
  PieChart as PieChartIcon, 
  LayoutDashboard,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

// --- Dados Dinâmicos ---

interface DashboardData {
  overallStatus: Array<{ label: string; percent: number; color: string; count?: number }>;
  itemDistribution: Array<{ label: string; percent: number; color: string; count: number }>;
  mainProgress: Array<{ label: string; percent: number; colorClass: string; textClass: string; shadowClass: string }>;
  backendTopics: Array<{ label: string; percent: number }>;
  screenTopics: Array<{ label: string; percent: number }>;
  downloadScreenTopics: Array<{ label: string; percent: number }>;
  cloudTopics: Array<{ label: string; percent: number }>;
  lastUpdated: string;
}

// Dados estáticos como fallback
const fallbackData = {
  overallStatus: [
    { label: 'Ok', percent: 12.5, color: '#10b981' },
    { label: 'Em andamento', percent: 75, color: '#3b82f6' },
    { label: 'Restante', percent: 12.5, color: '#64748b' },
  ],
  itemDistribution: [
    { label: 'Cloud', percent: 4.545454545454545, color: '#f59e0b', count: 4 },
    { label: 'Download Screen', percent: 9.090909090909091, color: '#06b6d4', count: 8 },
    { label: 'Back-End', percent: 57.95454545454545, color: '#a855f7', count: 51 },
    { label: 'Screen', percent: 28.40909090909091, color: '#ec4899', count: 25 },
  ],
  mainProgress: [
    { label: 'Cloud', percent: 100, colorClass: 'bg-amber-500', textClass: 'text-amber-400', shadowClass: 'shadow-amber-500/50' },
    { label: 'Download Screen', percent: 81.25, colorClass: 'bg-cyan-500', textClass: 'text-cyan-400', shadowClass: 'shadow-cyan-500/50' },
    { label: 'Screen', percent: 50, colorClass: 'bg-pink-500', textClass: 'text-pink-400', shadowClass: 'shadow-pink-500/50' },
    { label: 'Back-End', percent: 41.1764705882398, colorClass: 'bg-purple-500', textClass: 'text-purple-400', shadowClass: 'shadow-purple-500/50' },
  ],
  backendTopics: [
    { label: 'Pulso CSA', percent: 52.94117647058824 },
    { label: 'Cloud IAC', percent: 31.25 },
    { label: 'FinOps', percent: 25 },
    { label: 'Inteligência de Dados', percent: 30 },
    { label: 'Insights', percent: 50 },
    { label: 'Stripe', percent: 50 },
    { label: 'Relatórios', percent: 0 },
  ],
  screenTopics: [
    { label: 'Login', percent: 16.66666666666667 },
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
  lastUpdated: new Date().toISOString()
};


// --- Componentes Reutilizáveis ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#1a1f2e] border border-[#2a3142] rounded-2xl p-6 shadow-xl ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ title, icon: Icon, color = "text-white" }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`p-2 rounded-lg bg-slate-800 border border-slate-700 ${color}`}>
      <Icon size={20} />
    </div>
    <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
  </div>
);

const ProgressBar = ({ label, percent, colorClass = "bg-blue-500", textClass = "text-blue-400", shadowClass = "shadow-blue-500/50" }) => (
  <div className="mb-4 w-full">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-slate-300 text-sm font-medium">{label}</span>
      <span className={`text-sm font-bold ${textClass} drop-shadow-md`}>{percent.toFixed(1)}%</span>
    </div>
    <div className="w-full bg-[#0f141e] rounded-full h-2.5 border border-[#2a3142]">
      <div
        className={`h-full rounded-full ${colorClass} shadow-[0_0_10px_rgba(0,0,0,0.5)] ${shadowClass} transition-all duration-1000 ease-out`}
        style={{ width: `${Math.max(percent, 0)}%` }}
      ></div>
    </div>
  </div>
);

const CustomPieChart = ({ data, holeSize = "60%" }) => {
  let currentPercent = 0;
  const gradientStops = data.map(seg => {
    const start = currentPercent;
    const end = currentPercent + seg.percent;
    currentPercent = end;
    return `${seg.color} ${start}% ${end}%`;
  }).join(', ');

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className="relative rounded-full flex items-center justify-center w-40 h-40 mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ background: `conic-gradient(${gradientStops})` }}
      >
        <div 
          className="absolute bg-[#1a1f2e] rounded-full flex items-center justify-center"
          style={{ width: holeSize, height: holeSize }}
        >
          <Activity size={24} className="text-slate-500 opacity-50" />
        </div>
      </div>
      
      <div className="w-full flex flex-col gap-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span className="text-slate-300">{item.label}</span>
              {item.count && <span className="text-slate-500 text-xs ml-1">({item.count})</span>}
            </div>
            <span className="font-bold text-white" style={{ color: item.color }}>
              {item.percent.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


// --- Componente Principal ---

export default function App() {
  const [data, setData] = useState<DashboardData>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Função para buscar dados da API
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/clickup');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiData = await response.json();
      setData(apiData);
      setLastRefresh(new Date());
      console.log('Dados atualizados do ClickUp:', apiData);
    } catch (err) {
      console.error('Erro ao buscar dados da API:', err);
      setError('Não foi possível carregar dados do ClickUp. Usando dados estáticos.');
      // Mantém os dados de fallback em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // useEffect para buscar dados na montagem do componente
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // useEffect para atualização automática a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  // Função para refresh manual
  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  if (loading && data === fallbackData) {
    return (
      <div className="min-h-screen bg-[#121620] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-cyan-400 mx-auto mb-4" size={48} />
          <p className="text-white text-lg">Carregando dados do ClickUp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121620] p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#1a1f2e] p-6 rounded-2xl mb-8 border border-[#2a3142] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex items-center gap-5 z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <div className="w-full h-full bg-[#1a1f2e] rounded-[10px] flex items-center justify-center">
                 <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-purple-500">P</span>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              PULSO <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">TECH</span>
            </h1>
            <p className="text-slate-400 text-sm tracking-[0.2em] mt-1 font-medium">PROGRESSO DA PLATAFORMA</p>
          </div>
        </div>

        <div className="mt-6 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center gap-3 z-10">
          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-xs font-semibold text-red-400">{error}</span>
            </div>
          )}
          <div className="px-4 py-2 bg-[#0f141e] border border-[#2a3142] rounded-lg flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'} ${!error && 'animate-pulse'} shadow-[0_0_8px_rgba(16,185,129,0.8)]`}></div>
            <span className={`text-xs font-semibold ${error ? 'text-red-400' : 'text-emerald-400'} uppercase tracking-wider`}>
              {error ? 'Erro' : 'Sistema Ativo'}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center gap-2 hover:bg-cyan-500/20 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={16} className={`text-cyan-400 ${loading && 'animate-spin'}`} />
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              {loading ? 'Atualizando...' : 'Atualizar'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Main Progress Overview (Span 2 cols on lg) */}
        <Card className="lg:col-span-2 flex flex-col justify-center">
          <SectionTitle title="Progresso por Módulo" icon={Target} color="text-cyan-400" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {data.mainProgress.map((item, idx) => (
              <ProgressBar 
                key={idx} 
                label={item.label} 
                percent={item.percent} 
                colorClass={item.colorClass} 
                textClass={item.textClass}
                shadowClass={item.shadowClass}
              />
            ))}
          </div>
        </Card>

        {/* Global Status Pie */}
        <Card>
          <SectionTitle title="Status Geral" icon={PieChartIcon} color="text-emerald-400" />
          <CustomPieChart data={data.overallStatus} holeSize="65%" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Item Distribution Pie */}
        <Card>
          <SectionTitle title={`Distribuição de Itens (Total: ${data.itemDistribution.reduce((sum, item) => sum + item.count, 0)})`} icon={LayoutDashboard} color="text-amber-400" />
          <CustomPieChart data={data.itemDistribution} holeSize="55%" />
        </Card>

        {/* Back-End Breakdown */}
        <Card className="lg:col-span-2">
          <SectionTitle title="Back-End Detalhado" icon={Server} color="text-purple-400" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {data.backendTopics.map((item, idx) => (
              <ProgressBar 
                key={idx} 
                label={item.label} 
                percent={item.percent} 
                colorClass="bg-purple-500" 
                textClass="text-purple-300"
                shadowClass="shadow-purple-500/20"
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Grid for Remaining Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Screen Breakdown */}
        <Card>
          <SectionTitle title="Screen" icon={Monitor} color="text-pink-400" />
          <div className="flex flex-col gap-1">
            {data.screenTopics.map((item, idx) => (
              <ProgressBar 
                key={idx} 
                label={item.label} 
                percent={item.percent} 
                colorClass="bg-pink-500" 
                textClass="text-pink-300"
                shadowClass="shadow-pink-500/20"
              />
            ))}
          </div>
        </Card>

        {/* Download Screen Breakdown */}
        <Card>
          <SectionTitle title="Download Screen" icon={Download} color="text-cyan-400" />
          <div className="flex flex-col gap-1">
            {data.downloadScreenTopics.map((item, idx) => (
              <ProgressBar 
                key={idx} 
                label={item.label} 
                percent={item.percent} 
                colorClass="bg-cyan-500" 
                textClass="text-cyan-300"
                shadowClass="shadow-cyan-500/20"
              />
            ))}
          </div>
        </Card>

        {/* Cloud Breakdown */}
        <Card>
          <SectionTitle title="Cloud" icon={Cloud} color="text-amber-400" />
          <div className="flex flex-col gap-1">
            {data.cloudTopics.map((item, idx) => (
              <ProgressBar 
                key={idx} 
                label={item.label} 
                percent={item.percent} 
                colorClass="bg-amber-500" 
                textClass="text-amber-300"
                shadowClass="shadow-amber-500/20"
              />
            ))}
          </div>
        </Card>

      </div>

      {/* Footer com informações de atualização */}
      <footer className="mt-8 text-center text-slate-500 text-sm">
        <div className="bg-[#1a1f2e] border border-[#2a3142] rounded-lg p-4">
          <p className="flex items-center justify-center gap-2">
            <Activity size={16} />
            Última atualização: {lastRefresh.toLocaleString('pt-BR')}
            {data.lastUpdated && (
              <span className="text-slate-400">
                (Dados: {new Date(data.lastUpdated).toLocaleString('pt-BR')})
              </span>
            )}
          </p>
          <p className="text-xs mt-2 text-slate-600">
            Os dados são sincronizados com o ClickUp a cada 5 minutos automaticamente
          </p>
        </div>
      </footer>

    </div>
  );
}