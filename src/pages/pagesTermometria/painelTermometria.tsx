import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useConfigTermometria } from '@/hooks/hooksTermometria/useConfigTermometria';
import { useOnlineTermometria } from '@/hooks/hooksTermometria/useOnlineTermometria';
import { getTermometriaContext } from '@/utils/apiConfig';
import { ArrowLeft, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LeituraTermometria } from '@/hooks/hooksTermometria/useOnlineTermometria';

const PainelTermometria = () => {
  const { silo: siloParam } = useParams<{ silo: string }>();
  const navigate = useNavigate();
  const ctx = getTermometriaContext();
  const { dadosConfigTermometria, loading, error, carregarConfigTermometria } = useConfigTermometria();
  const { dadosOnlineTermometria, loading: loadingOnline, error: errorOnline, carregarOnlineTermometria } = useOnlineTermometria();

  useEffect(() => {
    if (ctx?.unidade && ctx?.silo) {
      carregarConfigTermometria({ unidade: ctx.unidade, silo: ctx.silo });
    } else if (siloParam) {
      carregarConfigTermometria({ silo: siloParam });
    }
  }, [ctx?.unidade, ctx?.silo, siloParam, carregarConfigTermometria]);

  useEffect(() => {
    if (ctx?.empresa && ctx?.unidade && ctx?.silo) {
      carregarOnlineTermometria({ empresa: ctx.empresa, unidade: ctx.unidade, silo: ctx.silo });
    } else if (siloParam) {
      carregarOnlineTermometria({ silo: siloParam });
    }
  }, [ctx?.empresa, ctx?.unidade, ctx?.silo, siloParam, carregarOnlineTermometria]);

  const configSilo = dadosConfigTermometria[0] ?? null;

  // Agrupa leituras por pêndulo para exibição
  const leiturasPorPendulo = useMemo(() => {
    const map = new Map<number, LeituraTermometria[]>();
    dadosOnlineTermometria.forEach((leitura) => {
      const list = map.get(leitura.pendulo) ?? [];
      list.push(leitura);
      map.set(leitura.pendulo, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [dadosOnlineTermometria]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              onClick={() => navigate('/termometria')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            {loading && !dadosOnlineTermometria.length ? (
              <p className="text-industrial-gray">Carregando...</p>
            ) : error && !dadosOnlineTermometria.length ? (
              <p className="text-industrial-error">Erro: {error}</p>
            ) : (
              <>
                {(configSilo || siloParam || ctx?.silo) && (
                  <div className="mb-4">
                    <h1 className="text-2xl font-bold text-industrial-primary mb-2">
                      Termometria - {configSilo?.silo ?? siloParam ?? ctx?.silo ?? 'Silo'}
                    </h1>
                    {configSilo && (
                      <p className="text-industrial-gray">
                        Unidade: {configSilo.unidade} | Silo: {configSilo.silo}
                      </p>
                    )}
                  </div>
                )}

                {loadingOnline && <p className="text-industrial-gray text-sm mt-2">Carregando leituras...</p>}
                {errorOnline && <p className="text-industrial-error text-sm mt-2">Erro leituras: {errorOnline}</p>}

                {!loadingOnline && !errorOnline && dadosOnlineTermometria.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-industrial-primary mb-3 flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      Leituras dos sensores ({dadosOnlineTermometria.length})
                    </h2>
                    <div className="space-y-6">
                      {leiturasPorPendulo.map(([pendulo, leituras]) => (
                        <div key={pendulo} className="rounded-lg border border-industrial-gray/20 bg-white/50 p-4">
                          <h3 className="text-sm font-medium text-industrial-primary mb-3">Pêndulo {pendulo}</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-industrial-gray/30">
                                  <th className="text-left py-2 px-2">Sensor</th>
                                  <th className="text-left py-2 px-2">Temperatura</th>
                                  <th className="text-left py-2 px-2">Status</th>
                                  <th className="text-left py-2 px-2">Data leitura</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[...leituras]
                                  .sort((a, b) => a.sensor - b.sensor)
                                  .map((l) => (
                                    <tr key={`${l.pendulo}-${l.sensor}`} className="border-b border-industrial-gray/10">
                                      <td className="py-2 px-2">{l.sensor}</td>
                                      <td className="py-2 px-2 font-medium">{l.temperatura} °C</td>
                                      <td className="py-2 px-2">
                                        <span className={l.status ? 'text-industrial-success' : 'text-industrial-error'}>
                                          {l.status ? 'OK' : 'Falha'}
                                        </span>
                                      </td>
                                      <td className="py-2 px-2 text-industrial-gray">
                                        {l.data_leitura ? new Date(l.data_leitura).toLocaleString('pt-BR') : '-'}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!loadingOnline && !errorOnline && dadosOnlineTermometria.length === 0 && !loading && (
                  <p className="text-industrial-gray text-sm mt-2">Nenhuma leitura de sensor disponível.</p>
                )}

                {!configSilo && !loading && !error && !dadosOnlineTermometria.length && (
                  <p className="text-industrial-gray">Nenhuma configuração ou leitura encontrada para este silo.</p>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PainelTermometria;
