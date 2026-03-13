/**
 * Adaptador para comunicación TCP/IP con báscula
 */
import * as net from 'net';
import { ScaleAdapter, ScaleConfig } from './types';

export class TCPAdapter implements ScaleAdapter {
  private socket: net.Socket | null = null;
  private config: ScaleConfig;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  constructor(config: ScaleConfig) {
    this.config = config;
  }

  /**
   * Establece conexión TCP con la báscula
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    if (!this.config.host || !this.config.tcpPort) {
      throw new Error('Host y puerto TCP no configurados');
    }

    try {
      this.socket = new net.Socket();

      // Configurar timeout
      this.socket.setTimeout(this.config.timeout || 2000);

      await new Promise<void>((resolve, reject) => {
        this.socket!.connect(this.config.tcpPort!, this.config.host!, () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          console.log(`✅ Conexión TCP establecida en ${this.config.host}:${this.config.tcpPort}`);
          resolve();
        });

        this.socket!.on('error', (err) => {
          console.error('❌ Error en conexión TCP:', err);
          this.connected = false;
          reject(err);
        });

        this.socket!.on('timeout', () => {
          console.error('❌ Timeout en conexión TCP');
          this.connected = false;
          reject(new Error('Timeout al conectar con báscula TCP'));
        });

        this.socket!.on('close', () => {
          this.connected = false;
          console.log('🔌 Conexión TCP cerrada');
        });
      });
    } catch (error) {
      this.connected = false;
      throw new Error(`Error al conectar con báscula TCP: ${(error as Error).message}`);
    }
  }

  /**
   * Cierra la conexión TCP
   */
  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
      this.connected = false;
      console.log('✅ Conexión TCP cerrada');
    }
  }

  /**
   * Lee el peso actual desde la báscula
   */
  async readWeight(): Promise<number> {
    if (!this.connected || !this.socket) {
      // Intentar reconectar
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`🔄 Intento de reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        // Backoff exponencial: 1s, 2s, 4s
        const delay = Math.pow(2, this.reconnectAttempts - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        await this.connect();
        return this.readWeight();
      }
      
      throw new Error('No hay conexión con la báscula');
    }

    try {
      // Solicitar lectura
      this.socket.write('R\r\n'); // Comando común para solicitar lectura

      // Esperar respuesta con timeout
      const timeout = this.config.timeout || 2000;
      const weight = await this.readWithTimeout(timeout);

      return weight;
    } catch (error) {
      this.connected = false;
      throw error;
    }
  }

  /**
   * Lee datos del socket con timeout
   */
  private async readWithTimeout(timeout: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout al leer peso de la báscula'));
      }, timeout);

      const onData = (data: Buffer) => {
        clearTimeout(timer);
        this.socket!.removeListener('data', onData);

        try {
          const response = data.toString('utf-8').trim();
          const weight = this.parseWeight(response);
          resolve(weight);
        } catch (error) {
          reject(error);
        }
      };

      this.socket!.once('data', onData);

      this.socket!.once('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });

      this.socket!.once('timeout', () => {
        clearTimeout(timer);
        reject(new Error('Timeout al leer peso'));
      });
    });
  }

  /**
   * Parsea el peso de la respuesta de la báscula
   * Formato común: "ST,GS,+00450.50kg" o similar
   */
  private parseWeight(data: string): number {
    // Eliminar espacios en blanco
    const cleaned = data.trim();

    // Buscar patrón numérico con posible signo y decimales
    // Ejemplos: "+450.50", "450.50", "450.5 kg", "0450.50"
    const match = cleaned.match(/([+-]?\d+\.?\d*)/);

    if (!match) {
      throw new Error(`Formato de peso inválido: ${data}`);
    }

    const weight = parseFloat(match[1]);

    if (isNaN(weight)) {
      throw new Error(`No se pudo parsear el peso: ${data}`);
    }

    return weight;
  }

  /**
   * Verifica si hay conexión activa
   */
  isConnected(): boolean {
    return this.connected && this.socket !== null && !this.socket.destroyed;
  }
}
