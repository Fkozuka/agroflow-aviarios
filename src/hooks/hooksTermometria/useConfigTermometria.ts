import { useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders, getEmpresa } from '@/utils/apiConfig';

// Interface para o objeto de configuração (estrutura genérica)
interface Config {
  [key: string]: any;
}

// Interface para os pêndulos (pendulo1 até pendulo20)
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

// Interface para dados de configuração da termometria
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

/** Tipo exportado para uso em componentes (ex.: MonitorTermometriaCard) */
export type DadosConfigTermometria = dadosConfigTermometria;

/**
 * Hook para carregar os dados de configuração da termometria.
 * Sem params: lista todos os silos. Com { unidade, silo }: config do silo específico.
 */
export const useConfigTermometria = () => {
  const [dadosConfigTermometria, setDadosConfigTermometria] = useState<dadosConfigTermometria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarConfigTermometria = useCallback(async (params?: ParamsConfigTermometria) => {
    setError(null);
    setLoading(true);

    try {
      const empresa = getEmpresa();

      if (!empresa) {
        setError('Empresa não encontrada');
        setLoading(false);
        return;
      }

      const authHeaders = getAuthHeaders();
      const body: { empresa: string; unidade?: string; silo?: string } = { empresa };
      if (params?.unidade != null && params.unidade !== '') body.unidade = params.unidade;
      if (params?.silo != null && params.silo !== '') body.silo = params.silo;

      const response = await axios.post(
        'https://api-system.agroflowsystems.com.br/termometria/config',
        body,
        { headers: { ...authHeaders } }
      );

      const rawData = response.data;

      // API pode retornar array, { payload: [...] } ou um único objeto { config, pendulos }
      let dataArray: any[] = [];
      if (Array.isArray(rawData)) {
        dataArray = rawData;
      } else if (rawData?.payload && Array.isArray(rawData.payload)) {
        dataArray = rawData.payload;
      } else if (rawData && typeof rawData === 'object' && (rawData.config != null || rawData.pendulos != null)) {
        dataArray = [rawData];
      }

      if (dataArray.length > 0) {
        const dadosValidos: dadosConfigTermometria[] = [];

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

        const pendulosVazios: Pendulos = {
          pendulo1: null, pendulo2: null, pendulo3: null, pendulo4: null, pendulo5: null,
          pendulo6: null, pendulo7: null, pendulo8: null, pendulo9: null, pendulo10: null,
          pendulo11: null, pendulo12: null, pendulo13: null, pendulo14: null, pendulo15: null,
          pendulo16: null, pendulo17: null, pendulo18: null, pendulo19: null, pendulo20: null,
        };

        const toNumber = (v: any): number => {
          if (v == null) return 0;
          if (typeof v === 'number' && !Number.isNaN(v)) return v;
          const n = Number(v);
          return Number.isNaN(n) ? 0 : n;
        };
        const toString = (v: any): string => (v != null ? String(v) : '');

        for (const dados of dataArray) {
          const c = dados?.config != null && typeof dados.config === 'object' ? dados.config : {};
          const empresaVal = dados?.empresa ?? c?.empresa;
          const unidadeVal = dados?.unidade ?? c?.unidade;
          const siloVal = dados?.silo ?? c?.silo;
          const tipoVal = dados?.tipo ?? c?.tipo;

          if (
            dados != null &&
            typeof dados === 'object' &&
            typeof empresaVal === 'string' &&
            typeof unidadeVal === 'string' &&
            typeof siloVal === 'string'
          ) {
            const tipoStr = tipoVal != null && typeof tipoVal === 'string' ? String(tipoVal).trim() : '';
            const pendulos = isValidPendulos(dados.pendulos) ? dados.pendulos : pendulosVazios;
            dadosValidos.push({
              config: dados.config != null && typeof dados.config === 'object' ? dados.config : {},
              empresa: String(empresaVal),
              unidade: String(unidadeVal),
              silo: String(siloVal),
              tipo: tipoStr,
              capacidade: toString(dados.capacidade ?? c?.capacidade),
              numsensores: toNumber(dados.numsensores ?? c?.numsensores),
              numpendulos: toNumber(dados.numpendulos ?? c?.numpendulos),
              numaeradores: toNumber(dados.numaeradores ?? c?.numaeradores),
              pendulos,
            });
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
