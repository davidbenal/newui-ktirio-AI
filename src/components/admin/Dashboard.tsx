import { useState } from 'react';
import { Users, TrendingUp, Image, DollarSign, Activity, Zap, Calendar, Filter, Download, Info } from 'lucide-react';
import { UserRole, canViewFinancials } from '../../types/roles';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';

interface AdminDashboardProps {
  userRole: UserRole;
}

type DateRange = 'today' | '7days' | '30days' | '90days' | 'year' | 'all';
type PlanFilter = 'all' | 'free' | 'professional' | 'business' | 'trial';

// Mock data - Em produção, virá do Firestore
const mockMetrics = {
  totalUsers: 1247,
  activeUsers: 892,
  newUsersLast7Days: 47,
  totalCreditsUsed: 125430,
  totalImagesGenerated: 8562,
  totalRevenue: 28450.00,
  mrr: 12300.00,
  conversionRate: 18.5,
  planDistribution: {
    free: 724,
    professional: 412,
    business: 89,
    trial: 22,
  }
};

const newUsersData = [
  { date: '01/04', users: 12 },
  { date: '02/04', users: 18 },
  { date: '03/04', users: 15 },
  { date: '04/04', users: 22 },
  { date: '05/04', users: 19 },
  { date: '06/04', users: 25 },
  { date: '07/04', users: 28 },
];

const imagesGeneratedData = [
  { day: 'Seg', images: 1200 },
  { day: 'Ter', images: 1450 },
  { day: 'Qua', images: 1150 },
  { day: 'Qui', images: 1680 },
  { day: 'Sex', images: 1920 },
  { day: 'Sáb', images: 980 },
  { day: 'Dom', images: 720 },
];

const planDistributionData = [
  { name: 'Free', value: 724, color: '#94A3B8' },
  { name: 'Professional', value: 412, color: '#3B82F6' },
  { name: 'Business', value: 89, color: '#8B5CF6' },
  { name: 'Trial', value: 22, color: '#F59E0B' },
];

const recentActivity = [
  { id: 1, action: 'Novo cadastro', user: 'joão.silva@exemplo.com', time: 'Há 5 min', type: 'signup' },
  { id: 2, action: 'Upgrade de plano', user: 'maria.santos@exemplo.com', time: 'Há 12 min', type: 'upgrade' },
  { id: 3, action: 'Uso de cupom', user: 'pedro.costa@exemplo.com', time: 'Há 18 min', type: 'coupon' },
  { id: 4, action: 'Imagem gerada', user: 'ana.oliveira@exemplo.com', time: 'Há 22 min', type: 'image' },
  { id: 5, action: 'Novo cadastro', user: 'carlos.lima@exemplo.com', time: 'Há 35 min', type: 'signup' },
  { id: 6, action: 'Cancelamento', user: 'lucia.ferreira@exemplo.com', time: 'Há 41 min', type: 'cancel' },
];

