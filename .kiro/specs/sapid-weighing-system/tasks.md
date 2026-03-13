# Plan de Implementación: SAPID - Sistema Automatizado de Pesaje e Integración Digital

## Overview

Este plan implementa un sistema monolítico modular con 6 módulos principales: Autenticación, Integración con Báscula, Lógica de Pesaje, Generación de Tickets, Persistencia y Frontend PWA. El sistema utiliza Node.js/Express en el backend, Next.js 14+ en el frontend, PostgreSQL como base de datos, y comunicación RS232/TCP con báscula física. La arquitectura es offline-first con capacidad de sincronización automática.

## Tasks

- [x] 1. Configuración inicial del proyecto y estructura base
  - Crear estructura de directorios para monorepo (backend, frontend, shared)
  - Inicializar proyecto Node.js con TypeScript para backend
  - Inicializar proyecto Next.js 14+ con TypeScript para frontend
  - Configurar ESLint, Prettier y tsconfig para ambos proyectos
  - Configurar Docker Compose con PostgreSQL 14+
  - Crear archivo .env.example con variables de entorno necesarias
  - Configurar scripts de package.json para desarrollo y build
  - _Requirements: Arquitectura monolítica modular, Stack tecnológico_

- [x] 2. Configuración de base de datos PostgreSQL
  - [x] 2.1 Crear esquema de base de datos y migraciones
    - Crear migración para tabla usuarios con campos: id, nombre, usuario, password, rol, estado, created_at
    - Crear migración para tabla pesajes con campos: id, codigo, especie, sexo, tipo_pesaje, peso_total, fecha, usuario_id
    - Crear migración para tabla pesajes_detalle con campos: id, pesaje_id, peso, fecha
    - Crear migración para tabla logs con campos: id, usuario_id, accion, fecha, ip, terminal
    - Agregar índices en: pesajes(fecha, usuario_id, codigo), logs(usuario_id, fecha)
    - Agregar constraints CHECK para enums y foreign keys
    - _Requirements: RF01, RF02, RF03, RF04, RF05, RF06, RNF04_

  - [x] 2.2 Configurar ORM y conexión a base de datos
    - Instalar y configurar Sequelize o Prisma
    - Crear archivo de configuración de conexión con pool de conexiones (max 20)
    - Implementar script de inicialización de base de datos
    - Crear seed inicial con usuario administrador por defecto
    - _Requirements: Módulo de Persistencia_


- [x] 3. Implementar Módulo de Autenticación (Backend)
  - [x] 3.1 Crear modelos y repositorios de usuario
    - Implementar UsuarioRepository con métodos: create, findById, findByUsername, findAll, update, delete
    - Implementar validaciones de datos según reglas: nombre (1-100 chars), usuario (3-50 chars alfanumérico único), password (min 8 chars)
    - Implementar hash de contraseñas con bcrypt (factor 10)
    - _Requirements: RF01.1, RF01.3, RF01.4, RNF02.2, RNF02.5_

  - [ ]* 3.2 Escribir property test para hash de contraseñas
    - **Property 20: Passwords are hashed with bcrypt**
    - **Valida: Requirements RNF02.2, RNF02.5**

  - [x] 3.3 Implementar AuthService con lógica de autenticación
    - Implementar método login(username, password) que valida credenciales contra base de datos
    - Implementar validación de estado activo del usuario
    - Implementar generación de JWT con payload: id, nombre, rol, iat, exp (8 horas)
    - Implementar método validateToken(token) que verifica firma y expiración
    - Implementar método logout(token) para invalidación de sesión
    - _Requirements: RF01.1, RF01.2, RF01.4, RF01.5, RNF02.3_

  - [ ]* 3.4 Escribir property tests para autenticación
    - **Property 1: Valid credentials grant access with correct role**
    - **Valida: Requirements RF01.1, RF01.5**

  - [ ]* 3.5 Escribir property test para rechazo de credenciales inválidas
    - **Property 2: Invalid credentials are rejected**
    - **Valida: Requirements RF01.2**

  - [ ]* 3.6 Escribir property test para validación de campos vacíos
    - **Property 3: Empty credential fields are validated**
    - **Valida: Requirements RF01.3**

  - [ ]* 3.7 Escribir property test para usuarios inactivos
    - **Property 4: Inactive users cannot authenticate**
    - **Valida: Requirements RF01.4**

  - [ ]* 3.8 Escribir property test para expiración de tokens
    - **Property 21: Session tokens expire after inactivity**
    - **Valida: Requirements RNF02.3**

  - [x] 3.9 Implementar middleware JWT para protección de rutas
    - Crear JWTMiddleware que extrae y valida token de header Authorization
    - Implementar manejo de errores: token ausente, inválido, expirado
    - Agregar información de usuario al objeto request
    - _Requirements: RF01.5, RNF02.1_

  - [x] 3.10 Implementar RoleGuard para control de acceso por rol
    - Crear middleware que verifica rol del usuario autenticado
    - Implementar restricciones: solo administrador puede gestionar usuarios y ver logs
    - _Requirements: RF01.5, RNF04.6_

  - [x] 3.11 Crear endpoints REST de autenticación
    - POST /api/auth/login - Autenticación de usuario
    - POST /api/auth/logout - Cierre de sesión
    - GET /api/auth/me - Obtener información del usuario autenticado
    - Implementar validación de entrada y sanitización
    - Implementar rate limiting (max 5 intentos por minuto en login)
    - _Requirements: RF01, RNF02.4_

  - [ ]* 3.12 Escribir unit tests para AuthService
    - Test para credenciales vacías (username y password)
    - Test para credenciales con solo espacios en blanco
    - Test para usuario inexistente
    - Test para contraseña incorrecta
    - Test para usuario inactivo


