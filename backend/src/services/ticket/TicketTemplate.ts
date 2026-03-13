interface PesajeData {
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

class TicketTemplate {
  private readonly WIDTH = 48; // Characters per line for 80mm thermal printer
  private readonly FRIGORIFCO_NAME = 'FRIGORIFICO SAPID';

  /**
   * Center text within the line width
   */
  private centerText(text: string): string {
    const padding = Math.max(0, Math.floor((this.WIDTH - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  /**
   * Create a separator line
   */
  private separator(): string {
    return '='.repeat(this.WIDTH);
  }

  /**
   * Create a dashed line
   */
  private dashedLine(): string {
    return '-'.repeat(this.WIDTH);
  }

  /**
   * Format number with 2 decimals
   */
  private formatNumber(value: number): string {
    return value.toFixed(2);
  }

  /**
   * Format date to readable string
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * Pad text to align left and right
   */
  private padLine(left: string, right: string): string {
    const totalPadding = this.WIDTH - left.length - right.length;
    return left + ' '.repeat(Math.max(0, totalPadding)) + right;
  }

  /**
   * Generate ticket for "Factura de Medios"
   */
  generateMediosTicket(pesaje: PesajeData): string {
    const lines: string[] = [];

    // Header
    lines.push(this.separator());
    lines.push(this.centerText(this.FRIGORIFCO_NAME));
    lines.push(this.centerText('FACTURA DE MEDIOS'));
    lines.push(this.separator());
    lines.push('');

    // Date and ID
    lines.push(this.padLine('Fecha:', this.formatDate(pesaje.fecha)));
    lines.push(this.padLine('ID Pesaje:', `#${pesaje.id}`));
    lines.push('');

    // Metadata
    lines.push(this.dashedLine());
    lines.push('DATOS DEL PESAJE');
    lines.push(this.dashedLine());
    lines.push(this.padLine('Codigo:', pesaje.codigo));
    lines.push(this.padLine('Especie:', pesaje.especie.toUpperCase()));
    lines.push(this.padLine('Sexo:', pesaje.sexo === 'H' ? 'HEMBRA' : 'MACHO'));
    lines.push(this.padLine('Tipo:', 'MEDIOS'));
    lines.push('');

    // Weight details
    lines.push(this.dashedLine());
    lines.push('DETALLE DE PESOS');
    lines.push(this.dashedLine());
    
    if (pesaje.detalles && pesaje.detalles.length > 0) {
      pesaje.detalles.forEach((detalle, index) => {
        lines.push(this.padLine(`Peso ${index + 1}:`, `${this.formatNumber(detalle.peso)} kg`));
      });
    }
    
    lines.push('');

    // Total
    lines.push(this.separator());
    lines.push(this.padLine('PESO TOTAL:', `${this.formatNumber(pesaje.peso_total)} kg`));
    lines.push(this.separator());
    lines.push('');

    // Operator
    lines.push(this.padLine('Operador:', pesaje.usuario.nombre));
    lines.push(this.padLine('Usuario:', pesaje.usuario.usuario));
    lines.push('');

    // Footer
    lines.push(this.centerText('Gracias por su preferencia'));
    lines.push(this.separator());
    lines.push('');
    lines.push('');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate ticket for "Factura de Lotes"
   */
  generateLotesTicket(pesaje: PesajeData): string {
    const lines: string[] = [];

    // Header
    lines.push(this.separator());
    lines.push(this.centerText(this.FRIGORIFCO_NAME));
    lines.push(this.centerText('FACTURA DE LOTES'));
    lines.push(this.separator());
    lines.push('');

    // Date and ID
    lines.push(this.padLine('Fecha:', this.formatDate(pesaje.fecha)));
    lines.push(this.padLine('ID Pesaje:', `#${pesaje.id}`));
    lines.push('');

    // Metadata
    lines.push(this.dashedLine());
    lines.push('DATOS DEL LOTE');
    lines.push(this.dashedLine());
    lines.push(this.padLine('Codigo:', pesaje.codigo));
    lines.push(this.padLine('Especie:', pesaje.especie.toUpperCase()));
    lines.push(this.padLine('Sexo:', pesaje.sexo === 'H' ? 'HEMBRA' : 'MACHO'));
    lines.push(this.padLine('Tipo:', 'LOTES'));
    lines.push('');

    // Weight details
    lines.push(this.dashedLine());
    lines.push('DETALLE DE CAPTURAS');
    lines.push(this.dashedLine());
    
    if (pesaje.detalles && pesaje.detalles.length > 0) {
      lines.push(this.padLine('Captura', 'Peso (kg)'));
      lines.push(this.dashedLine());
      pesaje.detalles.forEach((detalle, index) => {
        lines.push(this.padLine(`#${index + 1}`, this.formatNumber(detalle.peso)));
      });
      lines.push(this.dashedLine());
      lines.push(this.padLine('Total capturas:', `${pesaje.detalles.length}`));
    }
    
    lines.push('');

    // Total
    lines.push(this.separator());
    lines.push(this.padLine('PESO TOTAL:', `${this.formatNumber(pesaje.peso_total)} kg`));
    lines.push(this.separator());
    lines.push('');

    // Operator
    lines.push(this.padLine('Operador:', pesaje.usuario.nombre));
    lines.push(this.padLine('Usuario:', pesaje.usuario.usuario));
    lines.push('');

    // Footer
    lines.push(this.centerText('Gracias por su preferencia'));
    lines.push(this.separator());
    lines.push('');
    lines.push('');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate ticket based on tipo_pesaje
   */
  generateTicket(pesaje: PesajeData): string {
    if (pesaje.tipo_pesaje === 'medios') {
      return this.generateMediosTicket(pesaje);
    } else {
      return this.generateLotesTicket(pesaje);
    }
  }
}

export default new TicketTemplate();
