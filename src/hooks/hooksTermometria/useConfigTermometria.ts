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

/** Parâmetros opcionais para carregar config de um silo específico (página do silo, sidebar, card home) */
export interface ParamsConfigTermometria {
  unidade?: string;
  silo?: string;
}

/**
 * Hook para carregar os dados de configuração da termometria.
 * Pode ser usado para listar todos os silos (sem params) ou para a página do silo (com unidade e silo).
 * Quando o usuário seleciona o silo no Sidebar ou no card da home termometria, use getTermometriaContext() e passe unidade/silo.
 * @param params Opcional: { unidade, silo } para carregar apenas o config daquele silo
 * @returns dadosConfigTermometria, loading, error, carregarConfigTermometria
 */
export const useConfigTermometria = () => {
  // Estados
  const [dadosConfigTermometria, setDadosConfigTermometria] = useState<dadosConfigTermometria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarConfigTermometria = useCallback(async (params?: ParamsConfigTermometria) => {
    setError(null);
    setLoading(true);

    const unidade = params?.unidade;
    const silo = params?.silo;

    try {
      // Obtém a empresa do localStorage
      const empresa = getEmpresa();

      if (!empresa) {
        setError('Empresa não encontrada');
        setLoading(false);
        return;
      }

      const authHeaders = getAuthHeaders();

      const body: { empresa: string; unidade?: string; silo?: string } = { empresa };
      if (unidade != null && unidade !== '') body.unidade = unidade;
      if (silo != null && silo !== '') body.silo = silo;

      const response = await axios.post(
        `https://api-system.agroflowsystems.com.br/termometria/config`,
        body,
        {
          headers: {
            ...authHeaders
          }
        }
      );
            
      // A API pode retornar array direto ou objeto com payload (ex: { payload: [...] })
      const rawData = response.data;
      const dataArray = Array.isArray(rawData)
        ? rawData
        : rawData?.payload && Array.isArray(rawData.payload)
          ? rawData.payload
          : [];

      if (dataArray.length > 0) {
        const dadosValidos: dadosConfigTermometria[] = [];

        // Função auxiliar para validar Pendulos (aceita number | null)
        const isValidPendulos = (pendulos: any): pendulos is Pendulos => {
          if (!pendulos || typeof pendulos !== 'object') return false;
          for (let i = 1; i <= 20; i++) {
            const key = `pendulo${i}`;
            if (!(key in pendulos)) return false;
            const value = pendulos[key];
            if (value !== null && value !== undefined && typeof value !== 'number') return false;
          }
          return true;
        };

        const toNumber = (v: any): number => {
          if (v == null) return 0;
          if (typeof v === 'number' && !Number.isNaN(v)) return v;
          const n = Number(v);
          return Number.isNaN(n) ? 0 : n;
        };
        const toString = (v: any): string => (v != null ? String(v) : '');

        for (const dados of dataArray) {
          // Aceita campos no root ou dentro de config (API retorna config: { empresa, unidade, silo, ... })
          const c = dados?.config != null && typeof dados.config === 'object' ? dados.config : {};
          const empresa = dados?.empresa ?? c?.empresa;
          const unidade = dados?.unidade ?? c?.unidade;
          const silo = dados?.silo ?? c?.silo;
          const tipo = dados?.tipo ?? c?.tipo;
          if (
            dados != null &&
            typeof dados === 'object' &&
            typeof empresa === 'string' &&
            typeof unidade === 'string' &&
            typeof silo === 'string' &&
            typeof tipo === 'string' &&
            isValidPendulos(dados.pendulos)
          ) {
            const dadosConvertidos: dadosConfigTermometria = {
              config: dados.config != null && typeof dados.config === 'object' ? dados.config : {},
              empresa: String(empresa),
              unidade: String(unidade),
              silo: String(silo),
              tipo: String(tipo),
              capacidade: toString(dados.capacidade ?? c?.capacidade),
              numsensores: toNumber(dados.numsensores ?? c?.numsensores),
              numpendulos: toNumber(dados.numpendulos ?? c?.numpendulos),
              numaeradores: toNumber(dados.numaeradores ?? c?.numaeradores),
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
