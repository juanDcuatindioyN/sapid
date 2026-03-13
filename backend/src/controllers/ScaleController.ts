/**
 * Controlador para endpoints de báscula
 */
import { Request, Response } from 'express';
import ScaleService from '../services/scale/ScaleService';

class ScaleController {
  /**
   * GET /api/scale/status
   * Obtiene el estado de conexión con la báscula
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = ScaleService.getConnectionStatus();

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error('Error al obtener estado de báscula:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SCALE_STATUS_ERROR',
          message: 'Error al obtener estado de la báscula',
          details: (error as Error).message,
        },
      });
    }
  }

  /**
   * POST /api/scale/capture
   * Captura el peso actual desde la báscula
   */
  async captureWeight(req: Request, res: Response): Promise<void> {
    try {
      const reading = await ScaleService.captureWeight();

      if (!reading.valid) {
        res.status(400).json({
          success: false,
          error: {
            code: reading.value === 0 ? 'SCALE_CONNECTION_ERROR' : 'SCALE_INVALID_READING',
            message: reading.error || 'Error al capturar peso',
            timestamp: reading.timestamp,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          weight: reading.value,
          timestamp: reading.timestamp,
        },
      });
    } catch (error) {
      console.error('Error al capturar peso:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SCALE_CAPTURE_ERROR',
          message: 'Error al capturar peso de la báscula',
          details: (error as Error).message,
        },
      });
    }
  }

  /**
   * POST /api/scale/reconnect
   * Reconecta con la báscula
   */
  async reconnect(req: Request, res: Response): Promise<void> {
    try {
      await ScaleService.reconnect();

      res.json({
        success: true,
        message: 'Reconexión exitosa',
      });
    } catch (error) {
      console.error('Error al reconectar báscula:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SCALE_RECONNECT_ERROR',
          message: 'Error al reconectar con la báscula',
          details: (error as Error).message,
        },
      });
    }
  }
}

export default new ScaleController();
