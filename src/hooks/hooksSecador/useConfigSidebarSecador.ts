import { useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders, getEmpresa, getSystemApiBaseUrl } from '@/utils/apiConfig';

// Interface para os dados usados na sidebar do secador
interface dadosConfigSecador {
  empresa: string;
  unidade: string;
  secador: string;
}

/**
 * Hook para carregar os dados de configuração do secador
 * @returns 
 */
export const useConfigSecador = () => {
  // Estados
  const [dadosConfigSecador, setDadosConfigSecador] = useState<dadosConfigSecador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarConfigSecador = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Obtém a empresa do localStorage
      const empresa = getEmpresa();
      
      if (!empresa) {
        setError('Empresa não encontrada');
        setLoading(false);
        return;
      }

      const authHeaders = getAuthHeaders();
      const endpoint = `${getSystemApiBaseUrl()}/secador/config/sidebar`;
      const body: Record<string, string> = { empresa };

      const response = await axios.post(
        endpoint,
        body,
        {
          headers: {
            ...authHeaders
          }
        }
      );
            
      // A API retorna apenas os dados necessários para montar a sidebar
      if (Array.isArray(response.data) && response.data.length > 0) {
        const dadosValidos: dadosConfigSecador[] = [];

        // Valida cada item do array
        for (const dados of response.data) {
          if (
            typeof dados.empresa === 'string' &&
            typeof dados.unidade === 'string' &&
            typeof dados.secador === 'string'
          ) {
            const dadosConvertidos: dadosConfigSecador = {
              empresa: dados.empresa,
              unidade: dados.unidade,
              secador: dados.secador,
            };
            
            dadosValidos.push(dadosConvertidos);
          }
        }
        
        if (dadosValidos.length > 0) {
          setDadosConfigSecador(dadosValidos);
        } else {
          setError('Formato de dados inválido');
        }
      } else {
        setError('Formato de dados inválido');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao carregar configuração do secador');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dadosConfigSecador,
    loading,
    error,
    carregarConfigSecador
  };
};
