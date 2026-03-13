interface WeightCapture {
  peso: number;
  fecha?: Date;
}

class CalculationService {
  /**
   * Calculate total weight from array of captures
   * Rounds to 2 decimal places
   */
  calculateTotal(captures: WeightCapture[]): number {
    if (!captures || captures.length === 0) {
      return 0;
    }

    const sum = captures.reduce((total, capture) => total + capture.peso, 0);
    
    // Round to 2 decimal places
    return Math.round(sum * 100) / 100;
  }

  /**
   * Validate numerical precision (tolerance 0.01)
   */
  validatePrecision(value: number, expected: number, tolerance = 0.01): boolean {
    return Math.abs(value - expected) <= tolerance;
  }

  /**
   * Round to 2 decimal places
   */
  roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Add new capture to existing total
   */
  addCaptureToTotal(currentTotal: number, newCapture: number): number {
    const sum = currentTotal + newCapture;
    return this.roundToTwoDecimals(sum);
  }
}

export default new CalculationService();
