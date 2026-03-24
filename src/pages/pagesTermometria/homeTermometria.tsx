import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useConfigTermometria } from '@/hooks/hooksTermometria/useConfigTermometria';
import type { DadosConfigTermometria } from '@/hooks/hooksTermometria/useConfigTermometria';
import { useOnlineTermometria } from '@/hooks/hooksTermometria/useOnlineTermometria';
import { setTermometriaContext } from '@/utils/apiConfig';
import { TermometriaSiloVisualization } from '@/components/TermometriaSiloVisualization';

/** Card da home: mesma visualização do monitor (silo + sensores reais), em tamanho reduzido */
function TermometriaHomeSiloCard({
  itemConfig,
  onNavigate,
}: {
  itemConfig: DadosConfigTermometria;
  onNavigate: () => void;
}) {
  const { dadosOnlineTermometria, loading, carregarOnlineTermometria } = useOnlineTermometria();

  useEffect(() => {
    carregarOnlineTermometria({
      empresa: itemConfig.empresa,
      unidade: itemConfig.unidade,
      silo: itemConfig.silo,
    });
  }, [itemConfig.empresa, itemConfig.unidade, itemConfig.silo, carregarOnlineTermometria]);

  const capacidade = itemConfig.capacidade;
  const numsensores = itemConfig.numsensores;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onNavigate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate();
        }
      }}
      className="cursor-pointer transition-transform hover:scale-[1.01] bg-white rounded-lg border shadow-sm overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-industrial-primary/40"
    >
      <div className="grid grid-cols-[6fr_4fr] gap-3 p-3 items-center min-h-[148px]">
        {/* Coluna: informações */}
        <div className="flex flex-col justify-center gap-3 min-w-0 pr-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-bold text-industrial-primary leading-tight line-clamp-2">
              {itemConfig.silo}
            </span>
            {loading && (
              <span className="text-[10px] text-muted-foreground shrink-0">Atualizando...</span>
            )}
          </div>
          <div className="space-y-2 text-xs text-industrial-gray">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Capacidade</div>
              <div className="font-semibold text-foreground">
                {capacidade != null && capacidade !== '' ? capacidade : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Sensores</div>
              <div className="font-semibold text-foreground">
                {typeof numsensores === 'number' ? String(numsensores) : 'N/A'}
              </div>
            </div>
          </div>
        </div>
        {/* Coluna: silo (imagem + sensores, sem fundo) */}
        <div className="relative min-h-[118px] flex items-center justify-center -mr-1">
          <TermometriaSiloVisualization
            variant="compact"
            transparentBackground
            config={itemConfig}
            leituras={dadosOnlineTermometria}
            nome={itemConfig.silo}
            className="w-full max-w-full mx-auto"
          />
        </div>
      </div>
    </div>
  );
}

const HomeTermometria = () => {
  const navigate = useNavigate();
  const { dadosConfigTermometria, loading, error, carregarConfigTermometria } = useConfigTermometria();

  useEffect(() => {
    carregarConfigTermometria();
  }, [carregarConfigTermometria]);

  const getCampo = (item: (typeof dadosConfigTermometria)[number], key: string): unknown => {
    const it = item as unknown as Record<string, unknown>;
    const v = it[key];
    if (v !== undefined && v !== null) return v;
    const c = it.config as Record<string, unknown> | undefined;
    return c && typeof c === 'object' ? c[key] : undefined;
  };

  const silosPorUnidade = useMemo(() => {
    const agrupados: Record<string, (typeof dadosConfigTermometria)[number][]> = {};
    dadosConfigTermometria.forEach((item) => {
      const unidade = String(getCampo(item, 'unidade') ?? '');
      if (!agrupados[unidade]) agrupados[unidade] = [];
      agrupados[unidade].push(item);
    });
    return agrupados;
  }, [dadosConfigTermometria]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-industrial-gray">Carregando dados...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-industrial-error">Erro: {error}</p>
              </div>
            ) : Object.keys(silosPorUnidade).length > 0 ? (
              Object.entries(silosPorUnidade).map(([unidade, itensConfig]) => (
                <div key={unidade} className="mb-8">
                  <h2 className="text-2xl font-bold text-industrial-primary mb-6">
                    Termometria - {unidade}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {itensConfig.map((itemConfig) => {
                      const silo = String(getCampo(itemConfig, 'silo') ?? 'Silo');
                      return (
                        <TermometriaHomeSiloCard
                          key={`${unidade}-${silo}`}
                          itemConfig={itemConfig as DadosConfigTermometria}
                          onNavigate={() => {
                            const empresa = String(getCampo(itemConfig, 'empresa') ?? '');
                            const unidadeItem = String(getCampo(itemConfig, 'unidade') ?? unidade);
                            setTermometriaContext({ empresa, unidade: unidadeItem, silo });
                            navigate(`/termometria/${encodeURIComponent(silo)}`);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-industrial-gray">Nenhum silo encontrado</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeTermometria;
