import { Router, Request, Response } from 'express';
import { param, validationResult } from 'express-validator';
import TicketGenerator from '../services/ticket/TicketGenerator';
import { jwtMiddleware } from '../middleware';

const router = Router();

// Apply JWT middleware to all routes
router.use(jwtMiddleware);

/**
 * POST /api/ticket/print/:pesajeId
 * Reprint ticket for existing pesaje
 */
router.post(
  '/print/:pesajeId',
  [param('pesajeId').isInt({ min: 1 }).withMessage('pesajeId debe ser un número entero positivo')],
  async (req: Request, res: Response) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { pesajeId } = req.params;

      // Generate and print ticket
      const result = await TicketGenerator.generateAndPrint(parseInt(pesajeId));

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al imprimir ticket',
          error: result.error,
          ticket: result.ticket, // Return ticket content even if print failed
        });
      }

      res.status(200).json({
        success: true,
        message: 'Ticket impreso exitosamente',
        ticket: result.ticket,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/ticket/printer/status
 * Get printer status
 */
router.get('/printer/status', async (_req: Request, res: Response) => {
  try {
    const status = TicketGenerator.getPrinterStatus();
    res.status(200).json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ticket/printer/test
 * Test printer connection
 */
router.post('/printer/test', async (_req: Request, res: Response) => {
  try {
    const success = await TicketGenerator.testPrinter();
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Impresora funcionando correctamente',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al probar la impresora',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
