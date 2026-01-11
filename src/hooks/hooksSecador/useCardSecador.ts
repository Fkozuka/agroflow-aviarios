import { useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '@/utils/apiConfig';

//Interface para dados do card do secador
interface dadosCardSecador {
  idSecador: string;
  status?: string;
  unidade: string;
  secador: string;
  tempEntrada: string | null;
  tempMeio: string | null;
  tempSaida: string | null;
  pressaoQueimador: string | null;
  tempQueimador: string | null;
  umidadeEntrada: string | null;
  umidadeSaida: string | null;
  tonEntrada: string | null;
  tonSaida: string | null;
  timeUpdate?: string;
}

/**
 * Hook para carregar os dados do card do secador
 * @returns 
 */
export const useCardSecador = () => {
  // Estados
  const [dadosCardSecador, setDadosCardSecador] = useState<dadosCardSecador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarCardSecador = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      const authHeaders = getAuthHeaders();

      const response = await axios.post(
        `https://api-system.agroflowsystems.com.br/secador/online`,
        {},
        {
          headers: {
            ...authHeaders
          }
        }
      );
      
      // Função auxiliar para garantir que o valor seja string ou null
      const toStringOrNull = (value: any): string | null => {
        if (value === null || value === undefined || value === '') return null;
        return String(value);
      };

      // A API retorna um array com objetos
      if (Array.isArray(response.data) && response.data.length > 0) {
        const dadosValidos: dadosCardSecador[] = [];
        
        // Processa todos os itens do array
        for (const dados of response.data) {
          // Valida os dados
          if (
            dados.idSecador !== undefined &&
            typeof dados.unidade === 'string' &&
            typeof dados.secador === 'string'
          ) {
            const dadosConvertidos: dadosCardSecador = {
              idSecador: String(dados.idSecador),
              status: dados.status !== undefined ? String(dados.status) : undefined,
              unidade: dados.unidade,
              secador: dados.secador,
              tempEntrada: toStringOrNull(dados.tempEntrada),
              tempMeio: toStringOrNull(dados.tempMeio),
              tempSaida: toStringOrNull(dados.tempSaida),
              pressaoQueimador: toStringOrNull(dados.pressaoQueimador),
              tempQueimador: toStringOrNull(dados.tempQueimador),
              umidadeEntrada: toStringOrNull(dados.umidadeEntrada),
              umidadeSaida: toStringOrNull(dados.umidadeSaida),
              tonEntrada: toStringOrNull(dados.tonEntrada),
              tonSaida: toStringOrNull(dados.tonSaida),
              timeUpdate: dados.timeUpdate || undefined
            };
            
            dadosValidos.push(dadosConvertidos);
          }
        }
        
        if (dadosValidos.length > 0) {
          setDadosCardSecador(dadosValidos);
        } else {
          setError('Formato de dados inválido');
        }
      } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // Se retornar um objeto único, converte para array
        const dados = response.data;
        
        if (
          dados.idSecador !== undefined &&
          typeof dados.unidade === 'string' &&
          typeof dados.secador === 'string'
        ) {
          const dadosConvertidos: dadosCardSecador = {
            idSecador: String(dados.idSecador),
            status: dados.status !== undefined ? String(dados.status) : undefined,
            unidade: dados.unidade,
            secador: dados.secador,
            tempEntrada: toStringOrNull(dados.tempEntrada),
            tempMeio: toStringOrNull(dados.tempMeio),
            tempSaida: toStringOrNull(dados.tempSaida),
            pressaoQueimador: toStringOrNull(dados.pressaoQueimador),
            tempQueimador: toStringOrNull(dados.tempQueimador),
            umidadeEntrada: toStringOrNull(dados.umidadeEntrada),
            umidadeSaida: toStringOrNull(dados.umidadeSaida),
            tonEntrada: toStringOrNull(dados.tonEntrada),
            tonSaida: toStringOrNull(dados.tonSaida),
            timeUpdate: dados.timeUpdate || undefined
          };
          
          setDadosCardSecador([dadosConvertidos]);
        } else {
          setError('Formato de dados inválido');
        }
      } else {
        setError('Formato de dados inválido');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao carregar dados do card do secador');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dadosCardSecador,
    loading,
    error,
    carregarCardSecador
  };
};