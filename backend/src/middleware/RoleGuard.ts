import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para verificar el rol del usuario autenticado
 * Debe usarse después de jwtMiddleware
 */
export const requireRole = (allowedRoles: ('administrador' | 'funcionario')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Verificar que el usuario esté autenticado (debe haber pasado por jwtMiddleware)
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

    // Verificar si el rol del usuario está en la lista de roles permitidos
    if (!allowedRoles.includes(req.user.rol)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_FORBIDDEN',
          message: 'No tiene permisos para acceder a este recurso',
          timestamp: new Date(),
        },
      });
      return;
    }

    // Usuario tiene el rol adecuado, continuar
    next();
  };
};

/**
 * Middleware específico para rutas que solo pueden acceder administradores
 */
export const requireAdmin = requireRole(['administrador']);

/**
 * Middleware para rutas que pueden acceder tanto administradores como funcionarios
 */
export const requireAuthenticated = requireRole(['administrador', 'funcionario']);
