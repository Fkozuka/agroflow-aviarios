import { useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders, getEmpresa, getUnidade, getSecadorContext } from '@/utils/apiConfig';

/** Parâmetros no mesmo formato do item do Sidebar (empresa, unidade, secador) */
export interface FiltroSecadorOnline {
  empresa?: string | null;
  unidade?: string | null;
}

/** Formato de cada item retornado pela API /secador/card (sempre um array) */
interface ItemCardSecadorApi {
  status: number;
  unidade: string;
  secador: string;
  tempEntrada: string;
  umidadeSaida: string;
}

/** Dados do card do secador usados na UI (status em string para exibição) */
interface dadosCardSecador {
  status: string;
  unidade: string;
  secador: string;
  tempEntrada: string;
  umidadeSaida: string;
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

      // A API sempre retorna um array: status (int), unidade, secador, tempEntrada, umidadeSaida (strings)
      const raw = response.data;
      if (!Array.isArray(raw)) {
        setError('Formato de dados inválido');
        return;
      }

      const dadosValidos: dadosCardSecador[] = raw
        .filter((d: ItemCardSecadorApi) => typeof d.unidade === 'string' && typeof d.secador === 'string')
        .map((d: ItemCardSecadorApi) => ({
          status: String(d.status ?? 0),
          unidade: d.unidade,
          secador: d.secador,
          tempEntrada: d.tempEntrada != null && d.tempEntrada !== '' ? String(d.tempEntrada) : '',
          umidadeSaida: d.umidadeSaida != null && d.umidadeSaida !== '' ? String(d.umidadeSaida) : '',
        }));

      setDadosCardSecador(dadosValidos);
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
