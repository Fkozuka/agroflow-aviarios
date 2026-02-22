import React, { createContext, useContext } from 'react';
import { useConfigTermometria } from '@/hooks/hooksTermometria/useConfigTermometria';
import type { DadosConfigTermometria } from '@/hooks/hooksTermometria/useConfigTermometria';
import type { ParamsConfigTermometria } from '@/hooks/hooksTermometria/useConfigTermometria';

interface TermometriaConfigContextValue {
  dadosConfigTermometria: DadosConfigTermometria[];
  loading: boolean;
  error: string | null;
  carregarConfigTermometria: (params?: ParamsConfigTermometria) => Promise<void>;
}

const TermometriaConfigContext = createContext<TermometriaConfigContextValue | null>(null);

export function TermometriaConfigProvider({ children }: { children: React.ReactNode }) {
  const value = useConfigTermometria();
  return (
    <TermometriaConfigContext.Provider value={value}>
      {children}
    </TermometriaConfigContext.Provider>
  );
}

export function useTermometriaConfig(): TermometriaConfigContextValue {
  const context = useContext(TermometriaConfigContext);
  if (!context) {
    throw new Error('useTermometriaConfig deve ser usado dentro de TermometriaConfigProvider');
  }
  return context;
}
