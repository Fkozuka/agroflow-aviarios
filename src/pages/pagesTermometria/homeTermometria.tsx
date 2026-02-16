import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SecadorCard from '@/components/secadorCard';
import { useConfigTermometria } from '@/hooks/hooksTermometria/useConfigTermometria';
import { Thermometer } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {itensConfig.map((itemConfig) => {
                      const silo = getCampo(itemConfig, 'silo') ?? 'Silo';
                      const capacidade = getCampo(itemConfig, 'capacidade');
                      const numsensores = getCampo(itemConfig, 'numsensores');
                      return (
                        <div
                          key={`${unidade}-${silo}`}
                          onClick={() => navigate(`/termometria/${encodeURIComponent(String(silo))}`)}
                          className="cursor-pointer transition-transform hover:scale-105"
                        >
                          <SecadorCard
                            title={String(silo)}
                            value1={capacidade != null ? String(capacidade) : 'N/A'}
                            value2={numsensores != null ? String(numsensores) : 'N/A'}
                            description1="Capacidade"
                            description2="Sensores"
                            unit1=""
                            unit2=""
                            status="0"
                            icon={<Thermometer size={40} />}
                          />
                        </div>
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
