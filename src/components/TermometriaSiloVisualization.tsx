import { useId, useMemo } from 'react';
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

/** Painel completo (monitor) */
const SVG_LAYOUT_FULL = {
  width: 400,
  height: 300,
  margin: 20,
  siloYOffset: -50,
  espacamentoVertical: 1.4,
} as const;

/**
 * Miniatura (compact): escala de espaçamento vs. full.
 * 0.4 = 50% do passo base, com redução extra de 20% (0.5 × 0.8).
 */
const COMPACT_SPACING_SCALE = 0.4;

/** Miniatura: espaço extra entre sensores no mesmo pêndulo (vertical); ~+21% vs. base (1.1 × 1.1) */
const COMPACT_INTER_SENSOR_GAP_MULT = 1.21;

/** Miniatura: desloca os sensores para baixo (fração da altura útil da linha tracejada) */
const COMPACT_SENSORS_SHIFT_DOWN = 0.2;

/** Cards da home — proporcional ao silo na coluna ~40% (sensores legíveis) */
const SVG_LAYOUT_COMPACT = {
  width: 380,
  height: 260,
  margin: 18,
  siloYOffset: -42,
  espacamentoVertical: 1.38,
} as const;

export interface TermometriaSiloVisualizationProps {
  config: DadosConfigTermometria | null;
  leituras: LeituraTermometria[];
  imagemUrl?: string;
  nome?: string;
  /** `full` = painel; `compact` = preview nos cards da home */
  variant?: 'full' | 'compact';
  /** Sem gradiente/borda atrás da imagem (cards em duas colunas na home) */
  transparentBackground?: boolean;
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

function groupByPendulo(leituras: LeituraTermometria[]): Map<number, LeituraTermometria[]> {
  const map = new Map<number, LeituraTermometria[]>();
  leituras.forEach((l) => {
    const list = map.get(l.pendulo) ?? [];
    list.push(l);
    map.set(l.pendulo, list);
  });
  return map;
}

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

/**
 * Silo com imagem de fundo + SVG de pêndulos e sensores com temperaturas reais
 * (mesmo comportamento do monitor; `compact` reduz escala para cards da home).
 */
export function TermometriaSiloVisualization({
  config,
  leituras,
  imagemUrl,
  nome = '',
  variant = 'full',
  transparentBackground = false,
  className,
}: TermometriaSiloVisualizationProps) {
  const gradId = useId().replace(/:/g, '');
  const compact = variant === 'compact';
  const noBg = compact && transparentBackground;

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

  const pendulosIds = useMemo(() => {
    const idsConfig = Array.from(sensoresPorPendulo.keys()).sort((a, b) => a - b);
    const idsLeituras = Array.from(leiturasPorPendulo.keys()).sort((a, b) => a - b);
    return Array.from(new Set([...idsConfig, ...idsLeituras])).sort((a, b) => a - b);
  }, [sensoresPorPendulo, leiturasPorPendulo]);

  const svgGeometry = useMemo(() => {
    const layoutConst = compact ? SVG_LAYOUT_COMPACT : SVG_LAYOUT_FULL;
    const { width, height, margin, siloYOffset, espacamentoVertical } = layoutConst;
    const siloX = margin;
    const siloY = margin + siloYOffset;
    const siloW = width - margin * 1.5;
    const siloH = height - margin * 1.5;
    const numPendulos = Math.max(1, pendulosIds.length);
    const penduloSpacing = siloW / (numPendulos + 0.6);
    const lineTop = siloY + (compact ? 18 : 20);
    const lineBottom = siloY + siloH - (compact ? 18 : 20);
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
  }, [pendulosIds.length, compact]);

  /** Miniatura (compact): badges de cor 50% menores; painel (full): tamanho normal */
  const rectW = compact ? 10 : 20;
  const rectH = compact ? 6 : 12;
  const badgeRx = compact ? 1 : 2;
  const fontPx = 8;

  return (
    <div
      className={cn(
        'relative w-full',
        compact &&
          !noBg &&
          'rounded-md overflow-hidden border border-border/60 bg-gradient-to-br from-slate-100 to-slate-200 max-h-[168px]',
        compact && noBg && 'overflow-visible',
        !compact && 'w-full',
        className
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden',
          !noBg && 'bg-gradient-to-br from-slate-100 to-slate-200',
          noBg && 'bg-transparent',
          compact && !noBg && 'h-[120px]',
          noBg && 'min-h-[118px] max-h-[176px] flex items-center justify-center'
        )}
      >
        <div
          className={cn(
            'origin-center',
            compact ? 'scale-[1.12]' : 'scale-[1.5]',
            noBg && 'w-full flex items-center justify-center'
          )}
        >
          <img
            src={imageBg}
            alt={nome ? `Silo ${nome}` : 'Silo'}
            className={cn(
              'block w-full h-auto',
              noBg ? 'opacity-100 object-contain max-h-[168px]' : 'opacity-80'
            )}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
        <div
          className={cn(
            compact ? 'w-[76%] h-[76%]' : 'w-1/2 h-1/2',
            'min-h-0 min-w-0'
          )}
        >
          <svg
            viewBox={svgGeometry.viewBox}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(203 213 225)" />
                <stop offset="100%" stopColor="rgb(148 163 184)" />
              </linearGradient>
            </defs>

            <rect
              x={svgGeometry.siloX}
              y={svgGeometry.siloY}
              width={svgGeometry.siloW}
              height={svgGeometry.siloH}
              rx={12}
              ry={12}
              fill={imageBg ? 'transparent' : `url(#${gradId})`}
              className="text-border"
            />

            {pendulosIds.map((penduloId, index) => {
              /** Compact: espaço horizontal entre pêndulos reduzido (COMPACT_SPACING_SCALE), grupo centralizado */
              const nPendulos = pendulosIds.length;
              const centerX = svgGeometry.siloX + svgGeometry.siloW / 2;
              const spPendulo = svgGeometry.penduloSpacing * (compact ? COMPACT_SPACING_SCALE : 1);
              const cx =
                compact && nPendulos > 0
                  ? centerX -
                    (spPendulo * Math.max(0, nPendulos - 1)) / 2 +
                    spPendulo * index
                  : svgGeometry.siloX + svgGeometry.penduloSpacing * (index + 1);
              const sensores = [...(leiturasPorPendulo.get(penduloId) ?? [])].sort(
                (a, b) => a.sensor - b.sensor
              );
              const nSensores = Math.max(1, sensores.length);
              const pad = compact ? 36 : 40;
              /** Espaçamento base entre níveis (full = original; compact = escala COMPACT_SPACING_SCALE + centralizado) */
              const stepBase =
                ((svgGeometry.siloH - pad) / (nSensores + 1)) *
                svgGeometry.espacamentoVertical;
              const step = compact
                ? stepBase * COMPACT_SPACING_SCALE * COMPACT_INTER_SENSOR_GAP_MULT
                : stepBase;
              const lineSpan = svgGeometry.lineBottom - svgGeometry.lineTop;
              const startYCompact =
                compact && sensores.length > 0
                  ? svgGeometry.lineTop +
                    (lineSpan - step * Math.max(0, sensores.length - 1)) / 2
                  : 0;
              const shiftDownY = compact ? lineSpan * COMPACT_SENSORS_SHIFT_DOWN : 0;

              return (
                <g key={penduloId}>
                  <line
                    x1={cx}
                    y1={svgGeometry.lineTop}
                    x2={cx}
                    y2={svgGeometry.lineBottom}
                    stroke="currentColor"
                    strokeWidth={compact ? 0.55 : 0.5}
                    strokeDasharray="4 2"
                    className="text-industrial-primary/30"
                  />
                  {sensores.length > 0 ? (
                    sensores.map((leitura, si) => {
                      const pyUncapped = compact
                        ? startYCompact + step * si + shiftDownY
                        : svgGeometry.lineTop + step * (si + 1);
                      const py = compact
                        ? Math.min(
                            pyUncapped,
                            svgGeometry.lineBottom - rectH / 2 - 0.5
                          )
                        : pyUncapped;
                      const status = getTempStatus(leitura.temperatura);
                      const fill = TEMP_STATUS_COLOR[status];
                      const tempLabel = leitura.temperatura.split('.')[0];
                      return (
                        <g key={`${penduloId}-${leitura.sensor}`}>
                          <rect
                            x={cx - rectW / 2}
                            y={py - rectH / 2}
                            width={rectW}
                            height={rectH}
                            rx={badgeRx}
                            fill={fill}
                            className="drop-shadow-sm"
                          />
                          {!compact && (
                            <text
                              x={cx}
                              y={py + 1}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-white font-bold"
                              style={{ fontSize: `${fontPx}px` }}
                            >
                              {tempLabel}
                            </text>
                          )}
                        </g>
                      );
                    })
                  ) : (
                    <rect
                      x={cx - rectW / 2}
                      y={
                        Math.min(
                          (svgGeometry.lineTop + svgGeometry.lineBottom) / 2 -
                            rectH / 2 +
                            shiftDownY,
                          svgGeometry.lineBottom - rectH / 2 - 0.5
                        )
                      }
                      width={rectW}
                      height={rectH}
                      rx={badgeRx}
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
  );
}
