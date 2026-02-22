import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { DadosConfigTermometria } from '@/hooks/hooksTermometria/useConfigTermometria';
import type { LeituraTermometria } from '@/hooks/hooksTermometria/useOnlineTermometria';
import siloSozinho from '@/assets/images/silos/silo-sozinho.png';
import silo1Aerador from '@/assets/images/silos/silo-1-aerador.png';
import silo2Aerador from '@/assets/images/silos/silo-2-aerador.png';
import silo3Aerador from '@/assets/images/silos/silo-3-aerador.png';
import silo4Aerador from '@/assets/images/silos/silo-4-aerador.png';

/** Imagem do silo por tipo (string vinda da config) */
const SILO_IMAGES_BY_TIPO: Record<string, string> = {
  metalicoPadrao: siloSozinho,
  metalicoPadrao1: silo1Aerador,
  metalicoPadrao2: silo2Aerador,
  metalicoPadrao3: silo3Aerador,
  metalicoPadrao4: silo4Aerador,
};

/** Fallback: imagem por número de aeradores quando tipo não está no mapa */
const SILO_IMAGES_BY_AERADORES: Record<number, string> = {
  0: siloSozinho,
  1: silo1Aerador,
  2: silo2Aerador,
  3: silo3Aerador,
  4: silo4Aerador,
};

/** Dimensões do SVG do silo */
const SVG_LAYOUT = {
  width: 400,
  height: 300,
  margin: 20,
  espacamentoVertical: 1.4,
} as const;

export interface MonitorTermometriaCardProps {
  nome: string;
  config: DadosConfigTermometria | null;
  leituras: LeituraTermometria[];
  imagemUrl?: string;
  lastUpdate?: string;
  className?: string;
}

/** Quantidade de sensores por pêndulo (pendulo1..pendulo20 na config) */
function getSensoresPorPendulo(config: DadosConfigTermometria | null): Map<number, number> {
  const map = new Map<number, number>();
  if (!config?.pendulos) return map;
  const p = config.pendulos as unknown as Record<string, number | null>;
  for (let i = 1; i <= 20; i++) {
    const v = p[`pendulo${i}`];
    if (v != null && v > 0) map.set(i, v);
  }
  return map;
}

/** Agrupa leituras por pêndulo */
function groupByPendulo(leituras: LeituraTermometria[]): Map<number, LeituraTermometria[]> {
  const map = new Map<number, LeituraTermometria[]>();
  leituras.forEach((l) => {
    const list = map.get(l.pendulo) ?? [];
    list.push(l);
    map.set(l.pendulo, list);
  });
  return map;
}

/** Cor do badge pela temperatura (normal / warning / critical) */
function getTempStatus(temp: string): 'normal' | 'warning' | 'critical' {
  const v = parseFloat(temp);
  if (Number.isNaN(v)) return 'normal';
  if (v >= 40) return 'critical';
  if (v >= 35) return 'warning';
  return 'normal';
}

const TEMP_STATUS_COLOR: Record<'normal' | 'warning' | 'critical', string> = {
  normal: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
};

