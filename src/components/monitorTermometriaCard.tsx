import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { DadosConfigTermometria } from '@/hooks/hooksTermometria/useConfigTermometria';
import type { LeituraTermometria } from '@/hooks/hooksTermometria/useOnlineTermometria';
import { TermometriaSiloVisualization } from '@/components/TermometriaSiloVisualization';

export interface MonitorTermometriaCardProps {
  nome: string;
  config: DadosConfigTermometria | null;
  leituras: LeituraTermometria[];
  imagemUrl?: string;
  lastUpdate?: string;
  className?: string;
}

export function MonitorTermometriaCard({
  nome,
  config,
  leituras,
  imagemUrl,
  lastUpdate,
  className,
}: MonitorTermometriaCardProps) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 sm:p-6 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Monitor de Termometria</h2>
          <p className="text-sm text-muted-foreground">{nome}</p>
        </div>
        {headerSubtitle && (
          <span className="text-sm text-muted-foreground">{headerSubtitle}</span>
        )}
      </div>

      <TermometriaSiloVisualization
        variant="full"
        config={config}
        leituras={leituras}
        imagemUrl={imagemUrl}
        nome={nome}
      />
    </div>
  );
}
