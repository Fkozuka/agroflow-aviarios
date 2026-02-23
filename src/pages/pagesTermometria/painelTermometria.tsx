import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useConfigTermometria } from '@/hooks/hooksTermometria/useConfigTermometria';
import { useOnlineTermometria } from '@/hooks/hooksTermometria/useOnlineTermometria';
import { getTermometriaContext } from '@/utils/apiConfig';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonitorTermometriaCard } from '@/components/monitorTermometriaCard';

/** Normaliza nome do silo para comparação (ex.: "Silo 2" e "Silo 02" batem) */
function normalizarSiloParaComparacao(nome: string): string {
  const num = parseInt(nome.replace(/\D/g, ''), 10);
  return Number.isNaN(num) ? nome.trim().toLowerCase() : `silo${num}`;
}

const PainelTermometria = () => {
  const { silo: siloParam } = useParams<{ silo: string }>();
  const navigate = useNavigate();
  const ctx = getTermometriaContext();

  const { dadosConfigTermometria, loading, error, carregarConfigTermometria } = useConfigTermometria();
  const { dadosOnlineTermometria, loading: loadingOnline, error: errorOnline, carregarOnlineTermometria } = useOnlineTermometria();

  // Silo em exibição: prioridade para o parâmetro da URL, depois contexto
  const siloAtual = siloParam ?? ctx?.silo ?? null;

  // Config do silo: busca por nome exato ou normalizado (Silo 2 / Silo 02), senão usa o primeiro da lista
  const configSilo = useMemo(() => {
    if (!dadosConfigTermometria.length) return null;
    if (siloAtual) {
      const siloDecoded = decodeURIComponent(siloAtual);
      const keyAtual = normalizarSiloParaComparacao(siloDecoded);
      const encontrado = dadosConfigTermometria.find(
        (d) =>
          d.silo === siloAtual ||
          d.silo === siloDecoded ||
          normalizarSiloParaComparacao(d.silo) === keyAtual
      );
      return encontrado ?? dadosConfigTermometria[0] ?? null;
    }
    return dadosConfigTermometria[0] ?? null;
  }, [dadosConfigTermometria, siloAtual]);

  // Carrega config do silo quando a página ou o contexto mudam
  useEffect(() => {
    if (!siloAtual) return;
    carregarConfigTermometria({
      ...(ctx?.unidade && { unidade: ctx.unidade }),
      silo: siloAtual,
    });
  }, [siloAtual, ctx?.unidade, carregarConfigTermometria]);

  // Carrega leituras online do silo
  useEffect(() => {
    if (ctx?.empresa && ctx?.unidade && ctx?.silo) {
      carregarOnlineTermometria({ empresa: ctx.empresa, unidade: ctx.unidade, silo: ctx.silo });
    } else if (siloAtual) {
      carregarOnlineTermometria({ silo: siloAtual });
    }
  }, [ctx?.empresa, ctx?.unidade, ctx?.silo, siloAtual, carregarOnlineTermometria]);

  // Texto empresa · unidade (config ou contexto)
  const labelEmpresaUnidade = configSilo
    ? `${configSilo.empresa} · ${configSilo.unidade}`
    : ctx?.empresa && ctx?.unidade
      ? `${ctx.empresa} · ${ctx.unidade}`
      : ctx?.empresa ?? ctx?.unidade ?? '';

  const nomeSilo = configSilo?.silo ?? siloAtual ?? 'Silo';
  const mostrarCard = Boolean(configSilo || dadosOnlineTermometria.length > 0);
  const carregandoInicial = loading && dadosOnlineTermometria.length === 0;
  const temErroInicial = error && dadosOnlineTermometria.length === 0;
  const semDados = !configSilo && !loading && !error && dadosOnlineTermometria.length === 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="container mx-auto p-6">
            {/* Cabeçalho: empresa/unidade à esquerda, botão Voltar à direita */}
            <div className="mb-4 flex items-center justify-between">
              {labelEmpresaUnidade && (
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{labelEmpresaUnidade}</h2>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate('/termometria')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>

            {carregandoInicial && <p className="text-industrial-gray">Carregando...</p>}
            {temErroInicial && <p className="text-industrial-error">Erro: {error}</p>}

            {!carregandoInicial && !temErroInicial && (
              <>
                {mostrarCard && (
                  <div className="mb-6 w-2/3 max-w-[66.666vw]">
                    <MonitorTermometriaCard
                      nome={nomeSilo}
                      config={configSilo ?? null}
                      leituras={dadosOnlineTermometria}
                      lastUpdate={dadosOnlineTermometria[0]?.data_leitura}
                    />
                  </div>
                )}

                {loadingOnline && (
                  <p className="text-industrial-gray text-sm mt-2">Carregando leituras...</p>
                )}
                {errorOnline && (
                  <p className="text-industrial-error text-sm mt-2">Erro leituras: {errorOnline}</p>
                )}
                {!loadingOnline && !errorOnline && dadosOnlineTermometria.length === 0 && !loading && (
                  <p className="text-industrial-gray text-sm mt-2">Nenhuma leitura de sensor disponível.</p>
                )}

                {semDados && (
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
