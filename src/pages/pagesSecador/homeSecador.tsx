import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SecadorCard from '@/components/secadorCard';
import { useCardSecador } from '@/hooks/hooksSecador/useCardSecador';
import { useConfigSecador } from '@/hooks/hooksSecador/useConfigSecador';
import { getSecadorContext } from '@/utils/apiConfig';
import { Wind } from 'lucide-react';

const HomeSecador = () => {
  const navigate = useNavigate();
  const { dadosCardSecador, loading, error, carregarCardSecador } = useCardSecador();
  const { dadosConfigSecador, loading: loadingConfig, carregarConfigSecador } = useConfigSecador();

  // Ao acionar a página: carrega a config primeiro
  useEffect(() => {
    carregarConfigSecador();
  }, [carregarConfigSecador]);

  // Quando a config estiver pronta, busca os dados dos cards (empresa e unidade do contexto ou do primeiro item)
  useEffect(() => {
    if (loadingConfig) return;
    const context = getSecadorContext();
    const primeiroItem = dadosConfigSecador[0];
    const empresa = context?.empresa ?? primeiroItem?.empresa;
    const unidade = context?.unidade ?? primeiroItem?.unidade;
    if (empresa && unidade) {
      carregarCardSecador({ empresa, unidade });
    } else {
      carregarCardSecador();
    }
  }, [loadingConfig, dadosConfigSecador, carregarCardSecador]);

  // Agrupa os secadores por unidade a partir do config (dadosConfigSecador)
  const secadoresPorUnidade = useMemo(() => {
    const agrupados: Record<string, (typeof dadosConfigSecador)[number][]> = {};
    dadosConfigSecador.forEach((item) => {
      if (!agrupados[item.unidade]) {
        agrupados[item.unidade] = [];
      }
      agrupados[item.unidade].push(item);
    });
    return agrupados;
  }, [dadosConfigSecador]);

  // Dados ao vivo (dadosCardSecador) para preencher value1, value2 e status quando disponíveis
  const getDadosCardPorSecador = (nomeSecador: string) =>
    dadosCardSecador.find((c) => c.secador === nomeSecador);

  useEffect(() => {
    console.log('[HomeSecador] Dados que estão chegando:', {
      dadosCardSecador,
      dadosConfigSecador,
      secadoresPorUnidade,
    });
  }, [dadosCardSecador, dadosConfigSecador, secadoresPorUnidade]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto">
            {loading || loadingConfig ? (
              <div className="text-center py-8">
                <p className="text-industrial-gray">Carregando dados...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-industrial-error">Erro: {error}</p>
              </div>
            ) : Object.keys(secadoresPorUnidade).length > 0 ? (
              Object.entries(secadoresPorUnidade).map(([unidade, itensConfig]) => (
                <div key={unidade} className="mb-8">
                  <h2 className="text-2xl font-bold text-industrial-primary mb-6">
                    Secadores - {unidade}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {itensConfig.map((itemConfig) => {
                      const dadosCard = getDadosCardPorSecador(itemConfig.secador);
                      return (
                        <div
                          key={`${itemConfig.unidade}-${itemConfig.secador}`}
                          onClick={() => navigate(`/secador/${itemConfig.secador}`)}
                          className="cursor-pointer transition-transform hover:scale-105"
                        >
                          <SecadorCard
                            title={itemConfig.secador}
                            value1={dadosCard?.tempEntrada ?? itemConfig.tempEntrada?.max ?? 'N/A'}
                            value2={dadosCard?.umidadeSaida ?? itemConfig.umidadeSaida?.max ?? 'N/A'}
                            description1="Temperatura Entrada"
                            description2="Umidade Saída"
                            unit1="°C"
                            unit2="%"
                            status={dadosCard?.status ?? '0'}
                            icon={<Wind size={40} />}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeSecador;