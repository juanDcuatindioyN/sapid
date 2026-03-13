# Documento de Requisitos - SAPID

## Introducción

El Sistema Automatizado de Pesaje e Integración Digital (SAPID) es una solución web diseñada para Frigorífico Jongovito S.A. que automatiza el proceso de pesaje de semovientes (bovinos y porcinos), eliminando la transcripción manual en papel y proporcionando trazabilidad digital completa.

### Descripción de la Necesidad

Frigorífico Jongovito S.A. enfrenta problemas críticos con el proceso manual de pesaje:
- Ineficiencia temporal y cuellos de botella operativos
- Alta propensión al error humano en la transcripción
- Presión operativa crítica en horas pico
- Inexistencia de trazabilidad digital nativa
- Impacto económico, operativo y regulatorio

### Solución SAPID - Pilares Fundamentales

1. **Captura Directa de Hardware**: Integración RS232/TCP con báscula física
2. **Arquitectura Resiliente Offline-First**: PWA con capacidad de operación sin conexión
3. **Interfaz de Alta Disponibilidad**: Next.js con latencia objetivo <1s
4. **Automatización Documental**: Tickets térmicos + base de datos centralizada PostgreSQL

### Arquitectura y Stack Tecnológico

- **Arquitectura**: Monolítica modular
- **Backend**: Node.js
- **Frontend**: Next.js (PWA)
- **Base de Datos**: PostgreSQL
- **Comunicación con Báscula**: RS232/TCP
- **Metodología**: Ágil con sprints

### Módulos del Sistema

1. Módulo de Integración con Báscula (RS232/TCP)
2. Módulo de Lógica de Negocio (Medios/Lotes, cálculos, IDs únicos)
3. Módulo de Autenticación (usuarios, roles)
4. Módulo de Persistencia (PostgreSQL)
5. Módulo de Interfaz Web (Next.js, formularios industriales)

## Glosario

- **SAPID**: Sistema Automatizado de Pesaje e Integración Digital
- **Sistema**: Referencia al sistema SAPID completo
- **Báscula**: Dispositivo físico de pesaje conectado vía RS232 o TCP
- **Módulo_Báscula**: Componente de software que gestiona la comunicación con la báscula física
- **Servicio_Autenticación**: Componente que valida credenciales y gestiona sesiones de usuario
- **Servicio_Pesaje**: Componente que orquesta el proceso de captura, validación y registro de pesajes
- **Generador_Tickets**: Componente que formatea y envía tickets a la impresora térmica
- **Base_Datos**: Base de datos PostgreSQL que persiste usuarios, pesajes y logs de auditoría
- **Administrador**: Usuario con permisos completos para gestión de usuarios y acceso total a datos
- **Funcionario**: Usuario operario con permisos para realizar pesajes y consultar historial
- **Sesión_Pesaje**: Proceso completo de pesaje que puede incluir múltiples capturas individuales
- **Captura_Peso**: Lectura individual de peso desde la báscula física
- **Impresora_Térmica**: Dispositivo de impresión de tickets de 80mm
- **Plantilla_Medios**: Formato de pesaje para animales individuales
- **Plantilla_Lotes**: Formato de pesaje acumulativo para múltiples animales
- **Metadatos**: Información obligatoria del pesaje (Código, Especie, Sexo)
- **PWA**: Progressive Web Application - aplicación web con capacidades offline

## Requerimientos Funcionales (RF)

### RF01 - Autenticación y Control de Acceso

**User Story:** Como trabajador de Frigorífico Jongovito S.A., quiero ingresar mis credenciales en la plataforma, para poder acceder al sistema de pesaje según mis permisos asignados.

#### Acceptance Criteria

1. WHEN el usuario ingresa credenciales válidas, THE Servicio_Autenticación SHALL permitir el acceso según el rol asignado (Administrador o Funcionario)
2. WHEN las credenciales son incorrectas, THE Servicio_Autenticación SHALL mostrar el mensaje "Credenciales inválidas"
3. WHEN algún campo de credenciales está vacío, THE Servicio_Autenticación SHALL solicitar completar los campos obligatorios
4. WHEN el usuario tiene estado "Inactivo" en la Base_Datos, THE Servicio_Autenticación SHALL denegar el acceso
5. THE Servicio_Autenticación SHALL generar una sesión activa con permisos específicos por perfil

