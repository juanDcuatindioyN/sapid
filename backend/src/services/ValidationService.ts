interface PesajeMetadata {
  codigo?: string;
  especie?: 'bovino' | 'porcino';
  sexo?: 'H' | 'M';
  tipo_pesaje?: 'medios' | 'lotes';
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class ValidationService {
  /**
   * Validate codigo field
   */
  validateCodigo(codigo: string | undefined): ValidationResult {
    const errors: string[] = [];

    if (!codigo) {
      errors.push('Código es requerido');
    } else if (codigo.trim().length === 0) {
      errors.push('Código no puede estar vacío');
    } else if (codigo.length > 50) {
      errors.push('Código no puede exceder 50 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate especie field
   */
  validateEspecie(especie: string | undefined): ValidationResult {
    const errors: string[] = [];
    const validEspecies = ['bovino', 'porcino'];

    if (!especie) {
      errors.push('Especie es requerida');
    } else if (!validEspecies.includes(especie)) {
      errors.push('Especie debe ser "bovino" o "porcino"');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate sexo field
   */
  validateSexo(sexo: string | undefined): ValidationResult {
    const errors: string[] = [];
    const validSexos = ['H', 'M'];

    if (!sexo) {
      errors.push('Sexo es requerido');
    } else if (!validSexos.includes(sexo)) {
      errors.push('Sexo debe ser "H" (Hembra) o "M" (Macho)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate tipo_pesaje field
   */
  validateTipoPesaje(tipo_pesaje: string | undefined): ValidationResult {
    const errors: string[] = [];
    const validTipos = ['medios', 'lotes'];

    if (!tipo_pesaje) {
      errors.push('Tipo de pesaje es requerido');
    } else if (!validTipos.includes(tipo_pesaje)) {
      errors.push('Tipo de pesaje debe ser "medios" o "lotes"');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate complete metadata
   */
  validateMetadata(metadata: PesajeMetadata): ValidationResult {
    const allErrors: string[] = [];

    const codigoResult = this.validateCodigo(metadata.codigo);
    const especieResult = this.validateEspecie(metadata.especie);
    const sexoResult = this.validateSexo(metadata.sexo);
    const tipoPesajeResult = this.validateTipoPesaje(metadata.tipo_pesaje);

    allErrors.push(...codigoResult.errors);
    allErrors.push(...especieResult.errors);
    allErrors.push(...sexoResult.errors);
    allErrors.push(...tipoPesajeResult.errors);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * Check if metadata is complete (all fields present)
   */
  isMetadataComplete(metadata: PesajeMetadata): boolean {
    return !!(metadata.codigo && metadata.especie && metadata.sexo && metadata.tipo_pesaje);
  }
}

export default new ValidationService();
