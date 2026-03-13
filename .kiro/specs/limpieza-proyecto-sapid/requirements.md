# Documento de Requisitos: Limpieza del Proyecto SAPID

## Introducción

Este documento especifica los requisitos para la limpieza y optimización del proyecto SAPID (Sistema Automatizado de Pesaje e Integración Digital). El objetivo es eliminar archivos innecesarios, optimizar la estructura de dependencias del monorepo, y mantener solo los elementos esenciales para el funcionamiento del sistema.

El proyecto SAPID es un monorepo con tres paquetes principales: backend (Node.js/Express), frontend (Next.js), y shared (tipos TypeScript compartidos). La limpieza abarca la eliminación de documentación temporal, optimización de dependencias, y verificación de integridad del proyecto.

## Glosario

- **Sistema_Limpieza**: El proceso automatizado que ejecuta las operaciones de limpieza del proyecto SAPID
- **Archivo_Innecesario**: Archivo que no contribuye al funcionamiento del sistema (documentación temporal, tests vacíos, configuraciones duplicadas)
- **Archivo_Esencial**: Archivo crítico para el funcionamiento del sistema (código fuente, configuraciones necesarias, specs activos)
- **Dependencia_Runtime**: Dependencia necesaria para la ejecución del código en producción
- **Dependencia_Desarrollo**: Dependencia necesaria solo durante el desarrollo (herramientas de testing, linting, compilación)
- **Monorepo**: Repositorio que contiene múltiples paquetes relacionados (backend, frontend, shared)
- **Package_JSON**: Archivo de configuración de npm que declara dependencias y scripts
- **Integridad_Proyecto**: Estado en el que todos los archivos esenciales existen y todas las dependencias están correctamente instaladas

## Requisitos

### Requisito 1: Eliminación de Archivos Innecesarios

**User Story:** Como desarrollador, quiero eliminar archivos innecesarios del proyecto, para mantener una estructura limpia y reducir el ruido en el repositorio.

#### Criterios de Aceptación

1. WHEN el Sistema_Limpieza identifica un Archivo_Innecesario con impacto 'ninguno', THEN el Sistema_Limpieza SHALL eliminar el archivo del sistema de archivos
2. WHEN el Sistema_Limpieza elimina un archivo, THEN el Sistema_Limpieza SHALL registrar la ruta del archivo y la razón de eliminación en un log
3. WHEN el Sistema_Limpieza encuentra un error al eliminar un archivo, THEN el Sistema_Limpieza SHALL capturar el error, registrarlo, y continuar con los demás archivos
4. WHEN el Sistema_Limpieza completa la eliminación de archivos, THEN el Sistema_Limpieza SHALL generar un reporte con la lista de archivos eliminados y errores encontrados
5. THE Sistema_Limpieza SHALL eliminar el archivo '.kiro/specs/sapid-weighing-system/TASK-1-COMPLETION.md'

### Requisito 2: Optimización de Dependencias de Desarrollo

**User Story:** Como desarrollador, quiero consolidar las dependencias de desarrollo compartidas en el package.json raíz, para evitar duplicaciones y facilitar el mantenimiento.

#### Criterios de Aceptación

1. WHEN el Sistema_Limpieza optimiza dependencias, THEN el Sistema_Limpieza SHALL mover todas las dependencias de desarrollo compartidas al package.json raíz
2. THE Sistema_Limpieza SHALL incluir en devDependencies del package.json raíz: typescript, eslint, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, vitest, @vitest/coverage-v8, prettier
3. WHEN una dependencia de desarrollo está en el package.json raíz, THEN el Sistema_Limpieza SHALL eliminarla de los package.json de los paquetes individuales
4. WHEN el Sistema_Limpieza completa la optimización, THEN el Sistema_Limpieza SHALL verificar que no existen dependencias de desarrollo duplicadas entre raíz y paquetes

### Requisito 3: Separación de Dependencias de Runtime

**User Story:** Como desarrollador, quiero que las dependencias de runtime estén solo en los paquetes que las utilizan, para mantener una separación clara de responsabilidades.

#### Criterios de Aceptación