### RF02 - Captura Automatizada de Peso

**User Story:** Como funcionario, quiero que el sistema capture el peso automáticamente desde la báscula física al presionar un botón, para eliminar la transcripción manual.

#### Acceptance Criteria

1. WHEN el funcionario presiona "Capturar Peso", THE Módulo_Báscula SHALL obtener el valor automáticamente desde la Báscula conectada
2. WHEN la Báscula responde correctamente, THE Sistema SHALL mostrar el peso en pantalla sin digitación manual
3. IF ocurre un error de comunicación con la Báscula, THEN THE Módulo_Báscula SHALL mostrar mensaje indicando falla de conexión
4. WHEN el valor recibido es inválido o igual a cero, THE Sistema SHALL solicitar realizar una nueva lectura
5. THE Módulo_Báscula SHALL completar la captura en un tiempo menor o igual a 2 segundos

### RF03 - Selección de Plantilla de Pesaje

**User Story:** Como funcionario, quiero seleccionar el tipo de pesaje (Medio/Lote), para que el sistema adapte los campos de entrada y el formato del ticket según la necesidad del animal.

#### Acceptance Criteria

1. WHEN el usuario selecciona "Factura de Medios", THE Sistema SHALL habilitar las celdas necesarias para Plantilla_Medios y calcular automáticamente el total parcial
2. WHEN el usuario selecciona "Factura de Lote", THE Sistema SHALL permitir registrar múltiples pesajes acumulativos usando Plantilla_Lotes
3. WHEN algún campo obligatorio de Metadatos (Código, Especie, Sexo) está vacío, THE Sistema SHALL impedir la captura del peso y resaltar los campos faltantes
4. WHEN se seleccionan los Metadatos (Especie o Sexo), THE Sistema SHALL actualizar automáticamente la vista previa del ticket
5. THE Sistema SHALL mantener la selección de plantilla durante toda la Sesión_Pesaje

### RF04 - Validación de Datos Obligatorios

**User Story:** Como funcionario, quiero que el sistema valide los datos obligatorios antes de procesar el pesaje, para asegurar que toda la información necesaria esté completa.

#### Acceptance Criteria

1. WHEN se inicia una Sesión_Pesaje, THE Servicio_Pesaje SHALL requerir el registro de Código antes de permitir captura
2. WHEN se inicia una Sesión_Pesaje, THE Servicio_Pesaje SHALL requerir la selección de Especie antes de permitir captura
3. WHEN se inicia una Sesión_Pesaje, THE Servicio_Pesaje SHALL requerir la selección de Sexo (H/M) antes de permitir captura
4. THE Servicio_Pesaje SHALL validar que todos los Metadatos estén completos antes de habilitar el botón de captura
5. WHEN todos los Metadatos están validados, THE Sistema SHALL mostrar el encabezado del pesaje libre de campos vacíos

### RF05 - Cálculo y Consolidación de Pesajes

**User Story:** Como funcionario, quiero que el sistema calcule automáticamente el peso total de los pesajes parciales, para evitar errores manuales en la sumatoria.

#### Acceptance Criteria

1. WHEN se agregan múltiples Captura_Peso a una Sesión_Pesaje, THE Servicio_Pesaje SHALL calcular la sumatoria automática de todos los pesajes parciales
2. THE Servicio_Pesaje SHALL actualizar el peso total consolidado en tiempo real después de cada Captura_Peso
3. THE Servicio_Pesaje SHALL mostrar el peso total consolidado en la interfaz sin intervención manual
4. WHEN se finaliza la Sesión_Pesaje, THE Servicio_Pesaje SHALL almacenar el peso total calculado en la Base_Datos
5. THE Servicio_Pesaje SHALL garantizar precisión decimal en los cálculos de peso (mínimo 2 decimales)

### RF06 - Emisión de Soporte Físico y Digital

**User Story:** Como funcionario, quiero finalizar el proceso de pesaje, para que el sistema guarde la información en la base de datos y genere el ticket físico de forma inmediata.

#### Acceptance Criteria

