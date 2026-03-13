import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { fc } from 'fast-check';
import UsuarioRepository from './UsuarioRepository';
import Usuario from '../database/models/Usuario';
import sequelize from '../database/config';

describe('UsuarioRepository - Property-Based Tests', () => {
  beforeAll(async () => {
    // Sincronizar base de datos para tests
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpiar tabla antes de cada test
    await Usuario.destroy({ where: {}, truncate: true });
  });

  /**
   * Feature: sapid-weighing-system, Property 20: Passwords are hashed with bcrypt
   * Validates: Requirements RNF02.2, RNF02.5
   */
  test('Property 20: Passwords are hashed with bcrypt', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          nombre: fc.string({ minLength: 1, maxLength: 100 }),
          usuario: fc.string({ minLength: 3, maxLength: 50 })
            .filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
          password: fc.string({ minLength: 8, maxLength: 50 }),
          rol: fc.constantFrom('administrador' as const, 'funcionario' as const),
        }),
        async (userData) => {
          // Crear usuario
          const usuario = await UsuarioRepository.create(userData);

          // Verificar que la contraseña NO es texto plano
          expect(usuario.password).not.toBe(userData.password);

          // Verificar que la contraseña es un hash bcrypt válido
          // Los hashes bcrypt comienzan con $2a$, $2b$, o $2y$
          expect(usuario.password).toMatch(/^\$2[aby]\$/);

          // Verificar que el factor de trabajo es al menos 10
          const parts = usuario.password.split('$');
          const workFactor = parseInt(parts[2]);
          expect(workFactor).toBeGreaterThanOrEqual(10);

          // Verificar que la contraseña original puede ser verificada
          const isValid = await UsuarioRepository.verifyPassword(
            userData.password,
            usuario.password
          );
          expect(isValid).toBe(true);

          // Verificar que una contraseña incorrecta no es válida
          const isInvalid = await UsuarioRepository.verifyPassword(
            'wrongpassword123',
            usuario.password
          );
          expect(isInvalid).toBe(false);
        }
      ),
      { numRuns: 20 } // Reducido para tests más rápidos con base de datos
    );
  });

  test('Unit test: should validate nombre length', async () => {
    await expect(
      UsuarioRepository.create({
        nombre: '',
        usuario: 'testuser',
        password: 'password123',
        rol: 'funcionario',
      })
    ).rejects.toThrow('El nombre debe tener entre 1 y 100 caracteres');
  });

  test('Unit test: should validate usuario length', async () => {
    await expect(
      UsuarioRepository.create({
        nombre: 'Test User',
        usuario: 'ab',
        password: 'password123',
        rol: 'funcionario',
      })
    ).rejects.toThrow('El usuario debe tener entre 3 y 50 caracteres');
  });

  test('Unit test: should validate usuario format', async () => {
    await expect(
      UsuarioRepository.create({
        nombre: 'Test User',
        usuario: 'user@invalid',
        password: 'password123',
        rol: 'funcionario',
      })
    ).rejects.toThrow('El usuario solo puede contener caracteres alfanuméricos');
  });

  test('Unit test: should validate password length', async () => {
    await expect(
      UsuarioRepository.create({
        nombre: 'Test User',
        usuario: 'testuser',
        password: 'short',
        rol: 'funcionario',
      })
    ).rejects.toThrow('La contraseña debe tener al menos 8 caracteres');
  });
});
