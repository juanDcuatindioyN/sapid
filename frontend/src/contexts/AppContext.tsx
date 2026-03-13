'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface WeightCapture {
  peso: number;
  fecha: string;
}

interface PesajeSession {
  id: string;
  codigo: string;
  especie: 'bovino' | 'porcino' | '';
  sexo: 'H' | 'M' | '';
  tipo_pesaje: 'medios' | 'lotes' | '';
  capturas: WeightCapture[];
  peso_total: number;
}

interface AppContextType {
  currentSession: PesajeSession | null;
  pendingSyncs: number;
  isOnline: boolean;
  createSession: (metadata: Partial<PesajeSession>) => void;
  addCapture: (peso: number) => void;
  clearSession: () => void;
  updateMetadata: (metadata: Partial<PesajeSession>) => void;
  setPendingSyncs: (count: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState<PesajeSession | null>(null);
  const [pendingSyncs, setPendingSyncsState] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  /**
   * Crea una nueva sesión de pesaje
   */
  const createSession = (metadata: Partial<PesajeSession>) => {
    const newSession: PesajeSession = {
      id: uuidv4(),
      codigo: metadata.codigo || '',
      especie: metadata.especie || '',
      sexo: metadata.sexo || '',
      tipo_pesaje: metadata.tipo_pesaje || '',
      capturas: [],
      peso_total: 0,
    };
    setCurrentSession(newSession);
  };

  /**
   * Agrega una captura de peso a la sesión actual
   */
  const addCapture = (peso: number) => {
    if (!currentSession) {
      throw new Error('No hay sesión activa');
    }

    const newCapture: WeightCapture = {
      peso,
      fecha: new Date().toISOString(),
    };

    const updatedCapturas = [...currentSession.capturas, newCapture];
    const peso_total = updatedCapturas.reduce((sum, c) => sum + c.peso, 0);

    setCurrentSession({
      ...currentSession,
      capturas: updatedCapturas,
      peso_total: Math.round(peso_total * 100) / 100, // Redondear a 2 decimales
    });
  };

  /**
   * Limpia la sesión actual
   */
  const clearSession = () => {
    setCurrentSession(null);
  };

  /**
   * Actualiza los metadatos de la sesión actual
   */
  const updateMetadata = (metadata: Partial<PesajeSession>) => {
    if (!currentSession) {
      throw new Error('No hay sesión activa');
    }

    setCurrentSession({
      ...currentSession,
      ...metadata,
    });
  };

  /**
   * Actualiza el contador de sincronizaciones pendientes
   */
  const setPendingSyncs = (count: number) => {
    setPendingSyncsState(count);
  };

  /**
   * Detecta cambios en la conectividad
   */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Establecer estado inicial
    setIsOnline(navigator.onLine);

    // Escuchar eventos de conectividad
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentSession,
        pendingSyncs,
        isOnline,
        createSession,
        addCapture,
        clearSession,
        updateMetadata,
        setPendingSyncs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook para usar el contexto de aplicación
 */
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}