export function MonitorTermometriaCard({
  nome,
  config,
  leituras,
  imagemUrl,
  lastUpdate,
  className,
}: MonitorTermometriaCardProps) {
  // Imagem de fundo: prop > config.tipo > fallback por numaeradores
  const imageBg = useMemo(() => {
    if (imagemUrl) return imagemUrl;
    const tipo = config?.tipo;
    if (tipo && SILO_IMAGES_BY_TIPO[tipo]) return SILO_IMAGES_BY_TIPO[tipo];
    const n = config?.numaeradores ?? 0;
    const key = n <= 0 ? 0 : n >= 4 ? 4 : n;
    return SILO_IMAGES_BY_AERADORES[key] ?? siloSozinho;
  }, [imagemUrl, config?.tipo, config?.numaeradores]);

  const sensoresPorPendulo = useMemo(() => getSensoresPorPendulo(config), [config]);
  const leiturasPorPendulo = useMemo(() => groupByPendulo(leituras), [leituras]);

  // Pêndulos a exibir: união da config e das leituras, ordenados
  const pendulosIds = useMemo(() => {
    const idsConfig = Array.from(sensoresPorPendulo.keys()).sort((a, b) => a - b);
    const idsLeituras = Array.from(leiturasPorPendulo.keys()).sort((a, b) => a - b);
    return Array.from(new Set([...idsConfig, ...idsLeituras])).sort((a, b) => a - b);
  }, [sensoresPorPendulo, leiturasPorPendulo]);

  // Geometria do SVG: silo e posição dos pêndulos
  const svgGeometry = useMemo(() => {
    const { width, height, margin, espacamentoVertical } = SVG_LAYOUT;
    const siloX = margin;
    const siloY = margin - 50;
    const siloW = width - margin * 1.5;
    const siloH = height - margin * 1.5;
    const numPendulos = Math.max(1, pendulosIds.length);
    const penduloSpacing = siloW / (numPendulos + 0.6);
    const lineTop = siloY + 20;
    const lineBottom = siloY + siloH - 20;
    return {
      viewBox: `0 0 ${width} ${height}`,
      siloX,
      siloY,
      siloW,
      siloH,
      penduloSpacing,
      lineTop,
      lineBottom,
      espacamentoVertical,
    };
  }, [pendulosIds.length]);

  // Texto do header: capacidade e última atualização
  const headerSubtitle = useMemo(() => {
    const partes: string[] = [];
    if (config?.capacidade) partes.push(`Capacidade: ${config.capacidade}`);
    if (lastUpdate) partes.push(new Date(lastUpdate).toLocaleString('pt-BR'));
    return partes.join(' • ');
  }, [config?.capacidade, lastUpdate]);

  return (
    <div
      className={cn(
        'bg-card rounded-2xl border border-border shadow-card overflow-hidden w-full',
        className
      )}
    >
      {/* Header: título, nome do silo, capacidade e data */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 sm:p-6 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Monitor de Termometria</h2>
          <p className="text-sm text-muted-foreground">{nome}</p>
        </div>
        {headerSubtitle && (
          <span className="text-sm text-muted-foreground">{headerSubtitle}</span>
        )}
      </div>

      {/* Área do silo: imagem de fundo + SVG sobreposto */}
      <div className="relative w-full">
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="origin-center scale-[1.5]">
            <img
              src={imageBg}
              alt={`Silo ${nome}`}
              className="block w-full h-auto opacity-80"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
          <div className="w-1/2 h-1/2 min-h-0 min-w-0">
            <svg
              viewBox={svgGeometry.viewBox}
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="siloGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(203 213 225)" />
                  <stop offset="100%" stopColor="rgb(148 163 184)" />
                </linearGradient>
              </defs>

              {/* Retângulo do silo */}
              <rect
                x={svgGeometry.siloX}
                y={svgGeometry.siloY}
                width={svgGeometry.siloW}
                height={svgGeometry.siloH}
                rx={12}
                ry={12}
                fill={imageBg ? 'transparent' : 'url(#siloGrad)'}
                className="text-border"
              />

              {/* Pêndulos e sensores */}
              {pendulosIds.map((penduloId, index) => {
                const cx = svgGeometry.siloX + svgGeometry.penduloSpacing * (index + 1);
                const sensores = [...(leiturasPorPendulo.get(penduloId) ?? [])].sort(
                  (a, b) => a.sensor - b.sensor
                );
                const nSensores = Math.max(1, sensores.length);
                const step =
                  ((svgGeometry.siloH - 40) / (nSensores + 1)) * svgGeometry.espacamentoVertical;

                return (
                  <g key={penduloId}>
                    <line
                      x1={cx}
                      y1={svgGeometry.lineTop}
                      x2={cx}
                      y2={svgGeometry.lineBottom}
                      stroke="currentColor"
                      strokeWidth={0.5}
                      strokeDasharray="4 2"
                      className="text-industrial-primary/30"
                    />
                    {sensores.length > 0 ? (
                      sensores.map((leitura, si) => {
                        const py = svgGeometry.lineTop + step * (si + 1);
                        const status = getTempStatus(leitura.temperatura);
                        const fill = TEMP_STATUS_COLOR[status];
                        const rectW = 20;
                        const rectH = 12;
                        const tempLabel = leitura.temperatura.split('.')[0];
                        return (
                          <g key={`${penduloId}-${leitura.sensor}`}>
                            <rect
                              x={cx - rectW / 2}
                              y={py - rectH / 2}
                              width={rectW}
                              height={rectH}
                              rx={2}
                              fill={fill}
                              className="drop-shadow-sm"
                            />
                            <text
                              x={cx}
                              y={py + 1}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-white text-[10px] font-bold"
                              style={{ fontSize: '8px' }}
                            >
                              {tempLabel}
                            </text>
                          </g>
                        );
                      })
                    ) : (
                      <rect
                        x={cx - 10}
                        y={(svgGeometry.lineTop + svgGeometry.lineBottom) / 2 - 6}
                        width={20}
                        height={12}
                        rx={2}
                        fill="currentColor"
                        className="text-muted-foreground/40"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
