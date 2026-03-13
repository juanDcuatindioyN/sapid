import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/UsuarioRepository';
import LogRepository from '../repositories/LogRepository';

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    nombre: string;
    rol: 'administrador' | 'funcionario';
  };
  error?: string;
}

interface UserPayload {
  id: number;
  nombre: string;
  rol: 'administrador' | 'funcionario';
  iat: number;
  exp: number;
}

// Almacenamiento en memoria de tokens invalidados (logout)
const invalidatedTokens = new Set<string>();

class AuthService {
  /**
   * Autentica un usuario con credenciales
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      // Validar campos vacíos o solo espacios en blanco
      if (!username || username.trim().length === 0) {
        return {
          success: false,
          error: 'Complete todos los campos obligatorios',
        };
      }

      if (!password || password.trim().length === 0) {
        return {
          success: false,
          error: 'Complete todos los campos obligatorios',
        };
      }

      // Buscar usuario por nombre de usuario
      const usuario = await UsuarioRepository.findByUsername(username.trim());

      // Usuario no existe
      if (!usuario) {
        return {
          success: false,
          error: 'Credenciales inválidas',
        };
      }

      // Verificar estado activo
      if (usuario.estado !== 'activo') {
        return {
          success: false,
          error: 'Usuario inactivo. Contacte al administrador',
        };
      }

      // Verificar contraseña
      const isPasswordValid = await UsuarioRepository.verifyPassword(
        password,
        usuario.password
      );

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Credenciales inválidas',
        };
      }

      // Generar JWT token
      const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
      const jwtExpiresIn: string | number = process.env.JWT_EXPIRES_IN || '8h';

      const payload = {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
      };

      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: jwtExpiresIn as string,
      });

      // Log successful login
      await LogRepository.log({
        usuario_id: usuario.id,
        accion: `Login exitoso - Usuario: ${usuario.usuario}`,
      });

      return {
        success: true,
        token,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          rol: usuario.rol,
        },
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: 'Error interno del servidor',
      };
    }
  }

  /**
   * Valida un token JWT
   */
  async validateToken(token: string): Promise<UserPayload> {
    try {
      // Verificar si el token ha sido invalidado (logout)
      if (invalidatedTokens.has(token)) {
        throw new Error('Token invalidado');
      }

      const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
      
      // Verificar firma y expiración
      const decoded = jwt.verify(token, jwtSecret) as UserPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      } else {
        throw error;
      }
    }
  }

  /**
   * Invalida un token (logout)
   */
  async logout(token: string): Promise<void> {
    // Agregar token a la lista de tokens invalidados
    invalidatedTokens.add(token);

    // Opcional: Limpiar tokens expirados periódicamente
    // En producción, considerar usar Redis para almacenamiento distribuido
  }

  /**
   * Limpia tokens invalidados expirados (mantenimiento)
   */
  cleanupExpiredTokens(): void {
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    
    invalidatedTokens.forEach((token) => {
      try {
        jwt.verify(token, jwtSecret);
      } catch (error) {
        // Si el token está expirado, eliminarlo de la lista
        if (error instanceof jwt.TokenExpiredError) {
          invalidatedTokens.delete(token);
        }
      }
    });
  }
}

export default new AuthService();
