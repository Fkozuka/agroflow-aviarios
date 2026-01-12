import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SecadorV2 from '@/components/secadorV2';
import SecadoresChart from '@/components/SecadoresChart';
import { useCardSecador } from '@/hooks/hooksSecador/useCardSecador';
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

  // Carrega dados históricos quando o secador ou datas mudarem
  useEffect(() => {
    if (secadorId) {
      carregarDadosHistorico(secadorId, dateInicial, dateFinal);
    }
  }, [secadorId, dateInicial, dateFinal, carregarDadosHistorico]);

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

  // Prepara os dados para o componente SecadorV2
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto">
            {/* Cabeçalho com botão de voltar */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-industrial-primary">
                  {secadorAtual.secador}
                </h1>
                <p className="text-sm text-industrial-gray">
                  {secadorAtual.unidade}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {secadorAtual.timeUpdate && (
                  <div className="text-sm text-industrial-gray">
                    Última atualização: {new Date(secadorAtual.timeUpdate).toLocaleString('pt-BR')}
                  </div>
                )}
                <Button
                  onClick={() => navigate('/secadores')}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </div>
            </div>

            {/* Componente SecadorV2 com dados dinâmicos */}
            {dadosSecador && <SecadorV2 {...dadosSecador} />}

            {/* Componente SecadoresChart com dados históricos */}
            <div className="mt-6">
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
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PainelSecador;

