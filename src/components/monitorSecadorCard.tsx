import { cn } from "@/lib/utils";
import { MetricBadge, MetricStatus } from "./metricBadge";
import secadorImage from "@/assets/images/secador-com-fundo-HD.png";

export interface DryerMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  status?: MetricStatus;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}

// Interface para campos de configuração
interface ConfigCampo {
  ativo: boolean;
  min: string | null;
  max: string | null;
}

interface ConfigCampoMax {
  ativo: boolean;
  max: string | null;
}

// Interface para configuração do secador
interface SecadorConfig {
  empresa: string;
  unidade: string;
  secador: string;
  capacidadeNominalTPH: string;
  tempEntrada: ConfigCampo;
  tempMeio: ConfigCampo;
  tempSaida: ConfigCampo;
  tempQueimador: ConfigCampo;
  pressaoQueimador: ConfigCampo;
  umidadeEntrada: ConfigCampo;
  umidadeSaida: ConfigCampo;
  tonEntrada: ConfigCampoMax;
  tonSaida: ConfigCampoMax;
}

interface DryerMonitorCardProps {
  secadorId: number;
  nome: string;
  dados: {
    umidade_entrada: number;
    umidade_saida: number;
    temperatura_queimador: number;
    pressao_queimador: number;
    temperatura_entrada: number;
    temperatura_saida: number;
    tonelada_entrada: number;
    tonelada_saida: number;
  };
  status: 'ativo' | 'inativo' | 'manutencao';
  config?: SecadorConfig | null;
  imagemUrl?: string;
  lastUpdate?: string;
  className?: string;
}