1. WHEN todos los pesos requeridos han sido capturados, THE Sistema SHALL habilitar el botón "Finalizar e Imprimir"
2. WHEN el registro se guarda correctamente en la Base_Datos, THE Servicio_Pesaje SHALL generar un ID único y sello de tiempo
3. WHEN la transacción es confirmada por el servidor, THE Generador_Tickets SHALL enviar automáticamente el formato de impresión a la Impresora_Térmica
4. THE Generador_Tickets SHALL incluir en el ticket: Código, Especie, Sexo, tipo de pesaje, peso total, fecha y nombre del operador
5. IF ocurre un error de red o de Base_Datos, THEN THE Sistema SHALL notificar el error y permitir reintentar sin perder los datos
6. THE Sistema SHALL registrar la transacción de forma persistente en la Base_Datos independientemente del estado de la impresora

## Requerimientos No Funcionales (RNF)

### RNF01 - Latencia de Captura

**User Story:** Como funcionario, quiero que el sistema responda rápidamente, para mantener la eficiencia operativa durante el proceso de pesaje.

#### Acceptance Criteria

1. THE Módulo_Báscula SHALL completar la lectura desde la Báscula hasta el registro en la interfaz web en un tiempo menor o igual a 2 segundos
2. THE Sistema SHALL mostrar retroalimentación visual al usuario dentro de 500 milisegundos después de cualquier acción
3. THE Servicio_Pesaje SHALL procesar y validar datos de entrada en menos de 1 segundo
4. WHEN la red está disponible, THE Sistema SHALL sincronizar datos con la Base_Datos en menos de 3 segundos
5. THE Sistema SHALL mantener tiempos de respuesta consistentes bajo carga operativa normal (hasta 10 usuarios concurrentes)

### RNF02 - Seguridad y Cifrado

**User Story:** Como administrador del sistema, quiero que las credenciales y datos sensibles estén protegidos, para cumplir con estándares de seguridad de la información.

#### Acceptance Criteria

1. THE Servicio_Autenticación SHALL utilizar HTTPS/TLS para todas las comunicaciones entre cliente y servidor
2. THE Servicio_Autenticación SHALL cifrar las contraseñas usando AES-256 antes de almacenarlas en la Base_Datos
3. THE Sistema SHALL implementar tokens de sesión con expiración automática después de 8 horas de inactividad
4. THE Sistema SHALL sanitizar todas las entradas de usuario para prevenir ataques de inyección SQL
5. THE Base_Datos SHALL almacenar contraseñas usando hash bcrypt con factor de trabajo mínimo de 10

### RNF03 - Usabilidad Industrial

**User Story:** Como funcionario, quiero una interfaz optimizada para el entorno industrial, para operar el sistema de manera eficiente con dispositivos de entrada estándar.

#### Acceptance Criteria

1. THE Sistema SHALL proporcionar una interfaz optimizada para pantallas de escritorio con resolución mínima de 1024x768 píxeles
2. THE Sistema SHALL permitir navegación completa usando únicamente teclado (atajos y tabulación)
3. THE Sistema SHALL permitir operación completa usando únicamente mouse
4. THE Sistema SHALL utilizar controles de interfaz con tamaño mínimo de 44x44 píxeles para facilitar la interacción
5. THE Sistema SHALL mostrar mensajes de error y confirmación de forma clara y visible en la interfaz
6. THE Sistema SHALL utilizar fuentes con tamaño mínimo de 14px para garantizar legibilidad

### RNF04 - Trazabilidad en la Nube

**User Story:** Como administrador, quiero que todas las operaciones queden registradas con información de auditoría, para poder rastrear quién realizó cada acción y cuándo.

#### Acceptance Criteria

1. WHEN un usuario realiza una autenticación exitosa, THE Sistema SHALL registrar en logs centralizados: usuario_id, timestamp, dirección IP y terminal
2. WHEN se crea una Sesión_Pesaje, THE Sistema SHALL registrar en la Base_Datos: usuario_id, timestamp, dirección IP y terminal
3. WHEN se modifica un registro de usuario, THE Sistema SHALL registrar en logs: administrador_id, acción realizada, timestamp y datos modificados
4. THE Sistema SHALL almacenar todos los logs de auditoría en la Base_Datos PostgreSQL de forma centralizada
5. THE Sistema SHALL mantener logs de auditoría por un período mínimo de 12 meses
6. WHERE el usuario autenticado es Administrador, THE Sistema SHALL permitir consultar y exportar logs de auditoría

### RNF05 - Tolerancia a Fallos (Offline-First)