- [x] 4. Implementar Módulo de Integración con Báscula (Backend)
  - [x] 4.1 Crear interfaz ScaleAdapter y configuración
    - Definir interfaz ScaleAdapter con métodos: connect(), disconnect(), readWeight(), isConnected()
    - Crear tipos TypeScript para ScaleConfig (protocol, port, baudRate, host, timeout, etc.)
    - Crear tipos para WeightReading y ConnectionStatus
    - _Requirements: RF02.1, RF02.2_

  - [x] 4.2 Implementar RS232Adapter para comunicación serial
    - Instalar y configurar librería serialport
    - Implementar conexión serial con parámetros configurables (baudRate, dataBits, stopBits, parity)
    - Implementar lectura de peso desde puerto serial
    - Implementar manejo de timeouts (2 segundos máximo)
    - Implementar reconexión automática (max 3 intentos con backoff exponencial)
    - _Requirements: RF02.1, RF02.3, RNF01.1_

  - [x] 4.3 Implementar TCPAdapter para comunicación TCP/IP
    - Usar módulo net nativo de Node.js
    - Implementar conexión TCP con host y puerto configurables
    - Implementar lectura de peso desde socket TCP
    - Implementar manejo de timeouts y reconexión
    - _Requirements: RF02.1, RF02.3_

  - [x] 4.4 Implementar ScaleParser para parseo de respuestas
    - Crear parser genérico que extrae valor numérico de respuesta
    - Implementar validación de formato de respuesta
    - Implementar conversión a kilogramos con 2 decimales
    - Soportar diferentes formatos según fabricante (configurable)
    - _Requirements: RF02.2, RF02.4_

  - [x] 4.5 Implementar ScaleService como orquestador
    - Implementar método captureWeight() que coordina lectura y validación
    - Implementar validación de rango (10-2000 kg)
    - Implementar validación de valores positivos no-cero
    - Implementar método getConnectionStatus()
    - Implementar logging de todas las operaciones
    - _Requirements: RF02.1, RF02.2, RF02.4, RF02.5_

  - [ ]* 4.6 Escribir property test para lecturas válidas de peso
    - **Property 5: Weight capture returns valid readings**
    - **Valida: Requirements RF02.1, RF02.2**

  - [ ]* 4.7 Escribir property test para errores de comunicación
    - **Property 6: Communication errors are reported**
    - **Valida: Requirements RF02.3**

  - [ ]* 4.8 Escribir property test para rechazo de valores inválidos
    - **Property 7: Invalid weight values are rejected**
    - **Valida: Requirements RF02.4**

  - [x] 4.9 Crear endpoint REST para captura de peso
    - GET /api/scale/status - Estado de conexión con báscula
    - POST /api/scale/capture - Capturar peso actual
    - Implementar manejo de errores de conexión
    - _Requirements: RF02_

  - [ ]* 4.10 Escribir unit tests para ScaleService
    - Test para timeout de conexión
    - Test para peso cero
    - Test para peso negativo
    - Test para peso fuera de rango (< 10 kg o > 2000 kg)
    - Test para reconexión automática


