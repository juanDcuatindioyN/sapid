'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  id: number;
  nombre: string;
  rol: 'administrador' | 'funcionario';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  /**
   * Verifica si hay una sesión activa
   */
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('sapid_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verificar token con el backend
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      // Token inválido o expirado
      localStorage.removeItem('sapid_token');
      localStorage.removeItem('sapid_user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inicia sesión
   */
  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Guardar token y usuario en localStorage
        localStorage.setItem('sapid_token', token);
        localStorage.setItem('sapid_user', JSON.stringify(userData));
        
        setUser(userData);
        
        return { success: true };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión',
      };
    }
  };

  /**
   * Cierra sesión
   */
  const logout = async () => {
    try {
      const token = localStorage.getItem('sapid_token');
      if (token) {
        await api.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar estado local
      localStorage.removeItem('sapid_token');
      localStorage.removeItem('sapid_user');
      setUser(null);
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