// Função auxiliar para converter string para number
const parseConfigValue = (value: string | null): number | null => {
  if (value === null || value === '') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

// Função para determinar o status baseado no valor e configuração
const getMetricStatus = (id: string, value: number, config?: SecadorConfig | null): MetricStatus => {
  // Se não houver configuração, usa valores padrão
  if (!config) {
    switch (id) {
      case 'umidade_entrada':
        if (value > 30) return 'critical';
        if (value > 20) return 'warning';
        return 'normal';
      case 'umidade_saida':
        if (value > 20) return 'critical';
        if (value > 15) return 'warning';
        return 'normal';
      case 'temperatura_queimador':
        if (value > 700) return 'critical';
        if (value > 650) return 'warning';
        return 'normal';
      case 'pressao_queimador':
        if (value < -2) return 'critical';
        if (value < -1.5) return 'warning';
        return 'normal';
      case 'temperatura_entrada':
        if (value > 110) return 'critical';
        if (value > 100) return 'warning';
        return 'normal';
      case 'temperatura_saida':
        if (value > 80) return 'critical';
        if (value > 70) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  }

  // Usa a configuração do hook
  let campo: ConfigCampo | ConfigCampoMax | undefined;
  
  switch (id) {
    case 'umidade_entrada':
      campo = config.umidadeEntrada;
      break;
    case 'umidade_saida':
      campo = config.umidadeSaida;
      break;
    case 'temperatura_queimador':
      campo = config.tempQueimador;
      break;
    case 'pressao_queimador':
      campo = config.pressaoQueimador;
      break;
    case 'temperatura_entrada':
      campo = config.tempEntrada;
      break;
    case 'temperatura_saida':
      campo = config.tempSaida;
      break;
    default:
      return 'normal';
  }

  if (!campo || !campo.ativo) {
    return 'normal';
  }

  // Para campos com min e max
  if ('min' in campo) {
    const min = parseConfigValue(campo.min);
    const max = parseConfigValue(campo.max);

    // Verifica se está fora dos limites (critical)
    if (min !== null && value < min) {
      return 'critical';
    }
    if (max !== null && value > max) {
      return 'critical';
    }

    // Zona de warning: próximo aos limites (10% da faixa de valores)
    if (min !== null && max !== null) {
      const faixa = max - min;
      const margemWarning = faixa * 0.1;
      
      // Warning se está próximo do mínimo
      if (value < min + margemWarning) {
        return 'warning';
      }
      // Warning se está próximo do máximo
      if (value > max - margemWarning) {
        return 'warning';
      }
    } else if (min !== null) {
      // Se só tem mínimo, warning se está 10% acima do mínimo
      const margemWarning = Math.abs(min) * 0.1;
      if (value < min + margemWarning) {
        return 'warning';
      }
    } else if (max !== null) {
      // Se só tem máximo, warning se está 10% abaixo do máximo
      const margemWarning = Math.abs(max) * 0.1;
      if (value > max - margemWarning) {
        return 'warning';
      }
    }
  }

  return 'normal';
};

// Função para converter dados do secador em métricas
const convertDadosToMetrics = (
  dados: DryerMonitorCardProps['dados'],
  config?: SecadorConfig | null
): DryerMetric[] => {
  return [
    {
      id: "umidade_entrada",
      label: "Umid. Entrada",
      value: dados.umidade_entrada,
      unit: "%",
      status: getMetricStatus('umidade_entrada', dados.umidade_entrada, config),
      position: { top: "2%", left: "47%" },
    },
    {
      id: "umidade_saida",
      label: "Umid. Saída",
      value: dados.umidade_saida,
      unit: "%",
      status: getMetricStatus('umidade_saida', dados.umidade_saida, config),
      position: { bottom: "2%", left: "47%" },
    },
    {
      id: "temperatura_entrada",
      label: "Temp. Entrada",
      value: dados.temperatura_entrada,
      unit: "°C",
      status: getMetricStatus('temperatura_entrada', dados.temperatura_entrada, config),
      position: { top: "52%", right: "35%" },
    },
    {
      id: "temperatura_saida",
      label: "Temp. Saída",
      value: dados.temperatura_saida,
      unit: "°C",
      status: getMetricStatus('temperatura_saida', dados.temperatura_saida, config),
      position: { top: "15%", left: "37%" },
    },
    {
      id: "temperatura_queimador",
      label: "Temp. Queimador",
      value: dados.temperatura_queimador,
      unit: "°C",
      status: getMetricStatus('temperatura_queimador', dados.temperatura_queimador, config),
      position: { top: "68%", right: "17%" },
    },
    {
      id: "pressao_queimador",
      label: "Press. Queimador",
      value: dados.pressao_queimador,
      unit: "bar",
      status: getMetricStatus('pressao_queimador', dados.pressao_queimador, config),
      position: { top: "55%", right: "20%" },
    },
    {
      id: "tonelada_entrada",
      label: "Tonelada Entrada",
      value: dados.tonelada_entrada,
      unit: "ton/h",
      status: 'normal',
      position: { top: "2%", right: "35%" },
    },
    {
      id: "tonelada_saida",
      label: "Tonelada Saída",
      value: dados.tonelada_saida,
      unit: "ton/h",
      status: 'normal',
      position: { bottom: "2%", right: "37%" },
    },
  ];
};

export function DryerMonitorCard({
  secadorId,
  nome,
  dados,
  status,
  config,
  imagemUrl,
  lastUpdate,
  className,
}: DryerMonitorCardProps) {
  const metrics = convertDadosToMetrics(dados, config);
  
  // Determina a cor do status baseado no status do secador
  const getStatusColor = () => {
    switch (status) {
      case 'ativo':
        return 'bg-status-normal';
      case 'manutencao':
        return 'bg-status-warning';
      case 'inativo':
        return 'bg-gray-400';
      default:
        return 'bg-status-normal';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'manutencao':
        return 'Manutenção';
      case 'inativo':
        return 'Inativo';
      default:
        return 'Desconhecido';
    }
  };

  const imageSrc = imagemUrl || secadorImage;

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-border shadow-card overflow-hidden",
        "w-full",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 sm:p-6 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Monitor de Secagem</h2>
          <p className="text-sm text-muted-foreground">{nome}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            {status === 'ativo' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-normal opacity-75"></span>
            )}
            <span className={cn("relative inline-flex rounded-full h-3 w-3", getStatusColor())}></span>
          </span>
          <span className="text-sm text-muted-foreground">
            {lastUpdate || getStatusLabel()}
          </span>
        </div>
      </div>

      {/* Desktop: Image with positioned metrics */}
      <div className="hidden lg:block relative">
        <div className="relative w-full aspect-[21/9] overflow-hidden bg-gradient-to-br from-sky-100 via-sky-200 to-green-100">
          <img
            src={imageSrc}
            alt={`Secador ${nome}`}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          
          {/* Positioned Metric Badges */}
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="absolute animate-float"
              style={{
                top: metric.position.top,
                bottom: metric.position.bottom,
                left: metric.position.left,
                right: metric.position.right,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              <MetricBadge
                label={metric.label}
                value={metric.value}
                unit={metric.unit}
                status={metric.status}
                size="md"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet: Image with grid below */}
      <div className="hidden md:block lg:hidden">
        <div className="relative w-full aspect-[21/10] overflow-hidden bg-gradient-to-br from-sky-100 via-sky-200 to-green-100">
          <img
            src={imageSrc}
            alt={`Secador ${nome}`}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="grid grid-cols-4 gap-3 p-4 bg-muted/20">
          {metrics.map((metric) => (
            <MetricBadge
              key={metric.id}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
              status={metric.status}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Mobile: Compact layout */}
      <div className="block md:hidden">
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-sky-100 via-sky-200 to-green-100">
          <img
            src={imageSrc}
            alt={`Secador ${nome}`}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20">
          {metrics.map((metric) => (
            <MetricBadge
              key={metric.id}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
              status={metric.status}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Footer with summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 border-t border-border bg-muted/20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-normal"></span>
            <span className="text-sm text-muted-foreground">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-warning"></span>
            <span className="text-sm text-muted-foreground">Atenção</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-critical"></span>
            <span className="text-sm text-muted-foreground">Crítico</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Capacidade: <span className="font-semibold text-foreground">{config?.capacidadeNominalTPH || '0'} ton/h</span>
        </p>
      </div>
    </div>
  );
}
