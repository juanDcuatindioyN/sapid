import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import LogRepository from '../repositories/LogRepository';
import { jwtMiddleware, requireAdmin } from '../middleware';

const router = Router();

// Apply JWT middleware and admin role guard to all routes
router.use(jwtMiddleware);
router.use(requireAdmin);

/**
 * GET /api/logs
 * Get logs with filters (admin only)
 */
router.get(
  '/',
  [
    query('usuario_id').optional().isInt().withMessage('usuario_id debe ser un número entero'),
    query('startDate').optional().isISO8601().withMessage('startDate debe ser una fecha válida'),
    query('endDate').optional().isISO8601().withMessage('endDate debe ser una fecha válida'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('limit debe estar entre 1 y 1000'),
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

      if (req.query.usuario_id) filters.usuario_id = parseInt(req.query.usuario_id as string);
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
      if (req.query.limit) filters.limit = parseInt(req.query.limit as string);
      if (req.query.offset) filters.offset = parseInt(req.query.offset as string);

      // Get logs
      const result = await LogRepository.findAll(filters);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/logs/export
 * Export logs to CSV (admin only)
 */
router.get(
  '/export',
  [
    query('usuario_id').optional().isInt().withMessage('usuario_id debe ser un número entero'),
    query('startDate').optional().isISO8601().withMessage('startDate debe ser una fecha válida'),
    query('endDate').optional().isISO8601().withMessage('endDate debe ser una fecha válida'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const filters: any = {};

      if (req.query.usuario_id) filters.usuario_id = parseInt(req.query.usuario_id as string);
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

      // Export to CSV
      const csv = await LogRepository.exportToCSV(filters);

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=logs_${Date.now()}.csv`);

      res.status(200).send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
