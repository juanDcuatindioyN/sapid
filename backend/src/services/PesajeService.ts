import { v4 as uuidv4 } from 'uuid';
import PesajeRepository from '../repositories/PesajeRepository';
import ValidationService from './ValidationService';
import CalculationService from './CalculationService';
import TicketGenerator from './ticket/TicketGenerator';

interface PesajeMetadata {
  codigo: string;
  especie: 'bovino' | 'porcino';
  sexo: 'H' | 'M';
  tipo_pesaje: 'medios' | 'lotes';
}

interface WeightCapture {
  peso: number;
  fecha: Date;
}

interface PesajeSession {
  id: string;
  metadata: PesajeMetadata;
  captures: WeightCapture[];
  total: number;
  createdAt: Date;
}

interface PesajeFilters {
  startDate?: Date;
  endDate?: Date;
  usuario_id?: number;
  especie?: 'bovino' | 'porcino';
  limit?: number;
  offset?: number;
}

class PesajeService {
  private activeSessions: Map<string, PesajeSession> = new Map();

  /**
   * Create a new pesaje session in memory
   */
  createSession(metadata: PesajeMetadata): { sessionId: string; session: PesajeSession } {
    // Validate metadata
    const validation = ValidationService.validateMetadata(metadata);
    if (!validation.isValid) {
      throw new Error(`Metadatos inválidos: ${validation.errors.join(', ')}`);
    }

    // Generate unique session ID
    const sessionId = uuidv4();

    // Create session
    const session: PesajeSession = {
      id: sessionId,
      metadata,
      captures: [],
      total: 0,
      createdAt: new Date(),
    };

    // Store in memory
    this.activeSessions.set(sessionId, session);

    return { sessionId, session };
  }

  /**
   * Add weight capture to session
   */
  addWeightCapture(sessionId: string, peso: number): PesajeSession {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    // Validate weight
    if (peso <= 0) {
      throw new Error('El peso debe ser mayor a cero');
    }

    // Add capture
    const capture: WeightCapture = {
      peso,
      fecha: new Date(),
    };
    session.captures.push(capture);

    // Update total
    session.total = CalculationService.addCaptureToTotal(session.total, peso);

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): PesajeSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Finalize session and persist to database
   */
  async finalizeSession(sessionId: string, usuario_id: number): Promise<any> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    // Validate session has at least one capture
    if (session.captures.length === 0) {
      throw new Error('La sesión debe tener al menos una captura de peso');
    }

    // Prepare pesaje data
    const pesajeData = {
      codigo: session.metadata.codigo,
      especie: session.metadata.especie,
      sexo: session.metadata.sexo,
      tipo_pesaje: session.metadata.tipo_pesaje,
      peso_total: session.total,
      usuario_id,
    };

    // Prepare details data
    const detalles = session.captures.map((capture) => ({
      peso: capture.peso,
    }));

    // Persist to database
    const pesaje = await PesajeRepository.createWithDetails(pesajeData, detalles);

    // Remove session from memory
    this.activeSessions.delete(sessionId);

    // Trigger print (non-blocking, errors should not affect database save)
    TicketGenerator.generateAndPrint(pesaje.id).catch((error) => {
      console.error('⚠️ Failed to print ticket after save:', error);
    });

    return pesaje;
  }

  /**
   * Get history with filters
   */
  async getHistory(filters: PesajeFilters = {}): Promise<{ rows: any[]; count: number }> {
    return await PesajeRepository.findAll(filters);
  }

  /**
   * Get pesaje by ID
   */
  async getPesajeById(id: number, includeDetails = false): Promise<any> {
    return await PesajeRepository.findById(id, includeDetails);
  }

  /**
   * Get all active sessions (for debugging/monitoring)
   */
  getActiveSessions(): PesajeSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Clear session (cancel without saving)
   */
  clearSession(sessionId: string): boolean {
    return this.activeSessions.delete(sessionId);
  }
}

export default new PesajeService();
