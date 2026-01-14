import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { DryerMonitorCard } from '@/components/monitorSecadorCard';
import SecadoresChart from '@/components/SecadoresChart';
import { useCardSecador } from '@/hooks/hooksSecador/useOnlineSecador';
import { useConfigSecador } from '@/hooks/hooksSecador/useConfigSecador';
import { useDadosSecador } from '@/hooks/hooksSecador/usedadosSecador';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PainelSecador = () => {
  const { secadorId } = useParams<{ secadorId: string }>();
  const navigate = useNavigate();
  
  const { dadosCardSecador, loading, error, carregarCardSecador } = useCardSecador();
  const { dadosConfigSecador, loading: loadingConfig, carregarConfigSecador } = useConfigSecador();
  const { dadosHistorico, loading: loadingHistorico, carregarDadosHistorico } = useDadosSecador();

  // Estados para o gráfico
  const [dateInicial, setDateInicial] = useState<Date | undefined>(undefined);
  const [dateFinal, setDateFinal] = useState<Date | undefined>(undefined);
  const [selectedParameter, setSelectedParameter] = useState<string>('umidade_entrada');

  useEffect(() => {
    carregarCardSecador();
    carregarConfigSecador();
  }, [carregarCardSecador, carregarConfigSecador]);

  // Carrega dados históricos apenas quando o secador mudar (carregamento inicial)
  useEffect(() => {
    if (secadorId) {
      carregarDadosHistorico(secadorId, dateInicial, dateFinal);
    }
  }, [secadorId, carregarDadosHistorico]);

  // Encontra o secador específico pelo nome
  const secadorAtual = useMemo(() => {
    if (!secadorId || !dadosCardSecador.length) return null;
    return dadosCardSecador.find((secador) => secador.secador === secadorId);
  }, [secadorId, dadosCardSecador]);

  // Encontra a configuração do secador específico
  const configSecador = useMemo(() => {
    if (!secadorId || !dadosConfigSecador.length) return null;
    return dadosConfigSecador.find(
      (config) => config.secador === secadorId
    );
  }, [secadorId, dadosConfigSecador]);

  // Converte valores string para number
  const parseValue = (value: string | null | undefined): number => {
    if (!value || value === 'null' || value === '') return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Prepara os dados para o componente DryerMonitorCard
  const dadosSecador = useMemo(() => {
    if (!secadorAtual) return null;

    // Determina o status do secador
    const getStatus = (): 'ativo' | 'inativo' | 'manutencao' => {
      if (!secadorAtual?.status) return 'inativo';
      const status = secadorAtual.status;
      if (status === '1') return 'ativo';
      if (status === '3') return 'manutencao';
      return 'inativo';
    };

    return {
      secadorId: parseInt(secadorAtual.idSecador) || 0,
      nome: secadorAtual.secador,
      dados: {
        umidade_entrada: parseValue(secadorAtual.umidadeEntrada),
        umidade_saida: parseValue(secadorAtual.umidadeSaida),
        temperatura_queimador: parseValue(secadorAtual.tempQueimador),
        pressao_queimador: parseValue(secadorAtual.pressaoQueimador),
        temperatura_entrada: parseValue(secadorAtual.tempEntrada),
        temperatura_saida: parseValue(secadorAtual.tempSaida),
        tonelada_entrada: parseValue(secadorAtual.tonEntrada),
        tonelada_saida: parseValue(secadorAtual.tonSaida),
      },
      status: getStatus(),
    };
  }, [secadorAtual]);

  if (loading || loadingConfig) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto h-full p-4 md:p-6">
            <div className="container mx-auto">
              <div className="text-center py-8">
                <p className="text-industrial-gray">Carregando dados...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto h-full p-4 md:p-6">
            <div className="container mx-auto">
              <div className="text-center py-8">
                <p className="text-industrial-error">Erro: {error}</p>
                <Button
                  onClick={() => navigate('/secadores')}
                  className="mt-4"
                  variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Secadores
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!secadorAtual) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto h-full p-4 md:p-6">
            <div className="container mx-auto">
              <div className="text-center py-8">
                <p className="text-industrial-gray">Secador não encontrado</p>
                <Button
                  onClick={() => navigate('/secadores')}
                  className="mt-4"
                  variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Secadores
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto h-full">
          <div className="container mx-auto">
            {/* Botão de voltar */}
            <div className="mb-6 flex justify-end pt-4 px-4 md:px-6">
              <Button
                onClick={() => navigate('/secadores')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>

            {/* Componente DryerMonitorCard com dados dinâmicos */}
            {dadosSecador && (
              <DryerMonitorCard
                secadorId={dadosSecador.secadorId}
                nome={dadosSecador.nome}
                dados={dadosSecador.dados}
                status={dadosSecador.status}
                config={configSecador}
                lastUpdate={secadorAtual?.timeUpdate ? `Atualizado: ${new Date(secadorAtual.timeUpdate).toLocaleString('pt-BR')}` : undefined}
              />
            )}

            {/* Componente SecadoresChart com dados históricos */}
            <div className="mt-6 pb-4 md:pb-6">
              <SecadoresChart
                chartData={dadosHistorico}
                selectedDryer={secadorId || ''}
                secadorNome={secadorAtual?.secador || ''}
                selectedParameter={selectedParameter}
                dateInicial={dateInicial}
                dateFinal={dateFinal}
                setDateInicial={setDateInicial}
                setDateFinal={setDateFinal}
                setSelectedParameter={setSelectedParameter}
                onFilter={(secador, dataInicial, dataFinal) => {
                  carregarDadosHistorico(secador, dataInicial, dataFinal);
                }}
                loading={loadingHistorico}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PainelSecador;