1. WHEN el Sistema_Limpieza optimiza dependencias, THEN el Sistema_Limpieza SHALL eliminar todas las dependencias de runtime del package.json raíz
2. THE Sistema_Limpieza SHALL eliminar del package.json raíz las siguientes dependencias: express, react, react-dom, next, sequelize, pg, bcrypt, jsonwebtoken, serialport, axios, tailwindcss
3. WHEN el Sistema_Limpieza elimina una dependencia de runtime de la raíz, THEN el Sistema_Limpieza SHALL verificar que esa dependencia existe en el package.json del paquete que la utiliza
4. WHEN el Sistema_Limpieza completa la optimización, THEN el Sistema_Limpieza SHALL verificar que cada paquete tiene declaradas todas sus dependencias de runtime necesarias

### Requisito 4: Preservación de Archivos Esenciales

**User Story:** Como desarrollador, quiero garantizar que ningún archivo esencial sea eliminado durante la limpieza, para mantener la funcionalidad del sistema.

#### Criterios de Aceptación

1. WHEN el Sistema_Limpieza ejecuta cualquier operación de eliminación, THEN el Sistema_Limpieza SHALL verificar que el archivo no está en la lista de archivos esenciales antes de eliminarlo
2. THE Sistema_Limpieza SHALL preservar los siguientes archivos esenciales: package.json, backend/package.json, backend/src/index.ts, frontend/package.json, frontend/src/app/page.tsx, shared/package.json, shared/src/index.ts
3. THE Sistema_Limpieza SHALL preservar todos los archivos en .kiro/specs/sapid-weighing-system/ excepto TASK-1-COMPLETION.md
4. WHEN el Sistema_Limpieza completa todas las operaciones, THEN el Sistema_Limpieza SHALL verificar que todos los archivos esenciales siguen existiendo

### Requisito 5: Verificación de Integridad del Proyecto

**User Story:** Como desarrollador, quiero verificar la integridad del proyecto después de la limpieza, para asegurar que el sistema sigue siendo funcional.

#### Criterios de Aceptación

1. WHEN el Sistema_Limpieza completa la limpieza, THEN el Sistema_Limpieza SHALL ejecutar una verificación de integridad del proyecto
2. WHEN el Sistema_Limpieza verifica integridad, THEN el Sistema_Limpieza SHALL comprobar la existencia de todos los archivos esenciales
3. WHEN el Sistema_Limpieza verifica integridad, THEN el Sistema_Limpieza SHALL validar la sintaxis JSON de todos los archivos package.json
4. WHEN el Sistema_Limpieza verifica integridad, THEN el Sistema_Limpieza SHALL verificar que cada paquete puede instalar sus dependencias sin errores
5. WHEN la verificación de integridad detecta errores, THEN el Sistema_Limpieza SHALL generar un reporte detallado con todos los problemas encontrados

### Requisito 6: Validación de Package.json

**User Story:** Como desarrollador, quiero asegurar que todos los archivos package.json son válidos y consistentes, para evitar errores de instalación.

#### Criterios de Aceptación

1. WHEN el Sistema_Limpieza modifica un package.json, THEN el Sistema_Limpieza SHALL validar que el archivo resultante es JSON válido
2. WHEN el Sistema_Limpieza valida un package.json, THEN el Sistema_Limpieza SHALL verificar que contiene los campos obligatorios: name, version
3. WHEN un package.json declara una dependencia, THEN el Sistema_Limpieza SHALL verificar que la versión especificada es válida según semver
4. WHEN el Sistema_Limpieza detecta un package.json inválido, THEN el Sistema_Limpieza SHALL revertir los cambios y reportar el error

### Requisito 7: Manejo de Errores de Eliminación

**User Story:** Como desarrollador, quiero que el sistema maneje errores de eliminación de forma robusta, para que un error no detenga todo el proceso de limpieza.

#### Criterios de Aceptación

1. WHEN el Sistema_Limpieza no puede eliminar un archivo por permisos insuficientes, THEN el Sistema_Limpieza SHALL capturar el error, registrarlo, y continuar con los demás archivos
2. WHEN el Sistema_Limpieza no puede eliminar un archivo porque está en uso, THEN el Sistema_Limpieza SHALL capturar el error, registrarlo, y continuar con los demás archivos
3. WHEN el Sistema_Limpieza completa el proceso con errores, THEN el Sistema_Limpieza SHALL generar un reporte con todos los archivos que no pudieron eliminarse
4. WHEN el Sistema_Limpieza reporta errores de eliminación, THEN el Sistema_Limpieza SHALL incluir sugerencias para eliminación manual

