import { useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders, getEmpresa } from '@/utils/apiConfig';

//Interface para o objeto de configuração (estrutura genérica)
interface Config {
  [key: string]: any;
}

//Interface para os pêndulos (pendulo1 até pendulo20)
interface Pendulos {
  pendulo1: number | null;
  pendulo2: number | null;
  pendulo3: number | null;
  pendulo4: number | null;
  pendulo5: number | null;
  pendulo6: number | null;
  pendulo7: number | null;
  pendulo8: number | null;
  pendulo9: number | null;
  pendulo10: number | null;
  pendulo11: number | null;
  pendulo12: number | null;
  pendulo13: number | null;
  pendulo14: number | null;
  pendulo15: number | null;
  pendulo16: number | null;
  pendulo17: number | null;
  pendulo18: number | null;
  pendulo19: number | null;
  pendulo20: number | null;
}

//Interface para dados de configuração da termometria
interface dadosConfigTermometria {
  config: Config;
  empresa: string;
  unidade: string;
  silo: string;
  tipo: string;
  capacidade: string;
  numsensores: number;
  numpendulos: number;
  numaeradores: number;
  pendulos: Pendulos;
}

/**
 * Hook para carregar os dados de configuração da termometria
 * @returns 
 */
export const useConfigTermometria = () => {
  // Estados
  const [dadosConfigTermometria, setDadosConfigTermometria] = useState<dadosConfigTermometria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarConfigTermometria = useCallback(async () => {
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
        `https://api-system.agroflowsystems.com.br/termometria/config`,
        {
          empresa: empresa
        },
        {
          headers: {
            ...authHeaders
          }
        }
      );
            
      // A API retorna um array com objetos dentro
      if (Array.isArray(response.data) && response.data.length > 0) {
        const dadosValidos: dadosConfigTermometria[] = [];
        
        // Função auxiliar para validar Pendulos
        const isValidPendulos = (pendulos: any): pendulos is Pendulos => {
          if (!pendulos || typeof pendulos !== 'object') return false;
          
          // Valida se tem as propriedades pendulo1 até pendulo20
          for (let i = 1; i <= 20; i++) {
            const key = `pendulo${i}`;
            if (!(key in pendulos)) return false;
            const value = pendulos[key];
            if (value !== null && typeof value !== 'number') return false;
          }
          
          return true;
        };
        
        // Valida cada item do array
        for (const dados of response.data) {
          if (
            dados.config &&
            typeof dados.config === 'object' &&
            typeof dados.empresa === 'string' &&
            typeof dados.unidade === 'string' &&
            typeof dados.silo === 'string' &&
            typeof dados.tipo === 'string' &&
            typeof dados.capacidade === 'string' &&
            typeof dados.numsensores === 'number' &&
            typeof dados.numpendulos === 'number' &&
            typeof dados.numaeradores === 'number' &&
            isValidPendulos(dados.pendulos)
          ) {
            const dadosConvertidos: dadosConfigTermometria = {
              config: dados.config,
              empresa: dados.empresa,
              unidade: dados.unidade,
              silo: dados.silo,
              tipo: dados.tipo,
              capacidade: dados.capacidade,
              numsensores: dados.numsensores,
              numpendulos: dados.numpendulos,
              numaeradores: dados.numaeradores,
              pendulos: dados.pendulos,
            };
            
            dadosValidos.push(dadosConvertidos);
          }
        }
        
        if (dadosValidos.length > 0) {
          setDadosConfigTermometria(dadosValidos);
        } else {
          setError('Formato de dados inválido');
        }
      } else {
        setError('Formato de dados inválido');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao carregar configuração da termometria');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dadosConfigTermometria,
    loading,
    error,
    carregarConfigTermometria
  };
};
