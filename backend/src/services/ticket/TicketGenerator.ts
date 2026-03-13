import TicketTemplate from './TicketTemplate';
import PrinterService from './PrinterService';
import { PesajeService } from '../index';

interface TicketData {
  id: number;
  codigo: string;
  especie: 'bovino' | 'porcino';
  sexo: 'H' | 'M';
  tipo_pesaje: 'medios' | 'lotes';
  peso_total: number;
  fecha: Date;
  usuario: {
    nombre: string;
    usuario: string;
  };
  detalles?: Array<{
    peso: number;
    fecha: Date;
  }>;
}

class TicketGenerator {
  /**
   * Generate ticket content from pesaje data
   */
  generateTicket(pesaje: TicketData): string {
    return TicketTemplate.generateTicket(pesaje);
  }

  /**
   * Print ticket
   * Note: Errors in printing should not block database operations
   */
  async print(ticket: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if printer is available
      if (!PrinterService.isAvailable()) {
        console.warn('⚠️ Printer not available, skipping print');
        return {
          success: false,
          error: 'Impresora no disponible',
        };
      }

      // Print ticket
      await PrinterService.print(ticket);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Print failed:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al imprimir',
      };
    }
  }

  /**
   * Generate and print ticket for a pesaje
   */
  async generateAndPrint(pesajeId: number): Promise<{ success: boolean; ticket: string; error?: string }> {
    try {
      // Get pesaje data with details
      const pesaje = await PesajeService.getPesajeById(pesajeId, true);

      if (!pesaje) {
        throw new Error('Pesaje no encontrado');
      }

      // Generate ticket
      const ticket = this.generateTicket(pesaje);

      // Print ticket (non-blocking)
      const printResult = await this.print(ticket);

      return {
        success: printResult.success,
        ticket,
        error: printResult.error,
      };
    } catch (error: any) {
      console.error('❌ Failed to generate and print ticket:', error);
      return {
        success: false,
        ticket: '',
        error: error.message || 'Error al generar ticket',
      };
    }
  }

  /**
   * Get printer status
   */
  getPrinterStatus(): { available: boolean; type: string; interface: string } {
    return PrinterService.getStatus();
  }

  /**
   * Test printer connection
   */
  async testPrinter(): Promise<boolean> {
    return await PrinterService.testConnection();
  }
}

export default new TicketGenerator();
