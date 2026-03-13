/**
 * Parser para diferentes formatos de respuesta de básculas
 */

export class ScaleParser {
  private manufacturer: string;

  constructor(manufacturer: string = 'generic') {
    this.manufacturer = manufacturer.toLowerCase();
  }

  /**
   * Parsea el peso de la respuesta según el fabricante
   */
  parse(data: string): number {
    const cleaned = data.trim();

    switch (this.manufacturer) {
      case 'generic':
        return this.parseGeneric(cleaned);
      case 'toledo':
        return this.parseToledo(cleaned);
      case 'mettler':
        return this.parseMettler(cleaned);
      default:
        return this.parseGeneric(cleaned);
    }
  }

  /**
   * Parser genérico que busca el primer número en la respuesta
   * Formato esperado: cualquier string que contenga un número
   * Ejemplos: "+450.50", "450.50 kg", "ST,GS,+00450.50kg", "Weight: 450.5"
   */
  private parseGeneric(data: string): number {
    // Buscar patrón numérico con posible signo y decimales
    const match = data.match(/([+-]?\d+\.?\d*)/);

    if (!match) {
      throw new Error(`Formato de peso inválido: ${data}`);
    }

    const weight = parseFloat(match[1]);

    if (isNaN(weight)) {
      throw new Error(`No se pudo parsear el peso: ${data}`);
    }

    // Redondear a 2 decimales
    return Math.round(weight * 100) / 100;
  }

  /**
   * Parser para básculas Toledo
   * Formato típico: "ST,GS,+00450.50kg"
   */
  private parseToledo(data: string): number {
    // Formato: ST,GS,+00450.50kg
    const match = data.match(/ST,GS,([+-]?\d+\.?\d*)/i);

    if (!match) {
      // Intentar parser genérico como fallback
      return this.parseGeneric(data);
    }

    const weight = parseFloat(match[1]);

    if (isNaN(weight)) {
      throw new Error(`No se pudo parsear el peso Toledo: ${data}`);
    }

    return Math.round(weight * 100) / 100;
  }

  /**
   * Parser para básculas Mettler Toledo
   * Formato típico: "S S +00450.50 kg"
   */
  private parseMettler(data: string): number {
    // Formato: S S +00450.50 kg
    const match = data.match(/S\s+S\s+([+-]?\d+\.?\d*)/i);

    if (!match) {
      // Intentar parser genérico como fallback
      return this.parseGeneric(data);
    }

    const weight = parseFloat(match[1]);

    if (isNaN(weight)) {
      throw new Error(`No se pudo parsear el peso Mettler: ${data}`);
    }

    return Math.round(weight * 100) / 100;
  }

  /**
   * Valida que el peso esté en el rango válido (10-2000 kg)
   */
  validateRange(weight: number): boolean {
    return weight >= 10 && weight <= 2000;
  }

  /**
   * Valida que el peso sea positivo y no cero
   */
  validatePositive(weight: number): boolean {
    return weight > 0;
  }

  /**
   * Formatea el peso a 2 decimales
   */
  format(weight: number): number {
    return Math.round(weight * 100) / 100;
  }
}
