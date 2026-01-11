import { useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders, getEmpresa } from '@/utils/apiConfig';

//Interface para dados de configuração do secador
interface dadosConfigSecador {
  empresa : string;
  unidade : string;
  secador : string;
  tempEntrada : boolean;
  tempMeio : boolean;
  tempSaida : boolean;
  pressaoQueimador : boolean;
  tempQueimador : boolean;
  umidadeEntrada : boolean;
  umidadeSaida : boolean;
  tonEntrada : boolean;
  tonSaida : boolean;
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

      const response = await axios.post(
        `https://api-system.agroflowsystems.com.br/secador/config`,
        {
          empresa: empresa
        },
        {
          headers: {
            ...authHeaders
          }
        }
      );
      
      console.log('useConfigSecador - Resposta da API:', response.data);
      
      // A API retorna um array com objetos dentro
      if (Array.isArray(response.data) && response.data.length > 0) {
        const dadosValidos: dadosConfigSecador[] = [];
        
        // Valida cada item do array
        for (const dados of response.data) {
          if (
            typeof dados.empresa === 'string' &&
            typeof dados.unidade === 'string' &&
            typeof dados.secador === 'string' &&
            typeof dados.tempEntrada === 'boolean' &&
            typeof dados.tempMeio === 'boolean' &&
            typeof dados.tempSaida === 'boolean' &&
            typeof dados.pressaoQueimador === 'boolean' &&
            typeof dados.tempQueimador === 'boolean' &&
            typeof dados.umidadeEntrada === 'boolean' &&
            typeof dados.umidadeSaida === 'boolean' &&
            typeof dados.tonEntrada === 'boolean' &&
            typeof dados.tonSaida === 'boolean'
          ) {
            dadosValidos.push(dados);
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
