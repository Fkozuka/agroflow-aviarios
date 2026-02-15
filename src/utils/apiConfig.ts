/**
 * Função utilitária para obter a porta da API baseada na unidade selecionada
 * @returns A porta da API (padrão: 1884 para Unidade Penha)
 */
export const getApiPort = (): number => {
  const unidadeId = localStorage.getItem('unidade');
  const unidadeNome = localStorage.getItem('unidadeNome');
  
  // Unidade Penha (id: "1") usa porta 1884
    if (unidadeId === "1" || unidadeNome === "Unidade Penha") {
        return 1884;
    }
    if (unidadeId === "2" || unidadeNome === "Unidade Goioerê") {
        return 1885;
    }
  
  // Outras unidades podem ter outras portas
  // Por padrão, retorna 1884 se não especificado
  return 1884;
};

/**
 * Função utilitária para obter a URL base da API
 * @returns A URL base da API com a porta correta
 */
export const getApiBaseUrl = (): string => {
  const port = getApiPort();
  return `http://10.99.2.17:${port}`;
};

/**
 * Função utilitária para verificar se a unidade selecionada é Goioerê
 * @returns true se a unidade for Goioerê, false caso contrário
 */
export const isUnidadeGoioere = (): boolean => {
  const unidadeId = localStorage.getItem('unidade');
  const unidadeNome = localStorage.getItem('unidadeNome');
  
  return unidadeId === "2" || unidadeNome === "Unidade Goioerê";
};

/**
 * Função utilitária para obter o token de autenticação
 * @returns O token de autenticação ou null se não existir
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Função utilitária para obter os headers de autenticação
 * @returns Objeto com os headers de autenticação ou objeto vazio se não houver token
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  return {};
};

/**
 * Função utilitária para obter a empresa do usuário
 * @returns A empresa do usuário ou null se não existir
 */
export const getEmpresa = (): string | null => {
  return localStorage.getItem('empresa');
};

/**
 * Função utilitária para obter a unidade do usuário (nome ou id)
 * @returns A unidade do usuário ou null se não existir
 */
export const getUnidade = (): string | null => {
  return localStorage.getItem('unidadeNome') || localStorage.getItem('unidade');
};

const SECADOR_SELECIONADO_KEY = 'secadorSelecionado';
const SECADOR_CONTEXT_KEY = 'secadorContext';

/** Contexto do secador no mesmo formato do item do Sidebar (empresa, unidade, secador) */
export interface SecadorContext {
  empresa: string;
  unidade: string;
  secador: string;
}

/**
 * Função utilitária para obter o secador selecionado (último usado na sidebar/página)
 * @returns O nome do secador selecionado ou null se não existir
 */
export const getSecador = (): string | null => {
  return localStorage.getItem(SECADOR_SELECIONADO_KEY);
};

/**
 * Retorna o contexto completo do secador (empresa, unidade, secador) no mesmo formato do Sidebar.
 * Usado para enviar os mesmos parâmetros que o item do Sidebar na API.
 */
export const getSecadorContext = (): SecadorContext | null => {
  try {
    const raw = localStorage.getItem(SECADOR_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SecadorContext;
    if (parsed?.empresa && parsed?.unidade && parsed?.secador) return parsed;
    return null;
  } catch {
    return null;
  }
};

/**
 * Persiste o secador selecionado (usado ao navegar para um secador ou selecionar no sidebar)
 */
export const setSecador = (secador: string): void => {
  localStorage.setItem(SECADOR_SELECIONADO_KEY, secador);
};

/**
 * Persiste o contexto completo do secador (empresa, unidade, secador) no mesmo formato do Sidebar.
 * Assim o useOnlineSecador envia os mesmos parâmetros que o item do Sidebar.
 */
export const setSecadorContext = (context: SecadorContext): void => {
  localStorage.setItem(SECADOR_SELECIONADO_KEY, context.secador);
  localStorage.setItem(SECADOR_CONTEXT_KEY, JSON.stringify(context));
};

