import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SecadorCard from '@/components/secadorCard';
import { useCardSecador } from '@/hooks/hooksSecador/useCardSecador';
import { useConfigSecador as useConfigSidebarSecador } from '@/hooks/hooksSecador/useConfigSidebarSecador';
import { getSecadorContext, setSecadorContext } from '@/utils/apiConfig';
import { Wind } from 'lucide-react';

const HomeSecador = () => {
  const navigate = useNavigate();
  const { dadosCardSecador, loading, error, carregarCardSecador } = useCardSecador();
  const { dadosConfigSecador, loading: loadingConfig, carregarConfigSecador } = useConfigSidebarSecador();

  // Ao acionar a página: carrega a config primeiro
  useEffect(() => {
    carregarConfigSecador();
  }, [carregarConfigSecador]);

  // Quando a config estiver pronta, busca os dados dos cards da empresa.
  useEffect(() => {
    if (loadingConfig) return;
    const context = getSecadorContext();
    const primeiroItem = dadosConfigSecador[0];
    const empresa = context?.empresa ?? primeiroItem?.empresa;
    if (empresa) {
      carregarCardSecador({ empresa });
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

  const normalizarUnidade = (unidade: string) =>
    unidade.trim().replace(/^unidade\s+/i, '').toLowerCase();

  // Dados ao vivo (dadosCardSecador) para preencher value1, value2 e status quando disponíveis
  const getDadosCardPorSecador = (nomeSecador: string, unidade: string) =>
    dadosCardSecador.find(
      (c) =>
        c.secador === nomeSecador &&
        normalizarUnidade(c.unidade) === normalizarUnidade(unidade)
    );

  const isCarregamentoInicial = loadingConfig || (loading && dadosCardSecador.length === 0);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="container mx-auto">
            {isCarregamentoInicial ? (
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
                      const dadosCard = getDadosCardPorSecador(itemConfig.secador, itemConfig.unidade);
                      return (
                        <div
                          key={`${itemConfig.unidade}-${itemConfig.secador}`}
                          onClick={() => {
                            setSecadorContext({
                              empresa: itemConfig.empresa,
                              unidade: itemConfig.unidade,
                              secador: itemConfig.secador,
                            });
                            navigate(`/secador/${itemConfig.secador}`);
                          }}
                          className="cursor-pointer transition-transform hover:scale-105"
                        >
                          <SecadorCard
                            title={itemConfig.secador}
                            value1={dadosCard?.tempEntrada ?? 'N/A'}
                            value2={dadosCard?.umidadeSaida ?? 'N/A'}
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