**User Story:** Como funcionario, quiero que el sistema funcione incluso sin conexión a internet, para no interrumpir las operaciones cuando hay problemas de red.

#### Acceptance Criteria

1. THE Sistema SHALL implementarse como PWA (Progressive Web Application) con capacidad de instalación local
2. WHEN la conexión a internet no está disponible, THE Sistema SHALL permitir captura y registro de pesajes en almacenamiento local
3. WHEN la conexión a internet se restablece, THE Sistema SHALL sincronizar automáticamente los datos locales con la Base_Datos
4. THE Sistema SHALL notificar al usuario de forma clara cuando está operando en modo offline
5. THE Sistema SHALL almacenar en caché los recursos estáticos (HTML, CSS, JavaScript) para permitir carga sin conexión
6. THE Sistema SHALL mantener la funcionalidad completa de captura de peso en modo offline
7. WHEN ocurre un conflicto de sincronización, THE Sistema SHALL priorizar los datos más recientes según timestamp

## Historias de Usuario Detalladas

### HU-U01 - Acceso al Sistema (Login)

**Actor:** Administrador/Funcionario

**Descripción:** Como trabajador de Frigorífico Jongovito S.A., quiero ingresar mis credenciales en la plataforma, para poder acceder al sistema de pesaje según mis permisos asignados.

#### Criterios de Aceptación

1. WHEN el usuario ingresa credenciales válidas, THE Servicio_Autenticación SHALL permitir el acceso según el rol asignado (Administrador o Funcionario)
2. WHEN las credenciales son incorrectas, THE Sistema SHALL mostrar el mensaje "Credenciales inválidas"
3. WHEN algún campo está vacío, THE Sistema SHALL solicitar completar los campos obligatorios
4. WHEN el usuario tiene estado "Inactivo" en la Base_Datos, THE Sistema SHALL denegar el acceso

#### Flujo Principal

1. El usuario accede a la URL del sistema SAPID
2. El sistema muestra la pantalla de login con campos Usuario y Contraseña
3. El usuario ingresa sus credenciales
4. El usuario presiona el botón "Ingresar"
5. El sistema valida las credenciales contra la Base_Datos
6. El sistema genera una sesión activa con token JWT
7. El sistema redirige al usuario al dashboard según su rol

#### Flujo Alternativo - Credenciales Inválidas

5a. El sistema detecta que las credenciales no coinciden
5b. El sistema muestra mensaje "Credenciales inválidas"
5c. El sistema mantiene al usuario en la pantalla de login

#### Flujo Alternativo - Usuario Inactivo

5a. El sistema detecta que el usuario tiene estado "Inactivo"
5b. El sistema muestra mensaje "Usuario inactivo. Contacte al administrador"
5c. El sistema deniega el acceso

### HU-U02 - Captura de Peso Automatizada

**Actor:** Funcionario

**Descripción:** Como funcionario, quiero que el sistema capture el peso automáticamente desde la báscula física al presionar un botón, para eliminar la transcripción manual.

#### Criterios de Aceptación

1. WHEN el funcionario presiona "Capturar Peso", THE Módulo_Báscula SHALL obtener el valor automáticamente desde la Báscula conectada
2. WHEN la Báscula responde correctamente, THE Sistema SHALL mostrar el peso en pantalla sin digitación manual
3. IF ocurre un error de comunicación, THEN THE Sistema SHALL mostrar mensaje indicando falla de conexión
4. WHEN el valor recibido es inválido o igual a cero, THE Sistema SHALL solicitar realizar una nueva lectura

#### Flujo Principal

1. El funcionario completa los Metadatos obligatorios (Código, Especie, Sexo)
2. El sistema habilita el botón "Capturar Peso"
3. El funcionario presiona "Capturar Peso"
4. El sistema envía solicitud al Módulo_Báscula
5. El Módulo_Báscula lee el valor actual de la Báscula vía RS232/TCP
6. El Módulo_Báscula retorna el valor de peso en kilogramos
7. El sistema muestra el peso capturado en la interfaz
8. El sistema agrega el peso a la lista de capturas de la Sesión_Pesaje
9. El sistema actualiza el peso total consolidado

#### Flujo Alternativo - Error de Comunicación

5a. El Módulo_Báscula no puede establecer conexión con la Báscula
5b. El sistema muestra mensaje "Error de conexión con la báscula. Verifique la conexión física"
5c. El sistema permite reintentar la captura

