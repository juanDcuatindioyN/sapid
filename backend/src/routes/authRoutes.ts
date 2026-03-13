import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import AuthController from '../controllers/AuthController';
import { jwtMiddleware } from '../middleware/JWTMiddleware';

const router = Router();

// Rate limiter para el endpoint de login (max 5 intentos por minuto)
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minuto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'), // 5 intentos
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiados intentos de inicio de sesión. Intente nuevamente más tarde',
      timestamp: new Date(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/login
 * Autenticación de usuario
 */
router.post('/login', loginLimiter, AuthController.loginValidation, (req, res) => {
  AuthController.login(req, res);
});

/**
 * POST /api/auth/logout
 * Cierre de sesión
 */
router.post('/logout', (req, res) => {
  AuthController.logout(req, res);
});

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 * Requiere autenticación
 */
router.get('/me', jwtMiddleware, (req, res) => {
  AuthController.me(req, res);
});

export default router;
