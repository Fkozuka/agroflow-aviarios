import { useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '@/utils/apiConfig';

//Interface para dados dos sistemas do grupo
interface dadosGrupo {
  secador: boolean;
  termometria: boolean;
  aviario: boolean;
}

/**
 * Hook para carregar os dados dos sistemas do grupo
 * @returns 
 */
export const useGrupo = () => {
  // Estados
  const [dadosGrupo, setDadosGrupo] = useState<dadosGrupo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarDadosGrupo = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Obtém o nome do usuário do localStorage
      const userName = localStorage.getItem('userName');
      
      if (!userName) {
        setError('Usuário não encontrado');
        setLoading(false);
        return;
      }

      const authHeaders = getAuthHeaders();

      const response = await axios.post(
        `https://api-system.agroflowsystems.com.br/grupo`,
        {
          username: userName
        },
        {
          headers: {
            ...authHeaders
          }
        }
      );
      
      // A API retorna um array com um objeto dentro
      if (Array.isArray(response.data) && response.data.length > 0) {
        const dados = response.data[0];
        
        // Verifica se os dados têm a estrutura esperada
        if (
          typeof dados.secador === 'boolean' &&
          typeof dados.termometria === 'boolean' &&
          typeof dados.aviario === 'boolean'
        ) {
          setDadosGrupo(dados);
        } else {
          setError('Formato de dados inválido');
        }
      } else {
        setError('Formato de dados inválido');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao carregar dados do grupo');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dadosGrupo,
    loading,
    error,
    carregarDadosGrupo
  };
};