- [x] 5. Implementar Módulo de Lógica de Negocio - Pesaje (Backend)
  - [x] 5.1 Crear modelos y repositorios de pesaje
    - Implementar PesajeRepository con métodos: create, findById, findAll, update, delete
    - Implementar método createWithDetails para transacción atómica (pesaje + detalles)
    - Implementar métodos de consulta: findByDateRange, findByUsuario
    - Implementar validaciones de datos según reglas del modelo
    - _Requirements: RF03, RF04, RF05, RF06_

  - [x] 5.2 Implementar ValidationService para metadatos
    - Implementar validación de código (1-50 caracteres, no vacío)
    - Implementar validación de especie (bovino/porcino)
    - Implementar validación de sexo (H/M)
    - Implementar validación de tipo_pesaje (medios/lotes)
    - Implementar método validateMetadata que verifica completitud
    - _Requirements: RF04.1, RF04.2, RF04.3, RF04.4_

  - [ ]* 5.3 Escribir property test para metadatos completos
    - **Property 8: Complete metadata enables weight capture**
    - **Valida: Requirements RF03.3, RF04.1, RF04.2, RF04.3, RF04.4**

  - [x] 5.4 Implementar CalculationService para cálculos de peso
    - Implementar método calculateTotal que suma array de capturas
    - Implementar redondeo a 2 decimales con precisión
    - Implementar validación de precisión numérica (tolerancia 0.01)
    - _Requirements: RF05.1, RF05.2, RF05.5_

  - [ ]* 5.5 Escribir property test para suma de pesos
    - **Property 11: Weight total is sum of all captures**
    - **Valida: Requirements RF05.1, RF05.2, RF05.5**

  - [ ]* 5.6 Escribir property test para actualización incremental
    - **Property 12: Adding capture updates total incrementally**
    - **Valida: Requirements RF05.2**

  - [ ]* 5.7 Escribir property test para persistencia de total calculado
    - **Property 13: Finalized session persists calculated total**
    - **Valida: Requirements RF05.4**

  - [x] 5.8 Implementar PesajeService como orquestador principal
    - Implementar método createSession(metadata) que crea sesión en memoria
    - Implementar método addWeightCapture(sessionId, weight) que agrega captura y actualiza total
    - Implementar método finalizeSession(sessionId) que persiste en base de datos
    - Implementar método getHistory(filters) con paginación
    - Implementar gestión de sesiones activas en memoria (Map o similar)
    - Implementar generación de IDs únicos para sesiones
    - _Requirements: RF03, RF04, RF05, RF06_

  - [ ]* 5.9 Escribir property test para habilitación de finalización
    - **Property 14: Complete sessions enable finalization**
    - **Valida: Requirements RF06.1**

  - [ ]* 5.10 Escribir property test para IDs únicos y timestamps
    - **Property 15: Finalized sessions have unique IDs and timestamps**
    - **Valida: Requirements RF06.2**

  - [x] 5.11 Crear endpoints REST para operaciones de pesaje
    - POST /api/pesaje/session - Crear nueva sesión de pesaje
    - POST /api/pesaje/session/:id/capture - Agregar captura de peso a sesión
    - POST /api/pesaje/session/:id/finalize - Finalizar sesión y persistir
    - GET /api/pesaje/history - Consultar historial con filtros (fecha, especie, usuario)
    - GET /api/pesaje/:id - Obtener detalle de pesaje específico
    - Implementar validación de entrada y manejo de errores
    - Proteger endpoints con JWTMiddleware
    - _Requirements: RF03, RF04, RF05, RF06_

  - [ ]* 5.12 Escribir unit tests para PesajeService
    - Test para sesión con metadatos incompletos
    - Test para cálculo de total con dos capturas
    - Test para cálculo de total con múltiples capturas (lotes)
    - Test para finalización sin capturas
    - Test para sesión inexistente


- [x] 6. Implementar Módulo de Generación de Tickets (Backend)
  - [x] 6.1 Crear TicketTemplate para formateo de tickets
    - Implementar plantilla para Factura de Medios con formato de 80mm
    - Implementar plantilla para Factura de Lotes con formato de 80mm
    - Incluir todos los campos requeridos: header (nombre frigorífico), fecha, ID, código, especie, sexo, tipo, detalles de pesos, peso total, operador
    - Implementar formateo de números con 2 decimales
    - Implementar alineación de texto para impresora de 48 caracteres por línea
    - _Requirements: RF06.4_

  - [ ]* 6.2 Escribir property test para campos requeridos en ticket
    - **Property 17: Generated tickets contain all required fields**
    - **Valida: Requirements RF06.4**

  - [x] 6.3 Implementar PrinterService para comunicación con impresora
    - Instalar y configurar librería node-thermal-printer
    - Implementar configuración de impresora (type: network/usb/serial, interface, width, encoding)
    - Implementar método print(ticketData) que envía comandos ESC/POS
    - Implementar manejo de errores de impresora (no disponible, sin papel, etc.)
    - Implementar cola de impresión para reintentos
    - _Requirements: RF06.3_

  - [x] 6.4 Implementar TicketGenerator como orquestador
    - Implementar método generateTicket(pesaje, usuario) que formatea ticket según plantilla
    - Implementar método print(ticket) que envía a PrinterService
    - Implementar logging de todas las operaciones de impresión
    - Implementar manejo de errores sin bloquear guardado en base de datos
    - _Requirements: RF06.3, RF06.6_

  - [ ]* 6.5 Escribir property test para guardado exitoso dispara impresión
    - **Property 16: Successful save triggers print command**
    - **Valida: Requirements RF06.3**

  - [ ]* 6.6 Escribir property test para independencia de impresora
    - **Property 19: Database persistence is independent of printer status**
    - **Valida: Requirements RF06.6**

  - [x] 6.7 Crear endpoint REST para reimpresión
    - POST /api/ticket/print/:pesajeId - Reimprimir ticket de pesaje existente
    - Proteger endpoint con JWTMiddleware
    - _Requirements: RF06_

  - [ ]* 6.8 Escribir unit tests para TicketGenerator
    - Test para formato de ticket Medios con todos los campos
    - Test para formato de ticket Lotes con múltiples capturas
    - Test para manejo de error de impresora
    - Test para reimpresión desde historial


