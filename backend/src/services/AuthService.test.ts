import { describe, test, expect, beforeEach, vi } from 'vitest';
import AuthService from './AuthService';
import UsuarioRepository from '../repositories/UsuarioRepository';
import LogRepository from '../repositories/LogRepository';

// Mock del repositorio
vi.mock('../repositories/UsuarioRepository');
vi.mock('../repositories/LogRepository');

describe('AuthService - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validación de credenciales vacías', () => {
    test('should reject empty username', async () => {
      const result = await AuthService.login('', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Complete todos los campos obligatorios');
    });

    test('should reject whitespace-only username', async () => {
      const result = await AuthService.login('   ', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Complete todos los campos obligatorios');
    });

    test('should reject empty password', async () => {
      const result = await AuthService.login('usuario1', '');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Complete todos los campos obligatorios');
    });

    test('should reject whitespace-only password', async () => {
      const result = await AuthService.login('usuario1', '   ');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Complete todos los campos obligatorios');
    });
  });

  describe('Validación de usuario inexistente', () => {
    test('should reject non-existent user', async () => {
      vi.mocked(UsuarioRepository.findByUsername).mockResolvedValue(null);

      const result = await AuthService.login('usuarioInexistente', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales inválidas');
    });
  });

  describe('Validación de contraseña incorrecta', () => {
    test('should reject incorrect password', async () => {
      const mockUsuario = {
        id: 1,
        nombre: 'Test User',
        usuario: 'testuser',
        password: '$2b$10$hashedpassword',
        rol: 'funcionario' as const,
        estado: 'activo' as const,
        created_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(UsuarioRepository.findByUsername).mockResolvedValue(mockUsuario);
      vi.mocked(UsuarioRepository.verifyPassword).mockResolvedValue(false);

      const result = await AuthService.login('testuser', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales inválidas');
    });
  });

  describe('Validación de usuario inactivo', () => {
    test('should reject inactive user', async () => {
      const mockUsuario = {
        id: 1,
        nombre: 'Inactive User',
        usuario: 'inactiveuser',
        password: '$2b$10$hashedpassword',
        rol: 'funcionario' as const,
        estado: 'inactivo' as const,
        created_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(UsuarioRepository.findByUsername).mockResolvedValue(mockUsuario);

      const result = await AuthService.login('inactiveuser', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Usuario inactivo');
    });
  });

  describe('Login exitoso', () => {
    test('should return token for valid credentials', async () => {
      const mockUsuario = {
        id: 1,
        nombre: 'Active User',
        usuario: 'activeuser',
        password: '$2b$10$hashedpassword',
        rol: 'administrador' as const,
        estado: 'activo' as const,
        created_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(UsuarioRepository.findByUsername).mockResolvedValue(mockUsuario);
      vi.mocked(UsuarioRepository.verifyPassword).mockResolvedValue(true);

      const result = await AuthService.login('activeuser', 'correctpassword');
      
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toEqual({
        id: 1,
        nombre: 'Active User',
        rol: 'administrador',
      });
    });
  });
});
