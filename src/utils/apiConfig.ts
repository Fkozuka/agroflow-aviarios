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