### Requisito 8: Manejo de Errores de Dependencias

**User Story:** Como desarrollador, quiero que el sistema detecte y maneje errores de dependencias, para asegurar que todos los paquetes pueden instalarse correctamente.

#### Criterios de Aceptación

1. WHEN un paquete no puede instalarse después de optimizar dependencias, THEN el Sistema_Limpieza SHALL revertir los cambios en el package.json de ese paquete
2. WHEN el Sistema_Limpieza revierte cambios, THEN el Sistema_Limpieza SHALL identificar la dependencia faltante y reportarla
3. WHEN el Sistema_Limpieza detecta una dependencia faltante, THEN el Sistema_Limpieza SHALL agregarla explícitamente al package.json del paquete afectado
4. WHEN el Sistema_Limpieza agrega una dependencia faltante, THEN el Sistema_Limpieza SHALL reintentar la instalación del paquete

### Requisito 9: Registro de Operaciones

**User Story:** Como desarrollador, quiero un registro detallado de todas las operaciones de limpieza, para poder auditar los cambios realizados.

#### Criterios de Aceptación

1. WHEN el Sistema_Limpieza elimina un archivo, THEN el Sistema_Limpieza SHALL registrar: timestamp, ruta del archivo, razón de eliminación, resultado de la operación
2. WHEN el Sistema_Limpieza modifica un package.json, THEN el Sistema_Limpieza SHALL registrar: timestamp, archivo modificado, cambios realizados
3. WHEN el Sistema_Limpieza encuentra un error, THEN el Sistema_Limpieza SHALL registrar: timestamp, tipo de error, contexto, mensaje de error
4. WHEN el Sistema_Limpieza completa todas las operaciones, THEN el Sistema_Limpieza SHALL generar un reporte consolidado con todas las operaciones realizadas

### Requisito 10: Reversibilidad de Cambios

**User Story:** Como desarrollador, quiero poder revertir los cambios de limpieza si algo sale mal, para mantener la seguridad del proceso.

#### Criterios de Aceptación

1. WHEN el Sistema_Limpieza inicia el proceso de limpieza, THEN el Sistema_Limpieza SHALL verificar que existe un commit de git o backup antes de proceder
2. WHEN la verificación de integridad falla, THEN el Sistema_Limpieza SHALL proporcionar instrucciones para revertir los cambios
3. WHEN el Sistema_Limpieza detecta archivos esenciales faltantes, THEN el Sistema_Limpieza SHALL detener el proceso y sugerir restauración desde control de versiones
4. THE Sistema_Limpieza SHALL mantener la capacidad de revertir cambios en package.json mediante git

### Requisito 11: Independencia de Paquetes

**User Story:** Como desarrollador, quiero que cada paquete del monorepo pueda instalarse y ejecutarse de forma independiente, para facilitar el desarrollo modular.

#### Criterios de Aceptación

1. WHEN el Sistema_Limpieza completa la optimización, THEN cada paquete (backend, frontend, shared) SHALL poder ejecutar npm install sin errores
2. WHEN un paquete se instala de forma independiente, THEN todas sus dependencias de runtime SHALL estar disponibles en su node_modules
3. WHEN un paquete se instala de forma independiente, THEN todas sus dependencias de desarrollo necesarias SHALL estar disponibles
4. WHEN el Sistema_Limpieza verifica independencia, THEN el Sistema_Limpieza SHALL ejecutar npm install en cada paquete y verificar el código de salida

### Requisito 12: Configuraciones Específicas por Paquete

**User Story:** Como desarrollador, quiero mantener configuraciones específicas para cada paquete, para respetar las necesidades particulares de cada entorno.

#### Criterios de Aceptación

1. THE Sistema_Limpieza SHALL preservar archivos tsconfig.json separados en backend, frontend, y shared
2. THE Sistema_Limpieza SHALL preservar archivos .eslintrc.json separados en backend y frontend
3. THE Sistema_Limpieza SHALL preservar archivos vitest.config.ts separados en backend y frontend
4. WHEN el Sistema_Limpieza evalúa configuraciones, THEN el Sistema_Limpieza SHALL mantener separadas las configuraciones que tienen necesidades específicas por paquete
