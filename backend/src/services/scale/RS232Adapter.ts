/**
 * Adaptador para comunicación serial RS232 con báscula
 */
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { ScaleAdapter, ScaleConfig } from './types';

export class RS232Adapter implements ScaleAdapter {
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private config: ScaleConfig;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;

  constructor(config: ScaleConfig) {
    this.config = config;
  }

  /**
   * Establece conexión con el puerto serial
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    if (!this.config.port) {
      throw new Error('Puerto serial no configurado');
    }

    try {
      this.port = new SerialPort({
        path: this.config.port,
        baudRate: this.config.baudRate || 9600,
        dataBits: this.config.dataBits || 8,
        stopBits: this.config.stopBits || 1,
        parity: this.config.parity || 'none',
      });

      // Parser para leer líneas completas
      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      // Esperar a que el puerto esté abierto
      await new Promise<void>((resolve, reject) => {
        this.port!.on('open', () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          console.log(`✅ Conexión RS232 establecida en ${this.config.port}`);
          resolve();
        });

        this.port!.on('error', (err) => {
          console.error('❌ Error en puerto serial:', err);
          reject(err);
        });
      });
    } catch (error) {
      this.connected = false;
      throw new Error(`Error al conectar con puerto serial: ${(error as Error).message}`);
    }
  }

  /**
   * Cierra la conexión con el puerto serial
   */
  async disconnect(): Promise<void> {
    if (this.port && this.port.isOpen) {
      await new Promise<void>((resolve, reject) => {
        this.port!.close((err) => {
          if (err) {
            reject(err);
          } else {
            this.connected = false;
            this.port = null;
            this.parser = null;
            console.log('✅ Conexión RS232 cerrada');
            resolve();
          }
        });
      });
    }
  }

  /**
   * Lee el peso actual desde la báscula
   */
  async readWeight(): Promise<number> {
    if (!this.connected || !this.port || !this.parser) {
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
      // Solicitar lectura (algunos modelos requieren comando)
      // Para básculas que envían datos automáticamente, esto puede omitirse
      this.port.write('R\r\n'); // Comando común para solicitar lectura

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
   * Lee datos del parser con timeout
   */
  private async readWithTimeout(timeout: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout al leer peso de la báscula'));
      }, timeout);

      const onData = (data: string) => {
        clearTimeout(timer);
        this.parser!.removeListener('data', onData);

        try {
          // Parsear el peso de la respuesta
          const weight = this.parseWeight(data);
          resolve(weight);
        } catch (error) {
          reject(error);
        }
      };

      this.parser!.once('data', onData);
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
    return this.connected && this.port !== null && this.port.isOpen;
  }
}
