import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { fc } from 'fast-check';
import AuthService from './AuthService';
import UsuarioRepository from '../repositories/UsuarioRepository';
import sequelize from '../database/config';
import Usuario from '../database/models/Usuario';
import jwt from 'jsonwebtoken';

describe('AuthService - Property-Based Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Usuario.destroy({ where: {}, truncate: true });
  });

  /**
   * Feature: sapid-weighing-system, Property 1: Valid credentials grant access with correct role
   * Validates: Requirements RF01.1, RF01.5
   */
  test('Property 1: Valid credentials grant access with correct role', async () => {
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
          // Crear usuario activo en la base de datos
          await UsuarioRepository.create({
            ...userData,
            estado: 'activo',
          });

          // Intentar login con credenciales válidas
          const result = await AuthService.login(userData.usuario, userData.password);

          // Verificar que el login fue exitoso
          expect(result.success).toBe(true);
          expect(result.token).toBeDefined();
          expect(result.user).toBeDefined();

          // Verificar que el rol es correcto
          expect(result.user?.rol).toBe(userData.rol);

          // Verificar que el token contiene el rol correcto
          if (result.token) {
            const decoded = jwt.decode(result.token) as any;
            expect(decoded.rol).toBe(userData.rol);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: sapid-weighing-system, Property 2: Invalid credentials are rejected
   * Validates: Requirements RF01.2
   */
  test('Property 2: Invalid credentials are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          nombre: fc.string({ minLength: 1, maxLength: 100 }),
          usuario: fc.string({ minLength: 3, maxLength: 50 })
            .filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
          correctPassword: fc.string({ minLength: 8, maxLength: 50 }),
          wrongPassword: fc.string({ minLength: 8, maxLength: 50 }),
          rol: fc.constantFrom('administrador' as const, 'funcionario' as const),
        }).filter(data => data.correctPassword !== data.wrongPassword),
        async (userData) => {
          // Crear usuario con contraseña correcta
          await UsuarioRepository.create({
            nombre: userData.nombre,
            usuario: userData.usuario,
            password: userData.correctPassword,
            rol: userData.rol,
            estado: 'activo',
          });

          // Intentar login con contraseña incorrecta
          const result = await AuthService.login(userData.usuario, userData.wrongPassword);

          // Verificar que el login fue rechazado
          expect(result.success).toBe(false);
          expect(result.error).toBe('Credenciales inválidas');
          expect(result.token).toBeUndefined();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: sapid-weighing-system, Property 3: Empty credential fields are validated
   * Validates: Requirements RF01.3
   */
  test('Property 3: Empty credential fields are validated', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.record({
            username: fc.constant(''),
            password: fc.string({ minLength: 1 }),
          }),
          fc.record({
            username: fc.string({ minLength: 1 }),
            password: fc.constant(''),
          }),
          fc.record({
            username: fc.constant('   '),
            password: fc.string({ minLength: 1 }),
          }),
          fc.record({
            username: fc.string({ minLength: 1 }),
            password: fc.constant('   '),
          })
        ),
        async (credentials) => {
          const result = await AuthService.login(credentials.username, credentials.password);

          // Verificar que el login fue rechazado
          expect(result.success).toBe(false);
          expect(result.error).toContain('Complete todos los campos obligatorios');
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: sapid-weighing-system, Property 4: Inactive users cannot authenticate
   * Validates: Requirements RF01.4
   */
  test('Property 4: Inactive users cannot authenticate', async () => {
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
          // Crear usuario inactivo
          await UsuarioRepository.create({
            ...userData,
            estado: 'inactivo',
          });

          // Intentar login con credenciales válidas pero usuario inactivo
          const result = await AuthService.login(userData.usuario, userData.password);

          // Verificar que el login fue rechazado
          expect(result.success).toBe(false);
          expect(result.error).toContain('Usuario inactivo');
          expect(result.token).toBeUndefined();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: sapid-weighing-system, Property 21: Session tokens expire after inactivity
   * Validates: Requirements RNF02.3
   */
  test('Property 21: Session tokens expire after inactivity', async () => {
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
          // Crear usuario activo
          await UsuarioRepository.create({
            ...userData,
            estado: 'activo',
          });

          // Login exitoso
          const result = await AuthService.login(userData.usuario, userData.password);
          expect(result.success).toBe(true);
          expect(result.token).toBeDefined();

          // Verificar que el token tiene tiempo de expiración
          if (result.token) {
            const decoded = jwt.decode(result.token) as any;
            
            // Verificar que tiene campo exp (expiration)
            expect(decoded.exp).toBeDefined();
            expect(decoded.iat).toBeDefined();

            // Verificar que la expiración es máximo 8 horas (28800 segundos)
            const expirationTime = decoded.exp - decoded.iat;
            expect(expirationTime).toBeLessThanOrEqual(28800);
            expect(expirationTime).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});
