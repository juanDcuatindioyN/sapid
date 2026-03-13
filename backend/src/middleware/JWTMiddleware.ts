import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';

// Extender la interfaz Request para incluir información del usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        nombre: string;
        rol: 'administrador' | 'funcionario';
      };
    }
  }
}

/**
 * Middleware para validar JWT en rutas protegidas
 */
export const jwtMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Token de autenticación no proporcionado',
          timestamp: new Date(),
        },
      });
      return;
    }

    // Formato esperado: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_INVALID_FORMAT',
          message: 'Formato de token inválido',
          timestamp: new Date(),
        },
      });
      return;
    }

    const token = parts[1];

    // Validar token
    try {
      const decoded = await AuthService.validateToken(token);

      // Agregar información del usuario al objeto request
      req.user = {
        id: decoded.id,
        nombre: decoded.nombre,
        rol: decoded.rol,
      };

      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Token expirado') {
          res.status(401).json({
            success: false,
            error: {
              code: 'AUTH_TOKEN_EXPIRED',
              message: 'Sesión expirada. Por favor, inicie sesión nuevamente',
              timestamp: new Date(),
            },
          });
          return;
        } else if (error.message === 'Token inválido' || error.message === 'Token invalidado') {
          res.status(401).json({
            success: false,
            error: {
              code: 'AUTH_TOKEN_INVALID',
              message: 'Token inválido',
              timestamp: new Date(),
            },
          });
          return;
        }
      }

      // Error genérico
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Error de autenticación',
          timestamp: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Error en JWTMiddleware:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor',
        timestamp: new Date(),
      },
    });
  }
};