- [ ] 7. Implementar Módulo de Persistencia y Auditoría (Backend)
  - [ ] 7.1 Implementar LogRepository para auditoría
    - Implementar método log(entry) para registrar acciones
    - Implementar métodos de consulta: findByUsuario, findByDateRange
    - Implementar validación de campos obligatorios (usuarioId, accion, fecha)
    - _Requirements: RNF04.1, RNF04.2, RNF04.3, RNF04.4_

  - [ ]* 7.2 Escribir property test para logging de operaciones críticas
    - **Property 25: Critical operations are logged**
    - **Valida: Requirements RNF04.1, RNF04.2, RNF04.3, RNF04.4**

  - [ ] 7.3 Implementar middleware de logging automático
    - Crear middleware que registra automáticamente: login exitoso, creación de sesión de pesaje, modificación de usuarios
    - Capturar información de contexto: usuario_id, IP, terminal (user-agent)
    - Implementar logging con niveles: ERROR, WARN, INFO, DEBUG
    - _Requirements: RNF04_

  - [ ] 7.4 Implementar DatabaseService para gestión de conexiones
    - Configurar pool de conexiones (max 20)
    - Implementar manejo de transacciones
    - Implementar manejo de errores de conexión
    - Implementar health check de base de datos
    - _Requirements: Módulo de Persistencia_

  - [ ]* 7.5 Escribir property test para preservación de datos en error
    - **Property 18: Database errors preserve session data**
    - **Valida: Requirements RF06.5**

  - [ ] 7.6 Crear endpoints REST para logs (solo administrador)
    - GET /api/logs - Consultar logs con filtros (usuario, fecha)
    - GET /api/logs/export - Exportar logs en formato CSV
    - Proteger endpoints con JWTMiddleware y RoleGuard (solo administrador)
    - _Requirements: RNF04.6_

  - [ ]* 7.7 Escribir property test para acceso de administrador a logs
    - **Property 26: Administrators can access all logs**
    - **Valida: Requirements RNF04.6**

  - [ ]* 7.8 Escribir unit tests para LogRepository
    - Test para registro de login exitoso
    - Test para registro de creación de pesaje
    - Test para consulta por rango de fechas
    - Test para consulta por usuario


- [ ] 8. Implementar seguridad y sanitización (Backend)
  - [ ] 8.1 Implementar sanitización de entradas
    - Instalar y configurar librería de sanitización (express-validator o similar)
    - Implementar sanitización para todos los endpoints que reciben input de usuario
    - Implementar validación de tipos y formatos
    - Implementar escape de caracteres especiales para prevenir SQL injection y XSS
    - _Requirements: RNF02.4_

  - [ ]* 8.2 Escribir property test para sanitización de inputs
    - **Property 22: User inputs are sanitized**
    - **Valida: Requirements RNF02.4**

  - [ ] 8.3 Configurar headers de seguridad HTTP
    - Instalar y configurar helmet.js
    - Configurar HSTS (HTTP Strict Transport Security)
    - Configurar CSP (Content Security Policy)
    - Configurar X-Frame-Options, X-Content-Type-Options
    - _Requirements: RNF02.1_

  - [ ] 8.4 Implementar rate limiting
    - Instalar y configurar express-rate-limit
    - Configurar límite de 5 intentos por minuto en endpoint de login
    - Configurar límites generales para otros endpoints
    - _Requirements: RNF02_

  - [ ]* 8.5 Escribir unit tests para rate limiting
    - Test para bloqueo después de 5 intentos de login
    - Test para reset de contador después del tiempo límite

