import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api';

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
};

type AuthContextType = {
  token: string | null;
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('token');
        const savedUser = await SecureStore.getItemAsync('usuario');

        if (savedToken && savedUser) {
          const response = await fetch(`${API_BASE_URL}/auth/perfil`, {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          if (response.ok) {
            setUsuario(JSON.parse(savedUser));
            setToken(savedToken);
          } else if (response.status === 401) {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('usuario');
          }
        }
      } catch (error) {
        console.error('Error al recuperar sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Error al iniciar sesión.'
      );
    }

    await SecureStore.setItemAsync('token', data.access_token);
    await SecureStore.setItemAsync(
      'usuario',
      JSON.stringify(data.usuario)
    );

    setUsuario(data.usuario);
    setToken(data.access_token);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('usuario');

    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, usuario, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }

  return context;
}