/**
 * Tipos y configuraciones para el módulo de integración con báscula
 */

export interface ScaleConfig {
  protocol: 'RS232' | 'TCP';
  // Para RS232
  port?: string; // ej: '/dev/ttyUSB0' o 'COM3'
  baudRate?: number; // ej: 9600
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  // Para TCP
  host?: string;
  tcpPort?: number;
  // Común
  timeout?: number; // milisegundos
  manufacturer?: string; // para parser específico
}

export interface WeightReading {
  value: number; // en kilogramos
  timestamp: Date;
  valid: boolean;
  error?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  protocol: 'RS232' | 'TCP';
  lastRead?: Date;
}

/**
 * Interfaz abstracta para diferentes protocolos de comunicación con báscula
 */
export interface ScaleAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  readWeight(): Promise<number>;
  isConnected(): boolean;
}