- [ ] 9. Checkpoint Backend - Verificar integración de módulos
  - Ejecutar todos los tests unitarios y property-based tests del backend
  - Verificar que todos los endpoints REST respondan correctamente
  - Verificar conexión con PostgreSQL y ejecución de migraciones
  - Verificar logging de operaciones críticas
  - Asegurar que no hay errores de TypeScript
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 10. Configurar proyecto Frontend Next.js con PWA
  - [ ] 10.1 Inicializar proyecto Next.js 14+ con App Router
    - Crear proyecto Next.js con TypeScript
    - Configurar Tailwind CSS para estilos
    - Instalar y configurar next-pwa para capacidades offline
    - Configurar manifest.json para PWA (nombre, iconos, colores)
    - Configurar Service Worker con estrategias de caché
    - _Requirements: RNF05.1, RNF05.5_

  - [ ] 10.2 Configurar almacenamiento local con IndexedDB
    - Instalar librería idb para manejo de IndexedDB
    - Crear esquema de base de datos local: pendingPesajes, cachedData
    - Implementar funciones de acceso a IndexedDB
    - _Requirements: RNF05.2_

  - [ ] 10.3 Configurar cliente HTTP con interceptores
    - Configurar axios o fetch con interceptores
    - Implementar interceptor para agregar token JWT a headers
    - Implementar interceptor para manejo de errores 401 (token expirado)
    - Implementar detección de conectividad (navigator.onLine)
    - _Requirements: RNF02.1, RNF05_

  - [ ] 10.4 Crear contexto de autenticación global
    - Implementar AuthContext con estado: user, isAuthenticated, isOnline
    - Implementar funciones: login, logout, checkAuth
    - Implementar persistencia de token en localStorage
    - Implementar redirección automática a login si no autenticado
    - _Requirements: RF01_

  - [ ] 10.5 Crear contexto de estado de aplicación
    - Implementar AppContext con estado: currentSession, pendingSyncs, isOnline
    - Implementar funciones para gestión de sesión de pesaje en memoria
    - _Requirements: RF03, RF05_


- [ ] 11. Implementar página de Login (Frontend)
  - [ ] 11.1 Crear componente LoginPage
    - Crear formulario con campos: usuario, password
    - Implementar validación de campos obligatorios en cliente
    - Implementar manejo de estado del formulario
    - Implementar llamada a API POST /api/auth/login
    - Implementar manejo de errores y mensajes de feedback
    - Implementar redirección a dashboard después de login exitoso
    - Aplicar estilos con Tailwind CSS (diseño industrial, fuentes >= 14px)
    - _Requirements: RF01, RNF03_

  - [ ] 11.2 Implementar navegación por teclado en LoginPage
    - Configurar tabulación entre campos
    - Configurar Enter para submit del formulario
    - _Requirements: RNF03.2_

  - [ ]* 11.3 Escribir unit tests para LoginPage
    - Test para validación de campos vacíos
    - Test para mostrar mensaje de error en credenciales inválidas
    - Test para redirección después de login exitoso
    - Test para navegación por teclado


- [ ] 12. Implementar Dashboard principal (Frontend)
  - [ ] 12.1 Crear componente DashboardPage
    - Crear layout con navegación según rol (Administrador/Funcionario)
    - Mostrar información del usuario autenticado
    - Mostrar indicador de estado de conexión (online/offline)
    - Mostrar contador de pesajes pendientes de sincronización
    - Crear enlaces a: Nuevo Pesaje, Historial, Gestión de Usuarios (admin), Logs (admin)
    - Implementar botón de logout
    - _Requirements: RF01.5, RNF05.4_

  - [ ]* 12.2 Escribir property test para indicador de estado offline
    - **Property 29: Offline status is visible to user**
    - **Valida: Requirements RNF05.4**

  - [ ]* 12.3 Escribir unit tests para DashboardPage
    - Test para mostrar opciones de administrador solo a usuarios con rol administrador
    - Test para mostrar indicador offline cuando no hay conexión
    - Test para mostrar contador de sincronizaciones pendientes


