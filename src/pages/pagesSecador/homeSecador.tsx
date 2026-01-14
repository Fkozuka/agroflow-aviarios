import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SecadorCard from '@/components/secadorCard';
import { useCardSecador } from '@/hooks/hooksSecador/useOnlineSecador';
import { useConfigSecador } from '@/hooks/hooksSecador/useConfigSecador';
import { Wind } from 'lucide-react';

const HomeSecador = () => {
  const navigate = useNavigate();
  const { dadosCardSecador, loading, error, carregarCardSecador } = useCardSecador();
  const { dadosConfigSecador, loading: loadingConfig, carregarConfigSecador } = useConfigSecador();

  useEffect(() => {
    carregarCardSecador();
    carregarConfigSecador();
  }, [carregarCardSecador, carregarConfigSecador]);

  // Agrupa os secadores por unidade
  const secadoresPorUnidade = useMemo(() => {
    const agrupados: Record<string, typeof dadosCardSecador> = {};
    
    dadosCardSecador.forEach((secador) => {
      if (!agrupados[secador.unidade]) {
        agrupados[secador.unidade] = [];
      }
      agrupados[secador.unidade].push(secador);
    });
    
    // Ordena os secadores dentro de cada unidade por idSecador
    Object.keys(agrupados).forEach((unidade) => {
      agrupados[unidade].sort((a, b) => parseInt(a.idSecador) - parseInt(b.idSecador));
    });
    
    return agrupados;
  }, [dadosCardSecador]);

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
              Object.entries(secadoresPorUnidade).map(([unidade, secadores]) => (
                <div key={unidade} className="mb-8">
                  <h2 className="text-2xl font-bold text-industrial-primary mb-6">
                    Secadores - {unidade}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {secadores.map((secador) => (
                      <div
                        key={secador.idSecador}
                        onClick={() => navigate(`/secador/${secador.secador}`)}
                        className="cursor-pointer transition-transform hover:scale-105"
                      >
                        <SecadorCard
                          title={secador.secador}
                          value1={secador.tempEntrada ?? 'N/A'}
                          value2={secador.umidadeSaida ?? 'N/A'}
                          description1="Temperatura Entrada"
                          description2="Umidade Saída"
                          unit1="°C"
                          unit2="%"
                          status={secador.status || '0'}
                          icon={<Wind size={40} />}
                        />
                      </div>
                    ))}
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

