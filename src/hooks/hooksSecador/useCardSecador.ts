import { useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders, getEmpresa, getUnidade, getSecadorContext } from '@/utils/apiConfig';

/** Parâmetros no mesmo formato do item do Sidebar (empresa, unidade, secador) */
export interface FiltroSecadorOnline {
  empresa?: string | null;
  unidade?: string | null;
}

//Interface para dados do card do secador
interface dadosCardSecador {
  status?: string;
  unidade: string;
  secador: string;
  tempEntrada: string | null;
  umidadeSaida: string | null;
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

  const carregarCardSecador = useCallback(async (filtro?: FiltroSecadorOnline) => {
    setError(null);
    setLoading(true);

    try {
      const empresa = filtro?.empresa ?? getSecadorContext()?.empresa ?? getEmpresa();
      const unidade = filtro?.unidade ?? getSecadorContext()?.unidade ?? getUnidade();

      const authHeaders = getAuthHeaders();

      const body: Record<string, string> = {};
      if (empresa) body.empresa = empresa;
      if (unidade) body.unidade = unidade;

      const response = await axios.post(
        `https://api-system.agroflowsystems.com.br/secador/card`,
        body,
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
          if (typeof dados.unidade === 'string' && typeof dados.secador === 'string') {
            const dadosConvertidos: dadosCardSecador = {
              status: dados.status !== undefined ? String(dados.status) : undefined,
              unidade: dados.unidade,
              secador: dados.secador,
              tempEntrada: toStringOrNull(dados.tempEntrada),
              umidadeSaida: toStringOrNull(dados.umidadeSaida),
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
        
        if (typeof dados.unidade === 'string' && typeof dados.secador === 'string') {
          const dadosConvertidos: dadosCardSecador = {
            status: dados.status !== undefined ? String(dados.status) : undefined,
            unidade: dados.unidade,
            secador: dados.secador,
            tempEntrada: toStringOrNull(dados.tempEntrada),
            umidadeSaida: toStringOrNull(dados.umidadeSaida),
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