- [ ] 13. Implementar formulario de Pesaje (Frontend)
  - [ ] 13.1 Crear componente PesajeForm
    - Crear selector de plantilla: Factura de Medios / Factura de Lotes
    - Crear campos de metadatos: Código (input text), Especie (select), Sexo (select)
    - Implementar validación de campos obligatorios
    - Implementar habilitación condicional del botón "Capturar Peso"
    - Crear botón "Capturar Peso" que llama a POST /api/scale/capture
    - Mostrar lista de capturas realizadas con pesos individuales
    - Mostrar peso total consolidado actualizado en tiempo real
    - Crear botón "Finalizar e Imprimir" habilitado solo con al menos una captura
    - Implementar vista previa del ticket que se actualiza con metadatos
    - Aplicar estilos industriales con controles >= 44x44 píxeles
    - _Requirements: RF02, RF03, RF04, RF05, RF06, RNF03_

  - [ ]* 13.2 Escribir property test para actualización de vista previa
    - **Property 10: Metadata changes update ticket preview**
    - **Valida: Requirements RF03.4**

  - [ ]* 13.3 Escribir property test para persistencia de plantilla
    - **Property 9: Template selection persists during session**
    - **Valida: Requirements RF03.5**

  - [ ] 13.2 Implementar lógica de captura de peso
    - Implementar llamada a POST /api/scale/capture
    - Implementar manejo de loading durante captura (máx 2 segundos)
    - Implementar manejo de errores de báscula (conexión, peso inválido)
    - Agregar peso capturado a lista de capturas en estado local
    - Actualizar peso total consolidado
    - _Requirements: RF02, RF05, RNF01.1_

  - [ ] 13.3 Implementar lógica de finalización
    - Implementar llamada a POST /api/pesaje/session para crear sesión
    - Implementar llamadas a POST /api/pesaje/session/:id/capture para cada peso
    - Implementar llamada a POST /api/pesaje/session/:id/finalize
    - Implementar manejo de errores de red y base de datos
    - Mostrar mensaje de éxito o error
    - Limpiar formulario después de finalización exitosa
    - _Requirements: RF06_

  - [ ] 13.4 Implementar navegación por teclado y mouse
    - Configurar tabulación entre todos los campos
    - Configurar atajos de teclado: Enter para capturar, Ctrl+Enter para finalizar
    - Asegurar que todos los botones sean clickeables con mouse
    - _Requirements: RNF03.2, RNF03.3_

  - [ ]* 13.5 Escribir unit tests para PesajeForm
    - Test para deshabilitar captura con metadatos incompletos
    - Test para actualizar total después de agregar captura
    - Test para habilitar finalización solo con al menos una captura
    - Test para limpiar formulario después de finalización exitosa
    - Test para manejo de error de báscula
    - Test para navegación por teclado


- [ ] 14. Implementar funcionalidad Offline-First (Frontend)
  - [ ] 14.1 Crear OfflineManager para detección de conectividad
    - Implementar listener de eventos online/offline de navigator
    - Implementar actualización de estado global isOnline
    - Implementar mostrar/ocultar banner de estado offline
    - _Requirements: RNF05.4_

  - [ ] 14.2 Implementar almacenamiento local de pesajes offline
    - Implementar función savePesajeLocally que guarda en IndexedDB
    - Implementar generación de UUID local para pesajes offline
    - Implementar marcado de pesajes como pendientes de sincronización
    - _Requirements: RNF05.2_

  - [ ]* 14.3 Escribir property test para captura offline
    - **Property 27: Offline mode enables local capture**
    - **Valida: Requirements RNF05.2, RNF05.6**

  - [ ] 14.4 Crear SyncManager para sincronización automática
    - Implementar función syncPendingRecords que envía pesajes locales al servidor
    - Implementar listener de evento online para sincronización automática
    - Implementar manejo de errores de sincronización con reintentos
    - Implementar actualización de contador de pendientes
    - Implementar marcado de registros como sincronizados
    - _Requirements: RNF05.3_

  - [ ]* 14.5 Escribir property test para sincronización round-trip
    - **Property 28: Offline-to-online synchronization (Round-trip)**
    - **Valida: Requirements RNF05.3**

  - [ ]* 14.6 Escribir property test para resolución de conflictos
    - **Property 31: Sync conflicts resolve by timestamp**
    - **Valida: Requirements RNF05.7**

  - [ ] 14.7 Configurar Service Worker con estrategias de caché
    - Implementar estrategia Cache-First para assets estáticos (HTML, CSS, JS, imágenes)
    - Implementar estrategia Network-First para llamadas a API
    - Implementar Background Sync API para sincronización en segundo plano
    - _Requirements: RNF05.5_

  - [ ]* 14.8 Escribir property test para caché de recursos estáticos
    - **Property 30: Static resources are cached**
    - **Valida: Requirements RNF05.5**

  - [ ]* 14.9 Escribir unit tests para OfflineManager y SyncManager
    - Test para detección de cambio a offline
    - Test para detección de cambio a online
    - Test para guardado en IndexedDB
    - Test para sincronización exitosa
    - Test para reintento en error de sincronización