#### Flujo Alternativo - Peso Inválido

6a. El Módulo_Báscula recibe un valor igual a cero o negativo
6b. El sistema muestra mensaje "Peso inválido. Asegúrese de que el animal esté sobre la báscula"
6c. El sistema permite realizar una nueva lectura

### HU-U03 - Selección de Plantilla de Pesaje

**Actor:** Funcionario

**Descripción:** Como funcionario, quiero seleccionar el tipo de pesaje (Medio/Lote), para que el sistema adapte los campos de entrada y el formato del ticket según la necesidad del animal.

#### Criterios de Aceptación

1. WHEN el usuario selecciona "Factura de Medios", THE Sistema SHALL habilitar las celdas necesarias y calcular automáticamente el total parcial
2. WHEN el usuario selecciona "Factura de Lote", THE Sistema SHALL permitir registrar múltiples pesajes acumulativos
3. WHEN algún campo obligatorio (Código, Especie, Sexo) está vacío, THE Sistema SHALL impedir la captura del peso y resaltar los campos faltantes
4. WHEN se seleccionan los metadatos (Especie o Sexo), THE Sistema SHALL actualizar automáticamente la vista previa del ticket

#### Flujo Principal - Plantilla de Medios

1. El funcionario accede a la pantalla de nuevo pesaje
2. El sistema muestra las opciones de plantilla: "Factura de Medios" y "Factura de Lote"
3. El funcionario selecciona "Factura de Medios"
4. El sistema adapta la interfaz para pesaje individual
5. El funcionario ingresa el Código del animal
6. El funcionario selecciona la Especie (Bovino/Porcino)
7. El funcionario selecciona el Sexo (H/M)
8. El sistema actualiza la vista previa del ticket con los metadatos
9. El sistema habilita el botón "Capturar Peso"
10. El funcionario procede con la captura de peso

#### Flujo Principal - Plantilla de Lotes

1. El funcionario accede a la pantalla de nuevo pesaje
2. El sistema muestra las opciones de plantilla: "Factura de Medios" y "Factura de Lote"
3. El funcionario selecciona "Factura de Lote"
4. El sistema adapta la interfaz para pesaje acumulativo múltiple
5. El funcionario ingresa el Código del lote
6. El funcionario selecciona la Especie (Bovino/Porcino)
7. El funcionario selecciona el Sexo (H/M)
8. El sistema actualiza la vista previa del ticket con los metadatos
9. El sistema habilita el botón "Capturar Peso"
10. El funcionario realiza múltiples capturas de peso
11. El sistema acumula los pesos y muestra el total consolidado

#### Flujo Alternativo - Campos Incompletos

9a. El sistema detecta que algún campo de Metadatos está vacío
9b. El sistema resalta los campos faltantes en color rojo
9c. El sistema mantiene deshabilitado el botón "Capturar Peso"
9d. El sistema muestra mensaje "Complete todos los campos obligatorios"

### HU-U04 - Registro Final y Emisión de Ticket

**Actor:** Funcionario

**Descripción:** Como funcionario, quiero finalizar el proceso de pesaje, para que el sistema guarde la información en la base de datos y genere el ticket físico de forma inmediata.

#### Criterios de Aceptación

1. WHEN todos los pesos requeridos han sido capturados, THE Sistema SHALL habilitar el botón "Finalizar e Imprimir"
2. WHEN el registro se guarda correctamente en la Base_Datos, THE Sistema SHALL generar un ID único y sello de tiempo
3. WHEN la transacción es confirmada por el servidor, THE Sistema SHALL enviar automáticamente el formato de impresión a la Impresora_Térmica
4. IF ocurre un error de red o de Base_Datos, THEN THE Sistema SHALL notificar el error y permitir reintentar sin perder los datos

#### Flujo Principal

1. El funcionario completa todas las capturas de peso necesarias
2. El sistema calcula el peso total consolidado
3. El sistema habilita el botón "Finalizar e Imprimir"
4. El funcionario presiona "Finalizar e Imprimir"
5. El sistema valida que todos los datos estén completos
6. El sistema genera un ID único para la transacción
7. El sistema registra el timestamp actual
8. El sistema guarda la Sesión_Pesaje en la tabla pesajes de la Base_Datos
9. El sistema guarda cada Captura_Peso en la tabla pesajes_detalle
10. El sistema registra la acción en los logs de auditoría
11. El sistema confirma la transacción exitosa
12. El Generador_Tickets formatea el ticket con todos los datos
13. El Generador_Tickets envía el ticket a la Impresora_Térmica
14. El sistema muestra mensaje "Pesaje registrado exitosamente. Ticket impreso"
15. El sistema limpia el formulario para un nuevo pesaje

