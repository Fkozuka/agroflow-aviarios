import { useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders, getEmpresa } from '@/utils/apiConfig';

//Interface para campos de configuração com min/max
interface ConfigCampo {
  ativo: boolean;
  min: string | null;
  max: string | null;
}

//Interface para campos de configuração apenas com max (tonEntrada, tonSaida)
interface ConfigCampoMax {
  ativo: boolean;
  max: string | null;
}

//Interface para dados de configuração do secador
interface dadosConfigSecador {
  empresa: string;
  unidade: string;
  secador: string;
  capacidadeNominalTPH: string;
  tempEntrada: ConfigCampo;
  tempMeio: ConfigCampo;
  tempSaida: ConfigCampo;
  tempQueimador: ConfigCampo;
  pressaoQueimador: ConfigCampo;
  umidadeEntrada: ConfigCampo;
  umidadeSaida: ConfigCampo;
  tonEntrada: ConfigCampoMax;
  tonSaida: ConfigCampoMax;
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
            
      // A API retorna um array com objetos dentro
      if (Array.isArray(response.data) && response.data.length > 0) {
        const dadosValidos: dadosConfigSecador[] = [];
        
        // Função auxiliar para validar ConfigCampo
        const isValidConfigCampo = (campo: any): campo is ConfigCampo => {
          return (
            campo &&
            typeof campo === 'object' &&
            typeof campo.ativo === 'boolean' &&
            (campo.min === null || typeof campo.min === 'string') &&
            (campo.max === null || typeof campo.max === 'string')
          );
        };

        // Função auxiliar para validar ConfigCampoMax
        const isValidConfigCampoMax = (campo: any): campo is ConfigCampoMax => {
          return (
            campo &&
            typeof campo === 'object' &&
            typeof campo.ativo === 'boolean' &&
            (campo.max === null || typeof campo.max === 'string')
          );
        };
        
        // Valida cada item do array
        for (const dados of response.data) {
          if (
            typeof dados.empresa === 'string' &&
            typeof dados.unidade === 'string' &&
            typeof dados.secador === 'string' &&
            (typeof dados.capacidadeNominalTPH === 'string' || dados.capacidadeNominalTPH === undefined) &&
            isValidConfigCampo(dados.tempEntrada) &&
            isValidConfigCampo(dados.tempMeio) &&
            isValidConfigCampo(dados.tempSaida) &&
            isValidConfigCampo(dados.tempQueimador) &&
            isValidConfigCampo(dados.pressaoQueimador) &&
            isValidConfigCampo(dados.umidadeEntrada) &&
            isValidConfigCampo(dados.umidadeSaida) &&
            isValidConfigCampoMax(dados.tonEntrada) &&
            isValidConfigCampoMax(dados.tonSaida)
          ) {
            const dadosConvertidos: dadosConfigSecador = {
              empresa: dados.empresa,
              unidade: dados.unidade,
              secador: dados.secador,
              capacidadeNominalTPH: dados.capacidadeNominalTPH || '',
              tempEntrada: dados.tempEntrada,
              tempMeio: dados.tempMeio,
              tempSaida: dados.tempSaida,
              tempQueimador: dados.tempQueimador,
              pressaoQueimador: dados.pressaoQueimador,
              umidadeEntrada: dados.umidadeEntrada,
              umidadeSaida: dados.umidadeSaida,
              tonEntrada: dados.tonEntrada,
              tonSaida: dados.tonSaida,
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
