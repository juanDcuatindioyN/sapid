/**
 * Servicio orquestador para integración con báscula
 */
import { ScaleAdapter, ScaleConfig, WeightReading, ConnectionStatus } from './types';
import { RS232Adapter } from './RS232Adapter';
import { TCPAdapter } from './TCPAdapter';
import { ScaleParser } from './ScaleParser';

class ScaleService {
  private adapter: ScaleAdapter | null = null;
  private parser: ScaleParser;
  private config: ScaleConfig;
  private lastRead?: Date;

  constructor() {
    // Cargar configuración desde variables de entorno
    this.config = this.loadConfig();
    this.parser = new ScaleParser(this.config.manufacturer);
  }

  /**
   * Carga la configuración desde variables de entorno
   */
  private loadConfig(): ScaleConfig {
    const protocol = (process.env.SCALE_PROTOCOL || 'RS232') as 'RS232' | 'TCP';

    const config: ScaleConfig = {
      protocol,
      timeout: parseInt(process.env.SCALE_TIMEOUT || '2000'),
      manufacturer: process.env.SCALE_MANUFACTURER || 'generic',
    };

    if (protocol === 'RS232') {
      config.port = process.env.SCALE_PORT || 'COM3';
      config.baudRate = parseInt(process.env.SCALE_BAUD_RATE || '9600');
      config.dataBits = parseInt(process.env.SCALE_DATA_BITS || '8') as 7 | 8;
      config.stopBits = parseInt(process.env.SCALE_STOP_BITS || '1') as 1 | 2;
      config.parity = (process.env.SCALE_PARITY || 'none') as 'none' | 'even' | 'odd';
    } else {
      config.host = process.env.SCALE_HOST || '192.168.1.100';
      config.tcpPort = parseInt(process.env.SCALE_TCP_PORT || '8080');
    }

    return config;
  }

  /**
   * Inicializa el adaptador según el protocolo configurado
   */
  private async initializeAdapter(): Promise<void> {
    if (this.adapter) {
      return;
    }

    if (this.config.protocol === 'RS232') {
      this.adapter = new RS232Adapter(this.config);
    } else {
      this.adapter = new TCPAdapter(this.config);
    }

    await this.adapter.connect();
  }

  /**
   * Captura el peso actual desde la báscula
   */
  async captureWeight(): Promise<WeightReading> {
    try {
      // Asegurar que el adaptador esté inicializado
      await this.initializeAdapter();

      if (!this.adapter) {
        throw new Error('Adaptador de báscula no inicializado');
      }

      // Leer peso desde el adaptador
      const rawWeight = await this.adapter.readWeight();

      // Parsear y formatear el peso
      const weight = this.parser.format(rawWeight);

      // Validar que el peso sea positivo y no cero
      if (!this.parser.validatePositive(weight)) {
        return {
          value: weight,
          timestamp: new Date(),
          valid: false,
          error: 'Peso inválido. Asegúrese de que el animal esté sobre la báscula',
        };
      }

      // Validar rango (10-2000 kg)
      if (!this.parser.validateRange(weight)) {
        return {
          value: weight,
          timestamp: new Date(),
          valid: false,
          error: `Peso fuera de rango válido (10-2000 kg): ${weight} kg`,
        };
      }

      // Actualizar última lectura
      this.lastRead = new Date();

      // Logging
      console.log(`✅ Peso capturado: ${weight} kg`);

      return {
        value: weight,
        timestamp: this.lastRead,
        valid: true,
      };
    } catch (error) {
      console.error('❌ Error al capturar peso:', error);

      return {
        value: 0,
        timestamp: new Date(),
        valid: false,
        error: `Error de conexión con la báscula: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Obtiene el estado de conexión con la báscula
   */
  getConnectionStatus(): ConnectionStatus {
    return {
      connected: this.adapter?.isConnected() || false,
      protocol: this.config.protocol,
      lastRead: this.lastRead,
    };
  }

  /**
   * Desconecta la báscula
   */
  async disconnect(): Promise<void> {
    if (this.adapter) {
      await this.adapter.disconnect();
      this.adapter = null;
    }
  }

  /**
   * Reconecta la báscula
   */
  async reconnect(): Promise<void> {
    await this.disconnect();
    await this.initializeAdapter();
  }
}

export default new ScaleService();