#### Flujo Alternativo - Error de Base de Datos

8a. El sistema detecta un error al intentar guardar en la Base_Datos
8b. El sistema muestra mensaje "Error al guardar. Verifique la conexión"
8c. El sistema mantiene los datos en memoria
8d. El sistema habilita el botón "Reintentar"
8e. El funcionario puede reintentar el guardado sin perder los datos

#### Flujo Alternativo - Error de Impresora

13a. El Generador_Tickets detecta que la Impresora_Térmica no responde
13b. El sistema muestra mensaje "Advertencia: El pesaje fue guardado pero no se pudo imprimir el ticket"
13c. El sistema guarda el registro en la Base_Datos de todas formas
13d. El sistema permite reimprimir el ticket desde el historial

#### Flujo Alternativo - Modo Offline

8a. El sistema detecta que no hay conexión a internet
8b. El sistema guarda los datos en almacenamiento local del navegador
8c. El sistema muestra mensaje "Pesaje guardado localmente. Se sincronizará cuando haya conexión"
8d. El sistema intenta imprimir el ticket localmente
8e. Cuando se restablece la conexión, el sistema sincroniza automáticamente con la Base_Datos

## Modelo de Datos

### Tabla: usuarios

Almacena las cuentas de usuario del sistema con sus roles y estados.

**Campos:**
- id (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- nombre (VARCHAR(100), NOT NULL)
- usuario (VARCHAR(50), UNIQUE, NOT NULL)
- password (VARCHAR(255), NOT NULL) - Hash bcrypt
- rol (ENUM('administrador', 'funcionario'), NOT NULL)
- estado (ENUM('activo', 'inactivo'), DEFAULT 'activo')
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Tabla: pesajes

Almacena las sesiones de pesaje completadas.

**Campos:**
- id (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- codigo (VARCHAR(50), NOT NULL)
- especie (ENUM('bovino', 'porcino'), NOT NULL)
- sexo (ENUM('H', 'M'), NOT NULL)
- tipo_pesaje (ENUM('medios', 'lotes'), NOT NULL)
- peso_total (DECIMAL(10,2), NOT NULL)
- fecha (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- usuario_id (INTEGER, FOREIGN KEY REFERENCES usuarios(id))

### Tabla: pesajes_detalle

Almacena las capturas individuales de peso dentro de cada sesión.

**Campos:**
- id (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- pesaje_id (INTEGER, FOREIGN KEY REFERENCES pesajes(id))
- peso (DECIMAL(10,2), NOT NULL)
- fecha (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Tabla: logs

Almacena los registros de auditoría del sistema.

**Campos:**
- id (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- usuario_id (INTEGER, FOREIGN KEY REFERENCES usuarios(id))
- accion (VARCHAR(255), NOT NULL)
- fecha (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- ip (VARCHAR(45), NULL)
- terminal (VARCHAR(100), NULL)

## Notas de Implementación

### Comunicación con Báscula

El Módulo_Báscula debe implementar:
- Soporte para protocolo RS232 (puerto serial)
- Soporte para protocolo TCP/IP
- Parser específico según el fabricante de la báscula
- Manejo de timeouts y reconexión automática
- Validación de checksums si el protocolo lo requiere

### Formato de Ticket Térmico

El ticket debe incluir:
- Logo o nombre del frigorífico (opcional)
- Fecha y hora de emisión
- ID único de transacción
- Código del animal/lote
- Especie y sexo
- Tipo de pesaje (Medios/Lotes)
- Detalle de pesos individuales (si aplica)
- Peso total consolidado
- Nombre del funcionario operador
- Formato optimizado para impresora térmica de 80mm

### Sincronización Offline

La PWA debe implementar:
- Service Worker para caché de recursos estáticos
- IndexedDB para almacenamiento local de pesajes pendientes
- Background Sync API para sincronización automática
- Indicador visual claro del estado de conexión
- Cola de sincronización con reintentos automáticos
