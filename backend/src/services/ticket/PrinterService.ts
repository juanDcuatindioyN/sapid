import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';

interface PrinterConfig {
  type: 'network' | 'usb' | 'serial';
  interface: string;
  width?: number;
  characterSet?: string;
  removeSpecialCharacters?: boolean;
}

class PrinterService {
  private printer: ThermalPrinter | null = null;
  private config: PrinterConfig;
  private printQueue: Array<{ content: string; resolve: Function; reject: Function }> = [];
  private isProcessing = false;

  constructor() {
    // Default configuration from environment variables
    this.config = {
      type: (process.env.PRINTER_TYPE as 'network' | 'usb' | 'serial') || 'network',
      interface: process.env.PRINTER_INTERFACE || '192.168.1.100',
      width: parseInt(process.env.PRINTER_WIDTH || '48'),
      characterSet: process.env.PRINTER_ENCODING || 'PC437_USA',
      removeSpecialCharacters: true,
    };

    this.initializePrinter();
  }

  /**
   * Initialize thermal printer
   */
  private initializePrinter(): void {
    try {
      let printerType: PrinterTypes;

      switch (this.config.type) {
        case 'network':
          printerType = PrinterTypes.EPSON;
          break;
        case 'usb':
          printerType = PrinterTypes.EPSON;
          break;
        case 'serial':
          printerType = PrinterTypes.EPSON;
          break;
        default:
          printerType = PrinterTypes.EPSON;
      }

      this.printer = new ThermalPrinter({
        type: printerType,
        interface: this.config.interface,
        width: this.config.width,
        removeSpecialCharacters: this.config.removeSpecialCharacters,
      });

      console.log('✅ Printer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize printer:', error);
      this.printer = null;
    }
  }

  /**
   * Check if printer is available
   */
  isAvailable(): boolean {
    return this.printer !== null;
  }

  /**
   * Print text content
   */
  async print(content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Add to queue
      this.printQueue.push({ content, resolve, reject });

      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process print queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.printQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.printQueue.length > 0) {
      const job = this.printQueue.shift();
      if (!job) continue;

      try {
        await this.executePrint(job.content);
        job.resolve();
      } catch (error) {
        job.reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Execute actual print operation
   */
  private async executePrint(content: string): Promise<void> {
    if (!this.printer) {
      throw new Error('Impresora no disponible');
    }

    try {
      // Clear any previous content
      this.printer.clear();

      // Add content
      this.printer.println(content);

      // Cut paper
      this.printer.cut();

      // Execute print
      await this.printer.execute();

      console.log('✅ Ticket printed successfully');
    } catch (error: any) {
      console.error('❌ Print error:', error);

      // Check for specific errors
      if (error.message?.includes('ECONNREFUSED')) {
        throw new Error('No se puede conectar con la impresora. Verifique la conexión.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Tiempo de espera agotado al imprimir. Verifique que la impresora esté encendida.');
      } else if (error.message?.includes('paper')) {
        throw new Error('Sin papel en la impresora.');
      } else {
        throw new Error(`Error de impresión: ${error.message}`);
      }
    }
  }

  /**
   * Test printer connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.printer) {
      return false;
    }

    try {
      this.printer.clear();
      this.printer.println('Test de conexion');
      this.printer.println('Impresora funcionando correctamente');
      this.printer.cut();
      await this.printer.execute();
      return true;
    } catch (error) {
      console.error('❌ Printer test failed:', error);
      return false;
    }
  }

  /**
   * Get printer status
   */
  getStatus(): { available: boolean; type: string; interface: string } {
    return {
      available: this.isAvailable(),
      type: this.config.type,
      interface: this.config.interface,
    };
  }
}

export default new PrinterService();
