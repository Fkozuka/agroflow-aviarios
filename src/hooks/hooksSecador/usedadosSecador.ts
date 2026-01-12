import { useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '@/utils/apiConfig';
import { format, startOfDay, endOfDay } from 'date-fns';

//Interface para dados históricos do secador
export interface SecadorDados {
  id: number;
  secadorId: number;
  timestamp: string;
  umidade_entrada: number;
  umidade_saida: number;
  temperatura_queimador: number;
  pressao_queimador: number;
  temperatura_entrada: number;
  temperatura_saida: number;
  tc_entrada: number;
  tc_saida: number;
  timeUpdate: string;
}

/**
 * Hook para carregar dados históricos do secador com filtros
 * @returns 
 */
export const useDadosSecador = () => {
  // Estados
  const [dadosHistorico, setDadosHistorico] = useState<SecadorDados[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarDadosHistorico = useCallback(async (
    secador?: string,
    dataInicial?: Date,
    dataFinal?: Date
  ) => {
    setError(null);
    setLoading(true);
    
    try {
      const authHeaders = getAuthHeaders();

      // Prepara o body da requisição com os filtros
      const body: any = {};
      
      if (secador) {
        body.secador = secador;
      }
      
      // Se não houver datas selecionadas, usa o dia atual completo (início ao fim)
      if (!dataInicial && !dataFinal) {
        const hoje = new Date();
        const inicioDia = startOfDay(hoje);
        const fimDia = endOfDay(hoje);
        
        body.dataInicial = format(inicioDia, 'yyyy-MM-dd HH:mm:ss');
        body.dataFinal = format(fimDia, 'yyyy-MM-dd HH:mm:ss');
      } else {
        // Se houver pelo menos uma data selecionada, usa as datas fornecidas
        if (dataInicial) {
          body.dataInicial = format(dataInicial, 'yyyy-MM-dd HH:mm:ss');
        }
        
        if (dataFinal) {
          body.dataFinal = format(dataFinal, 'yyyy-MM-dd HH:mm:ss');
        }
      }

      const response = await axios.post(
        `https://api-system.agroflowsystems.com.br/secador/dados`,
        body,
        {
          headers: {
            ...authHeaders
          }
        }
      );
      
      // Processa os dados retornados
      if (Array.isArray(response.data) && response.data.length > 0) {
        const dadosValidos: SecadorDados[] = [];
        
        for (const dados of response.data) {
          // Valida e converte os dados - mapeia da estrutura da API para o formato esperado
          if (dados.timeUpdate && dados.idSecador !== undefined) {
            // Função auxiliar para converter string para number
            const parseNumber = (value: string | null | undefined): number => {
              if (!value || value === 'null' || value === '') return 0;
              const parsed = parseFloat(value);
              return isNaN(parsed) ? 0 : parsed;
            };

            const dadosConvertidos: SecadorDados = {
              id: Number(dados.idSecador) || 0,
              secadorId: Number(dados.idSecador) || 0,
              timestamp: dados.timeUpdate,
              umidade_entrada: parseNumber(dados.umidadeEntrada),
              umidade_saida: parseNumber(dados.umidadeSaida),
              temperatura_queimador: parseNumber(dados.tempQueimador),
              pressao_queimador: parseNumber(dados.pressaoQueimador),
              temperatura_entrada: parseNumber(dados.tempEntrada),
              temperatura_saida: parseNumber(dados.tempSaida),
              tc_entrada: parseNumber(dados.tempMeio) || 0, // Usa tempMeio como tc_entrada se disponível
              tc_saida: 0, // Não há esse campo na API, mantém como 0
              timeUpdate: dados.timeUpdate,
            };
            
            dadosValidos.push(dadosConvertidos);
          }
        }
        
        if (dadosValidos.length > 0) {
          setDadosHistorico(dadosValidos);
        } else {
          setDadosHistorico([]);
        }
      } else {
        setDadosHistorico([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao carregar dados históricos do secador');
      setDadosHistorico([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dadosHistorico,
    loading,
    error,
    carregarDadosHistorico
  };
};