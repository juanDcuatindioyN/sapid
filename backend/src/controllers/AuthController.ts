import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import AuthService from '../services/AuthService';

class AuthController {
  /**
   * Validaciones para el endpoint de login
   */
  loginValidation = [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('El usuario es obligatorio')
      .isLength({ min: 3, max: 50 })
      .withMessage('El usuario debe tener entre 3 y 50 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('El usuario solo puede contener caracteres alfanuméricos y guiones bajos'),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es obligatoria')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres'),
  ];

  /**
   * POST /api/auth/login
   * Autentica un usuario y retorna un token JWT
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: errors.array()[0].msg,
            details: errors.array(),
            timestamp: new Date(),
          },
        });
        return;
      }

      const { username, password } = req.body;

      // Intentar autenticación
      const result = await AuthService.login(username, password);

      if (!result.success) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_INVALID_CREDENTIALS',
            message: result.error,
            timestamp: new Date(),
          },
        });
        return;
      }

      // Login exitoso
      res.status(200).json({
        success: true,
        data: {
          token: result.token,
          user: result.user,
        },
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Invalida el token actual del usuario
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Extraer token del header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(400).json({
          success: false,
          error: {
            code: 'TOKEN_MISSING',
            message: 'Token no proporcionado',
            timestamp: new Date(),
          },
        });
        return;
      }

      const token = authHeader.split(' ')[1];

      // Invalidar token
      await AuthService.logout(token);

      res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente',
      });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * GET /api/auth/me
   * Obtiene información del usuario autenticado
   * Requiere jwtMiddleware
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      // El usuario ya está disponible en req.user gracias al jwtMiddleware
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Autenticación requerida',
            timestamp: new Date(),
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      console.error('Error en me:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
          timestamp: new Date(),
        },
      });
    }
  }
}

export default new AuthController();