- [ ] 15. Implementar página de Historial (Frontend)
  - [ ] 15.1 Crear componente HistoryView
    - Crear formulario de filtros: rango de fechas, especie, usuario (admin)
    - Implementar llamada a GET /api/pesaje/history con parámetros de filtro
    - Mostrar tabla con columnas: ID, Fecha, Código, Especie, Sexo, Tipo, Peso Total, Operador
    - Implementar paginación (lazy loading)
    - Implementar botón "Ver Detalle" que muestra capturas individuales
    - Implementar botón "Reimprimir" que llama a POST /api/ticket/print/:id
    - Aplicar estilos con Tailwind CSS
    - _Requirements: RF05, RF06_

  - [ ]* 15.2 Escribir unit tests para HistoryView
    - Test para aplicar filtros correctamente
    - Test para mostrar datos en tabla
    - Test para paginación
    - Test para reimpresión de ticket


- [ ] 16. Implementar gestión de usuarios (Frontend - Solo Admin)
  - [ ] 16.1 Crear endpoints REST de gestión de usuarios (Backend)
    - POST /api/users - Crear nuevo usuario
    - GET /api/users - Listar todos los usuarios
    - GET /api/users/:id - Obtener usuario específico
    - PUT /api/users/:id - Actualizar usuario
    - DELETE /api/users/:id - Eliminar usuario (soft delete: cambiar estado a inactivo)
    - Proteger todos los endpoints con JWTMiddleware y RoleGuard (solo administrador)
    - _Requirements: RF01.5_

  - [ ] 16.2 Crear componente UsersManagementPage (Frontend)
    - Mostrar tabla con lista de usuarios: ID, Nombre, Usuario, Rol, Estado
    - Implementar botón "Nuevo Usuario" que abre modal de creación
    - Implementar botón "Editar" por cada usuario
    - Implementar botón "Activar/Desactivar" para cambiar estado
    - Crear formulario de usuario con validación: nombre, usuario, password, rol
    - Implementar llamadas a API de gestión de usuarios
    - _Requirements: RF01.5_

  - [ ]* 16.3 Escribir unit tests para UsersManagementPage
    - Test para mostrar lista de usuarios
    - Test para crear nuevo usuario
    - Test para editar usuario existente
    - Test para cambiar estado de usuario


- [ ] 17. Implementar visualización de Logs (Frontend - Solo Admin)
  - [ ] 17.1 Crear componente LogsPage
    - Crear formulario de filtros: rango de fechas, usuario
    - Implementar llamada a GET /api/logs con parámetros de filtro
    - Mostrar tabla con columnas: ID, Fecha, Usuario, Acción, IP, Terminal
    - Implementar paginación
    - Implementar botón "Exportar CSV" que llama a GET /api/logs/export
    - Aplicar estilos con Tailwind CSS
    - _Requirements: RNF04.6_

  - [ ]* 17.2 Escribir unit tests para LogsPage
    - Test para aplicar filtros correctamente
    - Test para mostrar logs en tabla
    - Test para exportar CSV

- [ ] 18. Checkpoint Frontend - Verificar integración de componentes
  - Ejecutar todos los tests unitarios y property-based tests del frontend
  - Verificar que todas las páginas se rendericen correctamente
  - Verificar navegación entre páginas
  - Verificar que PWA se instale correctamente
  - Verificar que Service Worker cachee recursos
  - Verificar modo offline con IndexedDB
  - Asegurar que no hay errores de TypeScript
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 19. Implementar tests de usabilidad
  - [ ] 19.1 Verificar navegación por teclado completa
    - Verificar tabulación en LoginPage
    - Verificar tabulación en PesajeForm
    - Verificar atajos de teclado (Enter, Ctrl+Enter, Escape)
    - _Requirements: RNF03.2_

  - [ ]* 19.2 Escribir property test para navegación por teclado
    - **Property 23: Keyboard navigation is complete**
    - **Valida: Requirements RNF03.2**

  - [ ]* 19.3 Escribir property test para navegación por mouse
    - **Property 24: Mouse navigation is complete**
    - **Valida: Requirements RNF03.3**

  - [ ]* 19.4 Escribir unit tests para accesibilidad
    - Test para tamaño de controles >= 44x44 píxeles
    - Test para tamaño de fuente >= 14px
    - Test para contraste de colores
    - Test para mensajes de error visibles


