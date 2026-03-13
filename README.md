# SAPID - Sistema Automatizado de Pesaje e Integración Digital

Sistema web para automatizar el proceso de pesaje de semovientes en Frigorífico Jongovito S.A.

## 🚀 Instalación Rápida

### 1. Instalar Dependencias (UN SOLO COMANDO)

Desde el directorio raíz del proyecto:

```bash
npm install
```

Este comando instala TODAS las dependencias necesarias para backend y frontend en un solo `node_modules` en la raíz.

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones.

### 3. Iniciar PostgreSQL

```bash
npm run docker:up
```

Espera 10-15 segundos para que PostgreSQL inicie completamente.

### 4. Inicializar Base de Datos

```bash
npm run db:init
```

Esto crea las tablas y el usuario administrador por defecto:
- Usuario: `admin`
- Contraseña: `admin123`

### 5. Iniciar Desarrollo

```bash
npm run dev
```

El sistema estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 📋 Comandos Disponibles

Todos los comandos se ejecutan desde la raíz del proyecto:

### Desarrollo
```bash
npm run dev              # Inicia backend y frontend
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend
```

### Build
```bash
npm run build            # Build completo
npm run build:backend    # Solo backend
npm run build:frontend   # Solo frontend
```

### Testing
```bash
npm run test             # Tests completos
npm run test:backend     # Solo backend
npm run test:frontend    # Solo frontend
```

### Linting
```bash
npm run lint             # Lint completo
npm run lint:backend     # Solo backend
npm run lint:frontend    # Solo frontend
```

### Base de Datos
```bash
npm run db:init          # Inicializar (migración + seed)
npm run db:migrate       # Solo migración
npm run db:seed          # Solo seed
```

### Docker
```bash
npm run docker:up        # Iniciar PostgreSQL
npm run docker:down      # Detener PostgreSQL
npm run docker:logs      # Ver logs
```

## 🎯 Características Principales

- **Captura Automatizada**: Integración con báscula física vía RS232/TCP
- **Offline-First**: PWA con capacidad de operación sin internet
- **Trazabilidad Completa**: Logs de auditoría centralizados
- **Tickets Automáticos**: Generación de tickets térmicos de 80mm
- **Dos Modalidades**: Pesaje individual (Medios) y acumulativo (Lotes)
- **Control de Acceso**: Autenticación JWT con roles (Administrador/Funcionario)

## 🏗️ Arquitectura

### Stack Tecnológico

- **Backend**: Node.js 18+ / Express.js / TypeScript
- **Frontend**: Next.js 14+ / React 18+ / Tailwind CSS
- **Base de Datos**: PostgreSQL 14+
- **ORM**: Sequelize
- **PWA**: next-pwa con Service Worker
- **Testing**: Vitest + fast-check (property-based testing)

### Estructura del Proyecto

```
sapid-weighing-system/
├── node_modules/          # Todas las dependencias aquí
├── backend/               # API REST Node.js/Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── database/
│   ├── package.json       # Solo scripts
│   └── tsconfig.json
├── frontend/              # PWA Next.js
│   ├── src/
│   ├── package.json       # Solo scripts
│   └── tsconfig.json
├── package.json           # Todas las dependencias
├── docker-compose.yml
└── .env.example
```

## 🔧 Configuración

### Variables de Entorno Principales

```env
# Backend
BACKEND_PORT=3001
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=8h

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sapid
DB_USER=sapid_user
DB_PASSWORD=sapid_password

# Báscula
SCALE_PROTOCOL=RS232
SCALE_PORT=/dev/ttyUSB0
SCALE_BAUD_RATE=9600

# Impresora
PRINTER_TYPE=network
PRINTER_INTERFACE=192.168.1.200
```

## 🐛 Solución de Problemas

### Error: "eslint no se reconoce como un comando"

**Solución**: Ejecuta `npm install` desde la raíz del proyecto.

### Error: "Cannot find module 'express'"

**Solución**: Ejecuta `npm install` desde la raíz del proyecto.

### Los comandos no funcionan

**Solución**: Asegúrate de estar en el directorio raíz del proyecto.

## 📦 Dependencias Incluidas

### Backend
- express, cors, helmet
- sequelize, pg
- jsonwebtoken, bcrypt
- express-validator, express-rate-limit
- serialport, node-thermal-printer
- winston

### Frontend
- next, react, react-dom
- axios, idb, zustand
- tailwindcss, next-pwa

### Testing
- vitest, fast-check
- @testing-library/react

## 📝 Notas Importantes

1. **Todas las dependencias están en la raíz**: No necesitas instalar nada en backend o frontend por separado
2. **Ejecuta comandos desde la raíz**: Todos los scripts npm deben ejecutarse desde el directorio raíz
3. **Usuario admin por defecto**: Después de `npm run db:init`, puedes iniciar sesión con admin/admin123
4. **Cambiar contraseña en producción**: El usuario admin por defecto debe cambiarse en producción

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (factor 10)
- JWT con expiración de 8 horas
- Rate limiting en endpoint de login (5 intentos/minuto)
- Validación y sanitización de entradas
- Headers de seguridad con Helmet.js

## 📚 Documentación Adicional

- `backend/DATABASE_SETUP.md` - Configuración de base de datos
- `backend/TAREA-2-COMPLETADA.md` - Detalles de implementación de BD
- `backend/TAREA-3-IMPLEMENTACION.md` - Detalles de autenticación
- `.kiro/specs/sapid-weighing-system/` - Especificaciones completas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propiedad de Frigorífico Jongovito S.A.

---

**Versión**: 1.0.0  
**Última actualización**: 2024
