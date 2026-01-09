import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '@/utils/apiConfig';

//Interface para dados básicos das valvulas
interface statusCLP {
  status: boolean;
}

/**
 * @returns 
 */
export const useStatusCLP = () => {
  // Estados
  const [statusCLP, setStatusCLP] = useState<statusCLP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarStatusCLP = useCallback(async () => {
    setError(null);
    
    try {
      const response = await axios.post(
        `https://api-system.agroflowsystems.com.br/status-clp`,
        {},
        {
          headers: {
            ...getAuthHeaders()
          }
        }
      );
      
      if (Array.isArray(response.data)) {
        setStatusCLP(response.data);
      } else {
        setError('Formato de dados inválido');
      }
    } catch (err) {
      setError('Erro ao carregar status CLP');
    } finally {
      setLoading(false);
    }
  }, []);


  // Effect para carregar dados e configurar atualização automática

  useEffect(() => {
    carregarStatusCLP();
    
    // Atualiza a cada 5 segundos
    const interval = setInterval(carregarStatusCLP, 5000);
    
    return () => clearInterval(interval);
  }, [carregarStatusCLP]);

  return {
    statusCLP,
    loading,
    error
  };
};