export default function AdminDashboard({ userRole }: AdminDashboardProps) {
  const showFinancials = canViewFinancials(userRole);
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulate data loading when filters change
  const handleFilterChange = (callback: () => void) => {
    setIsUpdating(true);
    callback();
    // Simulate API call delay
    setTimeout(() => setIsUpdating(false), 300);
  };

  // Filter data based on selections
  const getFilteredMetrics = () => {
    // In production, this would filter actual data from API
    // For now, return mock data with some adjustments
    const multiplier = dateRange === 'today' ? 0.05 : 
                       dateRange === '7days' ? 0.2 : 
                       dateRange === '30days' ? 1 : 
                       dateRange === '90days' ? 2.5 : 
                       dateRange === 'year' ? 10 : 15;

    return {
      ...mockMetrics,
      totalCreditsUsed: Math.floor(mockMetrics.totalCreditsUsed * multiplier),
      totalImagesGenerated: Math.floor(mockMetrics.totalImagesGenerated * multiplier),
      newUsersLast7Days: Math.floor(mockMetrics.newUsersLast7Days * (multiplier / 2)),
    };
  };

  const getFilteredChartData = () => {
    // Generate different data based on date range
    const baseMultiplier = dateRange === 'today' ? 0.3 : 
                          dateRange === '7days' ? 0.8 : 
                          dateRange === '30days' ? 1 : 
                          dateRange === '90days' ? 1.5 : 
                          dateRange === 'year' ? 3 : 5;

    return {
      newUsers: newUsersData.map(item => ({
        ...item,
        users: Math.floor(item.users * baseMultiplier)
      })),
      images: imagesGeneratedData.map(item => ({
        ...item,
        images: Math.floor(item.images * baseMultiplier)
      }))
    };
  };

  const filteredMetrics = getFilteredMetrics();
  const filteredCharts = getFilteredChartData();

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'today': return 'Hoje';
      case '7days': return 'Últimos 7 dias';
      case '30days': return 'Últimos 30 dias';
      case '90days': return 'Últimos 90 dias';
      case 'year': return 'Último ano';
      case 'all': return 'Todo o período';
      default: return 'Últimos 30 dias';
    }
  };

  const getFilteredPlanData = () => {
    if (planFilter === 'all') return planDistributionData;
    
    return planDistributionData.map(plan => ({
      ...plan,
      value: plan.name.toLowerCase() === planFilter ? plan.value : 0
    })).filter(plan => plan.value > 0);
  };

  const filteredPlanData = getFilteredPlanData();

  const MetricCard = ({ icon: Icon, label, value, subValue, trend, className = '' }: {
    icon: typeof Users;
    label: string;
    value: string | number;
    subValue?: string;
    trend?: 'up' | 'down';
    className?: string;
  }) => (
    <div className={`bg-white rounded-2xl border border-black/[0.06] p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-[#030213] to-[#252525] flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
            <span className="text-xs">
              {trend === 'up' ? '+' : '-'}12%
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-muted-foreground text-sm mb-1">{label}</p>
        <h3 className="text-foreground mb-0">{value}</h3>
        {subValue && (
          <p className="text-muted-foreground text-xs mt-1">{subValue}</p>
        )}
      </div>
    </div>
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup': return '🎉';
      case 'upgrade': return '⬆️';
      case 'coupon': return '🎫';
      case 'image': return '🖼️';
      case 'cancel': return '❌';
      default: return '📝';
    }
  };

  const hasActiveFilters = dateRange !== '30days' || planFilter !== 'all';

  const handleExportData = () => {
    console.log('📊 Exportar dados com filtros:', { dateRange, planFilter });
    // TODO: Implementar exportação CSV/Excel
  };

  return (
    <div className="space-y-6">
      {/* Info Banner - Shown when filters are active */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900">
              Exibindo dados filtrados: <strong>{getDateRangeLabel()}</strong>
              {planFilter !== 'all' && (
                <span> • <strong>{planFilter.charAt(0).toUpperCase() + planFilter.slice(1)}</strong></span>
              )}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Os gráficos e métricas abaixo foram ajustados de acordo com os filtros selecionados
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            className="flex-shrink-0"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-foreground">Filtros</h3>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full bg-[#030213] text-white text-xs">
                Ativos
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateRange('30days');
                setPlanFilter('all');
              }}
              className="text-xs"
            >
              Limpar Filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Período
            </label>
            <Select 
              value={dateRange} 
              onValueChange={(value) => handleFilterChange(() => setDateRange(value as DateRange))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="90days">Últimos 90 dias</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plan Filter */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Filtrar por Plano
            </label>
            <Select 
              value={planFilter} 
              onValueChange={(value) => handleFilterChange(() => setPlanFilter(value as PlanFilter))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filter Display */}
          <div className="flex items-end">
            <div className="bg-[#FAFAFA] rounded-lg p-3 w-full">
              <p className="text-xs text-muted-foreground mb-1">Visualizando</p>
              <p className="text-sm text-foreground">
                {getDateRangeLabel()}
                {planFilter !== 'all' && (
                  <span className="text-muted-foreground"> • {planFilter.charAt(0).toUpperCase() + planFilter.slice(1)}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Filters Presets */}
        <div className="mt-4 pt-4 border-t border-black/[0.06]">
          <p className="text-xs text-muted-foreground mb-3">Filtros Rápidos</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleFilterChange(() => {
                setDateRange('today');
                setPlanFilter('all');
              })}
              className="px-3 py-1.5 rounded-lg text-xs bg-[#FAFAFA] hover:bg-secondary transition-colors"
            >
              📊 Hoje
            </button>
            <button
              onClick={() => handleFilterChange(() => {
                setDateRange('7days');
                setPlanFilter('all');
              })}
              className="px-3 py-1.5 rounded-lg text-xs bg-[#FAFAFA] hover:bg-secondary transition-colors"
            >
              📈 Esta Semana
            </button>
            <button
              onClick={() => handleFilterChange(() => {
                setDateRange('30days');
                setPlanFilter('professional');
              })}
              className="px-3 py-1.5 rounded-lg text-xs bg-[#FAFAFA] hover:bg-secondary transition-colors"
            >
              💼 Professional (30d)
            </button>
            <button
              onClick={() => handleFilterChange(() => {
                setDateRange('30days');
                setPlanFilter('business');
              })}
              className="px-3 py-1.5 rounded-lg text-xs bg-[#FAFAFA] hover:bg-secondary transition-colors"
            >
              🏢 Business (30d)
            </button>
            <button
              onClick={() => handleFilterChange(() => {
                setDateRange('7days');
                setPlanFilter('trial');
              })}
              className="px-3 py-1.5 rounded-lg text-xs bg-[#FAFAFA] hover:bg-secondary transition-colors"
            >
              🎯 Trials Ativos
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${
        isUpdating ? 'opacity-50' : 'opacity-100'
      }`}>
        <MetricCard
          icon={Users}
          label="Total de Usuários"
          value={mockMetrics.totalUsers.toLocaleString()}
          subValue={`${mockMetrics.activeUsers} ativos`}
          trend="up"
        />
        
        <MetricCard
          icon={Activity}
          label={dateRange === 'today' ? 'Novos Usuários (hoje)' : `Novos Usuários (${getDateRangeLabel()})`}
          value={filteredMetrics.newUsersLast7Days}
          trend="up"
        />
        
        <MetricCard
          icon={Image}
          label="Imagens Geradas"
          value={filteredMetrics.totalImagesGenerated.toLocaleString()}
          subValue={getDateRangeLabel()}
        />
        
        <MetricCard
          icon={Zap}
          label="Créditos Usados"
          value={filteredMetrics.totalCreditsUsed.toLocaleString()}
          subValue={getDateRangeLabel()}
        />
        
        {showFinancials && (
          <>
            <MetricCard
              icon={DollarSign}
              label="Revenue Total"
              value={`R$ ${mockMetrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subValue="All-time"
              trend="up"
            />
            
            <MetricCard
              icon={TrendingUp}
              label="MRR"
              value={`R$ ${mockMetrics.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subValue={`${mockMetrics.conversionRate}% conversão`}
              trend="up"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-300 ${
        isUpdating ? 'opacity-50' : 'opacity-100'
      }`}>
        {/* New Users Chart */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Novos Usuários</h3>
            <span className="text-xs text-muted-foreground">{getDateRangeLabel()}</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={filteredCharts.newUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EBEF" />
              <XAxis dataKey="date" stroke="#717182" fontSize={12} />
              <YAxis stroke="#717182" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E9EBEF',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#030213" 
                strokeWidth={2}
                dot={{ fill: '#030213', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Images Generated Chart */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Imagens Geradas</h3>
            <span className="text-xs text-muted-foreground">{getDateRangeLabel()}</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredCharts.images}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EBEF" />
              <XAxis dataKey="day" stroke="#717182" fontSize={12} />
              <YAxis stroke="#717182" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E9EBEF',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="images" fill="#030213" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan Distribution & Recent Activity */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-300 ${
        isUpdating ? 'opacity-50' : 'opacity-100'
      }`}>
        {/* Plan Distribution Pie Chart */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Distribuição de Planos</h3>
            {planFilter !== 'all' && (
              <span className="text-xs bg-[#030213] text-white px-2 py-1 rounded">
                Filtrado: {planFilter.charAt(0).toUpperCase() + planFilter.slice(1)}
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={filteredPlanData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {filteredPlanData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {planDistributionData.map((plan) => (
              <div 
                key={plan.name} 
                className={`flex items-center gap-2 ${
                  planFilter !== 'all' && plan.name.toLowerCase() !== planFilter ? 'opacity-30' : ''
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: plan.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {plan.name}: <span className="text-foreground">{plan.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
          <h3 className="text-foreground mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#FAFAFA] transition-colors"
              >
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.user}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
