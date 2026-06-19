const STORAGE_KEYS = {
  authToken: 'auth_token',
  empresa: 'empresa',
  unidade: 'unidade',
  unidadeNome: 'unidadeNome',
  secadorSelecionado: 'secadorSelecionado',
  secadorContext: 'secadorContext',
  termometriaContext: 'termometriaContext',
  systemApiBaseUrl: 'systemApiBaseUrl',
} as const;

const LOCAL_API_HOST = 'http://10.99.2.17';
const DEFAULT_API_PORT = 1884;
const UNIDADE_API_PORTS = [
  { id: '1', nome: 'Unidade Penha', port: 1884 },
  { id: '2', nome: 'Unidade Goioerê', port: 1885 },
] as const;

export const SYSTEM_API_BASE_URLS = {
  producao: 'http://10.99.2.17:1886',
  local: 'http://10.99.2.17:1886',
} as const;

export type SystemApiBaseUrlOption = keyof typeof SYSTEM_API_BASE_URLS;

const getStorageItem = (key: string): string | null => {
  return localStorage.getItem(key);
};

const setStorageItem = (key: string, value: string): void => {
  localStorage.setItem(key, value);
};

const removeStorageItem = (key: string): void => {
  localStorage.removeItem(key);
};

const parseStorageJson = <T>(key: string, isValid: (value: Partial<T>) => value is T): T | null => {
  try {
    const raw = getStorageItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<T>;
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const normalizeUrl = (url: string): string => {
  return url.trim().replace(/\/+$/, '');
};

const isSelectedUnidade = (id: string, nome: string): boolean => {
  return getStorageItem(STORAGE_KEYS.unidade) === id || getStorageItem(STORAGE_KEYS.unidadeNome) === nome;
};

/**
 * Função utilitária para obter a porta da API baseada na unidade selecionada.
 */
export const getApiPort = (): number => {
  return UNIDADE_API_PORTS.find(({ id, nome }) => isSelectedUnidade(id, nome))?.port ?? DEFAULT_API_PORT;
};

/**
 * Função utilitária para obter a URL base da API com a porta da unidade.
 */
export const getApiBaseUrl = (): string => {
  return `${LOCAL_API_HOST}:${getApiPort()}`;
};

/**
 * Retorna a URL base da API principal do sistema.
 * Pode ser alterada em tempo de execução usando setSystemApiBaseUrlOption.
 */
export const getSystemApiBaseUrl = (): string => {
  return getStorageItem(STORAGE_KEYS.systemApiBaseUrl) || SYSTEM_API_BASE_URLS.producao;
};

/**
 * Define uma URL personalizada para a API principal do sistema.
 */
export const setSystemApiBaseUrl = (url: string): void => {
  setStorageItem(STORAGE_KEYS.systemApiBaseUrl, normalizeUrl(url));
};

/**
 * Alterna entre as URLs conhecidas da API principal do sistema.
 */
export const setSystemApiBaseUrlOption = (option: SystemApiBaseUrlOption): void => {
  setSystemApiBaseUrl(SYSTEM_API_BASE_URLS[option]);
};

/**
 * Remove a URL personalizada e volta para a URL de produção.
 */
export const clearSystemApiBaseUrl = (): void => {
  removeStorageItem(STORAGE_KEYS.systemApiBaseUrl);
};

/**
 * Função utilitária para verificar se a unidade selecionada é Goioerê
 * @returns true se a unidade for Goioerê, false caso contrário
 */
export const isUnidadeGoioere = (): boolean => {
  return isSelectedUnidade('2', 'Unidade Goioerê');
};

/**
 * Função utilitária para obter o token de autenticação
 * @returns O token de autenticação ou null se não existir
 */
export const getAuthToken = (): string | null => {
  return getStorageItem(STORAGE_KEYS.authToken);
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
  return getStorageItem(STORAGE_KEYS.empresa);
};

/**
 * Função utilitária para obter a unidade do usuário (nome ou id)
 * @returns A unidade do usuário ou null se não existir
 */
export const getUnidade = (): string | null => {
  return getStorageItem(STORAGE_KEYS.unidadeNome) || getStorageItem(STORAGE_KEYS.unidade);
};

/** Contexto do secador no mesmo formato do item do Sidebar (empresa, unidade, secador) */
export interface SecadorContext {
  empresa: string;
  unidade: string;
  secador: string;
}

const isSecadorContext = (value: Partial<SecadorContext>): value is SecadorContext => {
  return Boolean(value.empresa && value.unidade && value.secador);
};

/**
 * Função utilitária para obter o secador selecionado (último usado na sidebar/página)
 * @returns O nome do secador selecionado ou null se não existir
 */
export const getSecador = (): string | null => {
  return getStorageItem(STORAGE_KEYS.secadorSelecionado);
};

/**
 * Retorna o contexto completo do secador (empresa, unidade, secador) no mesmo formato do Sidebar.
 * Usado para enviar os mesmos parâmetros que o item do Sidebar na API.
 */
export const getSecadorContext = (): SecadorContext | null => {
  return parseStorageJson<SecadorContext>(STORAGE_KEYS.secadorContext, isSecadorContext);
};

/**
 * Persiste o secador selecionado (usado ao navegar para um secador ou selecionar no sidebar)
 */
export const setSecador = (secador: string): void => {
  setStorageItem(STORAGE_KEYS.secadorSelecionado, secador);
};

/**
 * Persiste o contexto completo do secador (empresa, unidade, secador) no mesmo formato do Sidebar.
 * Assim o useOnlineSecador envia os mesmos parâmetros que o item do Sidebar.
 */
export const setSecadorContext = (context: SecadorContext): void => {
  setSecador(context.secador);
  setStorageItem(STORAGE_KEYS.secadorContext, JSON.stringify(context));
};

/** Contexto da termometria/silo no mesmo formato do Sidebar (empresa, unidade, silo) */
export interface TermometriaContext {
  empresa: string;
  unidade: string;
  silo: string;
}

const isTermometriaContext = (value: Partial<TermometriaContext>): value is TermometriaContext => {
  return Boolean(value.empresa && value.unidade && value.silo);
};

/**
 * Retorna o contexto completo da termometria (empresa, unidade, silo).
 * Usado quando o usuário seleciona um silo no Sidebar ou no card da home termometria.
 */
export const getTermometriaContext = (): TermometriaContext | null => {
  return parseStorageJson<TermometriaContext>(STORAGE_KEYS.termometriaContext, isTermometriaContext);
};

/**
 * Persiste o contexto da termometria (empresa, unidade, silo) ao selecionar silo no Sidebar ou no card.
 */
export const setTermometriaContext = (context: TermometriaContext): void => {
  setStorageItem(STORAGE_KEYS.termometriaContext, JSON.stringify(context));
};

