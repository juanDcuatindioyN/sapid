import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PesajeService } from '../services';
import { jwtMiddleware } from '../middleware';

const router = Router();

// Apply JWT middleware to all routes
router.use(jwtMiddleware);

/**
 * POST /api/pesaje/session
 * Create new pesaje session
 */
router.post(
  '/session',
  [
    body('codigo').trim().notEmpty().isLength({ min: 1, max: 50 }).withMessage('Código debe tener entre 1 y 50 caracteres'),
    body('especie').isIn(['bovino', 'porcino']).withMessage('Especie debe ser "bovino" o "porcino"'),
    body('sexo').isIn(['H', 'M']).withMessage('Sexo debe ser "H" o "M"'),
    body('tipo_pesaje').isIn(['medios', 'lotes']).withMessage('Tipo de pesaje debe ser "medios" o "lotes"'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { codigo, especie, sexo, tipo_pesaje } = req.body;

      // Create session
      const { sessionId, session } = PesajeService.createSession({
        codigo,
        especie,
        sexo,
        tipo_pesaje,
      });

      res.status(201).json({
        sessionId,
        session,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/pesaje/session/:id/capture
 * Add weight capture to session
 */
router.post(
  '/session/:id/capture',
  [body('peso').isFloat({ min: 0.01 }).withMessage('Peso debe ser un número positivo mayor a cero')],
  async (req: Request, res: Response) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id: sessionId } = req.params;
      const { peso } = req.body;

      // Add capture
      const session = PesajeService.addWeightCapture(sessionId, peso);

      res.status(200).json({ session });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/pesaje/session/:id/finalize
 * Finalize session and persist to database
 */
router.post('/session/:id/finalize', async (req: Request, res: Response) => {
  try {
    const { id: sessionId } = req.params;
    const usuario_id = (req as any).user.id;

    // Finalize session
    const pesaje = await PesajeService.finalizeSession(sessionId, usuario_id);

    res.status(201).json({ pesaje });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/pesaje/history
 * Get pesaje history with filters
 */
router.get(
  '/history',
  [
    query('startDate').optional().isISO8601().withMessage('startDate debe ser una fecha válida'),
    query('endDate').optional().isISO8601().withMessage('endDate debe ser una fecha válida'),
    query('usuario_id').optional().isInt().withMessage('usuario_id debe ser un número entero'),
    query('especie').optional().isIn(['bovino', 'porcino']).withMessage('especie debe ser "bovino" o "porcino"'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('offset debe ser mayor o igual a 0'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const filters: any = {};

      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
      if (req.query.usuario_id) filters.usuario_id = parseInt(req.query.usuario_id as string);
      if (req.query.especie) filters.especie = req.query.especie;
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string);
      if (req.query.offset) filters.offset = parseInt(req.query.offset as string);

      // Get history
      const result = await PesajeService.getHistory(filters);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/pesaje/:id
 * Get pesaje by ID with details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pesaje = await PesajeService.getPesajeById(parseInt(id), true);

    if (!pesaje) {
      return res.status(404).json({ error: 'Pesaje no encontrado' });
    }

    res.status(200).json({ pesaje });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
