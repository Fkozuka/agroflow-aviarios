import { useState } from 'react';
import axios from 'axios';

// POST PARA RECEBER STATUS AUTENTICAÇÃO
interface dadosAutenticacao {
    status: boolean;
    token: string;
}

/**
 * @param dataLogin 
 * @param dataPassword 
 * @returns 
 */
export const useLogin = () => {
    // Estados
    const [dadosAutenticacao, setDadosAutenticacao] = useState<dadosAutenticacao[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    // Função para autenticar login
    const autenticarLogin = async (dataLogin: string, dataPassword: string) => {
      setLoading(true);
      setError(null);
      
      try {
        // Buscar dados de autenticação
        const response = await axios.post(`https://api-system.agroflowsystems.com.br/login`, {
          username: dataLogin,
          password: dataPassword
        });
        
        if (Array.isArray(response.data)) {
          setDadosAutenticacao(response.data);
          
          // Salva o token no localStorage se status e token estiverem presentes
          if (response.data.length > 0) {
            const { status, token } = response.data[0];
            if (status && token) {
              localStorage.setItem("auth_token", token);
            }
          }
          
          return response.data; // Retorna os dados para verificação imediata
        } else {
          setError('Formato de dados inválido');
          return null;
        }
      } catch (err) {
        setError('Erro ao autenticar usuário');
        return null;
      } finally {
        setLoading(false);
      }
    };
  
    return {
      dadosAutenticacao,
      loading,
      error,
      autenticarLogin
    };
  };