- [ ] 20. Integración y configuración de despliegue
  - [ ] 20.1 Crear configuración de Docker Compose
    - Crear Dockerfile para backend (Node.js)
    - Crear Dockerfile para frontend (Next.js con build estático o SSR)
    - Crear docker-compose.yml con servicios: backend, frontend, postgres
    - Configurar volúmenes para persistencia de datos de PostgreSQL
    - Configurar redes entre contenedores
    - Configurar variables de entorno
    - _Requirements: Despliegue_

  - [ ] 20.2 Configurar HTTPS con certificado SSL
    - Configurar nginx como reverse proxy (opcional)
    - Configurar certificado SSL (Let's Encrypt o autofirmado para desarrollo)
    - Configurar redirección HTTP a HTTPS
    - _Requirements: RNF02.1_

  - [ ] 20.3 Configurar scripts de backup de base de datos
    - Crear script de backup automático de PostgreSQL
    - Configurar cron job para backups diarios
    - Configurar retención de backups (mínimo 30 días)
    - _Requirements: RNF04.5_

  - [ ] 20.4 Crear documentación de despliegue
    - Documentar requisitos del sistema (hardware, software)
    - Documentar pasos de instalación
    - Documentar configuración de báscula (RS232/TCP)
    - Documentar configuración de impresora térmica
    - Documentar variables de entorno
    - Documentar procedimientos de backup y restore
    - _Requirements: Despliegue_


- [ ] 21. Testing de integración end-to-end
  - [ ] 21.1 Configurar Playwright o Cypress para E2E
    - Instalar y configurar framework de E2E testing
    - Configurar entorno de testing con base de datos de prueba
    - Configurar mocks para báscula y impresora
    - _Requirements: Testing_

  - [ ] 21.2 Implementar tests E2E de flujos críticos
    - Test E2E: Login con credenciales válidas e inválidas
    - Test E2E: Flujo completo de pesaje con plantilla Medios
    - Test E2E: Flujo completo de pesaje con plantilla Lotes
    - Test E2E: Captura offline y sincronización al volver online
    - Test E2E: Manejo de error de impresora
    - Test E2E: Gestión de usuarios (crear, editar, desactivar)
    - Test E2E: Consulta de historial con filtros
    - Test E2E: Visualización de logs (admin)
    - _Requirements: Testing_

  - [ ]* 21.3 Ejecutar tests E2E en múltiples navegadores
    - Ejecutar en Chrome
    - Ejecutar en Firefox
    - Ejecutar en Edge

- [ ] 22. Checkpoint Final - Verificación completa del sistema
  - Ejecutar todos los tests: unitarios, property-based, integración, E2E
  - Verificar cobertura de código: backend >= 80%, frontend >= 70%
  - Verificar que no hay errores de TypeScript ni ESLint
  - Verificar que no hay vulnerabilidades de seguridad (npm audit)
  - Verificar conexión física con báscula (RS232 y TCP)
  - Verificar impresión de tickets térmicos
  - Verificar instalación de PWA en navegador
  - Verificar funcionamiento offline completo
  - Verificar sincronización automática
  - Verificar todos los requisitos funcionales y no funcionales
  - Ensure all tests pass, ask the user if questions arise.


## Notes

- Las tareas marcadas con `*` son opcionales (tests) y pueden omitirse para un MVP más rápido, aunque se recomienda implementarlas para garantizar calidad
- Cada tarea referencia requisitos específicos para trazabilidad completa
- Los checkpoints (tareas 9, 18, 22) aseguran validación incremental del progreso
- Los property-based tests validan propiedades universales de correctitud con 100+ iteraciones
- Los unit tests validan ejemplos específicos y casos borde
- El sistema usa TypeScript en backend y frontend para type safety
- La arquitectura offline-first requiere especial atención en las tareas 14.x
- La integración con hardware físico (báscula, impresora) requiere configuración específica del entorno
- Se recomienda implementar primero el backend completo (tareas 1-9), luego el frontend (tareas 10-18), y finalmente integración y despliegue (tareas 19-22)

## Property-Based Testing Configuration

**Librería:** fast-check (backend y frontend)
**Configuración:** Mínimo 100 iteraciones por test, seed-based reproducibility, shrinking habilitado
**Timeout:** 10 segundos por property test

## Test Coverage Goals

- Backend: >= 80% line coverage
- Frontend: >= 70% line coverage
- Todos los tests deben pasar antes de considerar completada cada fase

## Deployment Architecture

El sistema se despliega como aplicación monolítica con:
- Backend Node.js/Express en contenedor Docker
- Frontend Next.js (build estático o SSR) en contenedor Docker
- PostgreSQL 14+ en contenedor Docker
- Comunicación con báscula física vía RS232/TCP desde servidor
- Impresora térmica conectada al servidor vía USB/Red

## Security Checklist

- [x] HTTPS/TLS configurado
- [x] Passwords hasheados con bcrypt (factor 10)
- [x] JWT con expiración (8 horas)
- [x] Sanitización de inputs
- [x] Rate limiting en login
- [x] Headers de seguridad (HSTS, CSP, X-Frame-Options)
- [x] Prepared statements para SQL
- [x] Logs de auditoría inmutables

