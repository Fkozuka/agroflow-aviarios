import { useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthHeaders, getEmpresa, getTermometriaContext } from '@/utils/apiConfig';
/** Um item do payload: leitura de um sensor (pendulo + sensor) com temperatura e status */
export interface LeituraTermometria {
  pendulo: number;
  sensor: number;
  temperatura: string;
  status: boolean;
  data_leitura: string;
}

/** Resposta do backend: _msgid opcional e payload array de leituras */
export interface ResponseOnlineTermometria {
  _msgid?: string;
  payload: LeituraTermometria[];
}

/** Parâmetros para carregar dados online da termometria (empresa, unidade, silo) */
export interface FiltroOnlineTermometria {
  empresa?: string | null;
  unidade?: string | null;
  silo?: string | null;
}

/**
 * Hook para carregar os dados online da termometria (leituras de sensores por pêndulo).
 * Usa o mesmo padrão de parâmetros do useConfigTermometria (unidade/silo) e do contexto (Sidebar/card).
 * Backend retorna: { _msgid?, payload: [{ pendulo, sensor, temperatura, status, data_leitura }] }
 * ou cada item pode vir em item.dados.
 * @returns dadosOnlineTermometria (array de leituras), loading, error, carregarOnlineTermometria
 */
export const useOnlineTermometria = () => {
  const [dadosOnlineTermometria, setDadosOnlineTermometria] = useState<LeituraTermometria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarOnlineTermometria = useCallback(async (filtro?: FiltroOnlineTermometria) => {
    setError(null);
    setLoading(true);

    try {
      const ctx = getTermometriaContext();
      const empresa = filtro?.empresa ?? ctx?.empresa ?? getEmpresa();
      const unidade = filtro?.unidade ?? ctx?.unidade ?? undefined;
      const silo = filtro?.silo ?? ctx?.silo ?? undefined;

      if (!empresa) {
        setError('Empresa não encontrada');
        setLoading(false);
        return;
      }

      const authHeaders = getAuthHeaders();
      const body: { empresa: string; unidade?: string; silo?: string } = { empresa };
      if (unidade != null && unidade !== '') body.unidade = unidade;
      if (silo != null && silo !== '') body.silo = silo;

      const response = await axios.post<ResponseOnlineTermometria | LeituraTermometria[]>(
        'https://api-system.agroflowsystems.com.br/termometria/online',
        body,
        { headers: { ...authHeaders } }
      );

      const raw = response.data;

      // API pode retornar array direto (204 itens) ou objeto { payload: [...] }
      const payload: unknown[] = Array.isArray(raw)
        ? raw
        : (raw && typeof raw === 'object' && 'payload' in raw && Array.isArray((raw as ResponseOnlineTermometria).payload))
          ? (raw as ResponseOnlineTermometria).payload
          : [];

      const toNumber = (v: unknown): number => {
        if (v == null) return 0;
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
        const n = Number(v);
        return Number.isNaN(n) ? 0 : n;
      };
      const toString = (v: unknown): string => (v != null ? String(v) : '');
      const toBool = (v: unknown): boolean => Boolean(v);

      const dadosValidos: LeituraTermometria[] = [];

      for (const item of payload) {
        if (item == null || typeof item !== 'object') continue;

        const obj = item as Record<string, unknown>;
        // Backend envia sempre { dados: { pendulo, sensor, temperatura, status, data_leitura } }; aceita também na raiz
        const inner = obj.dados != null && typeof obj.dados === 'object' ? (obj.dados as Record<string, unknown>) : obj;
        const pendulo = toNumber(inner.pendulo);
        const sensor = toNumber(inner.sensor);
        const temperatura = toString(inner.temperatura);

        // Considera válido se tiver ao menos pendulo, sensor ou temperatura
        const temCampo = inner.pendulo != null || inner.sensor != null || inner.temperatura != null;
        if (inner && typeof inner === 'object' && temCampo) {
          dadosValidos.push({
            pendulo,
            sensor,
            temperatura,
            status: toBool(inner.status),
            data_leitura: toString(inner.data_leitura)
          });
        }
      }

      setDadosOnlineTermometria(dadosValidos);
      if (payload.length > 0 && dadosValidos.length === 0) {
        setError('Formato de dados inválido');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao carregar dados online da termometria');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dadosOnlineTermometria,
    loading,
    error,
    carregarOnlineTermometria
  };
};
