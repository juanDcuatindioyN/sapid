/**
 * Rutas para endpoints de báscula
 */
import { Router } from 'express';
import ScaleController from '../controllers/ScaleController';
import { JWTMiddleware } from '../middleware/JWTMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(JWTMiddleware);

// GET /api/scale/status - Estado de conexión
router.get('/status', ScaleController.getStatus.bind(ScaleController));

// POST /api/scale/capture - Capturar peso
router.post('/capture', ScaleController.captureWeight.bind(ScaleController));

// POST /api/scale/reconnect - Reconectar báscula
router.post('/reconnect', ScaleController.reconnect.bind(ScaleController));

export default router;
