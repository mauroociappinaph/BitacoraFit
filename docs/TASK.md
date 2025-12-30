# TASK.md - Guía de Ejecución Maestra

Este documento define la hoja de ruta técnica para la implementación end-to-end de **BitácoraFit**.

---

## CONTEXTO INICIAL
- **Stack**: Monorepo (Turbo/Pnmp), Next.js, NestJS, Supabase, OpenRouter.
- **Estado**: Repositorio con documentación. Código fuente pendiente.

---

## T-00: Inicialización del Monorepo y Estructura Base

### 1. Descripción
Configurar el workspace con pnpm, inicializar las apps (`web`, `api`) y el paquete `shared` según la estructura definida en `README.md`.

### 2. Flujo de trabajo Git
- `git checkout -b feature/setup-monorepo`

### 3. Checklist de implementación
- [ ] Inicializar `pnpm workspace` en la raíz.
- [ ] Crear estructura de directorios: `apps/web`, `apps/api`, `packages/shared`.
- [ ] Instalar dependencias globales de desarrollo (typescript, eslint, prettier).
- [ ] **Shared**: Inicializar package.json, tsconfig.json y exportar un tipo de prueba.
- [ ] **API**: Inicializar NestJS project en `apps/api` (limpiar boilerplate).
- [ ] **Web**: Inicializar Next.js project en `apps/web` (limpiar boilerplate).
- [ ] Configurar scripts en `package.json` raíz (`dev`, `build`, `lint`).

### 4. Validaciones obligatorias
- Ejecutar `pnpm build` desde la raíz y verificar éxito en todos los paquetes.
- Ejecutar `pnpm dev` y comprobar que ambos servidores (3000 y 3001/4000) levantan.

### 5. Cierre de la tarea
- `git add .`
- `git commit -m "chore: initialize monorepo structure and base apps"`
- `git push origin feature/setup-monorepo`
- Merge a develop y eliminación de rama.

---

## T-01: Shared Library y Definiciones de Base de Datos

### 1. Descripción
Implementar los tipos compartidos, esquemas Zod y constantes basados en `DATA_MODEL.md` y `API.md` para asegurar consistencia entre FE y BE.

### 2. Flujo de trabajo Git
- `git checkout -b feature/shared-definitions`

### 3. Checklist de implementación
- [ ] Definir interfaces TS para `DailyLog`, `DailyEvent`, `AiOutput` en `packages/shared`.
- [ ] Crear esquemas Zod para validación de DTOs (`CreateDailyLogDto`, `CreateEventDto`).
- [ ] Exportar constantes de configuración (ej: límites de caracteres, modelos de IA).
- [ ] Crear script SQL inicial para Supabase (tablas y RLS) según `DATA_MODEL.md` (guardar en `apps/api/prisma` o carpeta `infra/db` como referencia).

### 4. Validaciones obligatorias
- `pnpm build` en `packages/shared`.
- Importar un tipo desde `apps/api` para verificar resolución de módulos.

### 5. Cierre de la tarea
- `git add .`
- `git commit -m "feat(shared): add core types and zod schemas"`
- `git push origin feature/shared-definitions`
- Merge a develop y eliminación de rama.

---

## T-02: Backend Core - Configuración y Auth

### 1. Descripción
Configurar el esqueleto de NestJS con conexión a Supabase, validación de variables de entorno y Guard de Autenticación.

### 2. Flujo de trabajo Git
- `git checkout -b feature/backend-core`

### 3. Checklist de implementación
- [ ] Configurar `@nestjs/config` y validar variables de entorno (Supabase URL, Keys).
- [ ] Implementar `SupabaseModule` o servicio de conexión base.
- [ ] Implementar `AuthModule` con `Passport` Strategy para validar JWT de Supabase.
- [ ] Crear `AuthGuard` global (o por endpoint) para proteger rutas.
- [ ] Configurar `Pino` logger y `Swagger` base en `main.ts`.

### 4. Validaciones obligatorias
- Ejecutar endpoint de `HealthCheck` (público).
- Ejecutar endpoint protegido de prueba con un token JWT válido de Supabase (Postman/Curl).

### 5. Cierre de la tarea
- `git add .`
- `git commit -m "feat(api): setup core architecture, auth guard and config"`
- `git push origin feature/backend-core`
- Merge a develop y eliminación de rama.

---

## T-03: Backend - Módulo Daily Logs (MVP)

### 1. Descripción
Implementar el CRUD completo para `daily_logs` cumpliendo `US-LOG-01` y el contrato `API.md`.

### 2. Flujo de trabajo Git
- `git checkout -b feature/backend-logs`

### 3. Checklist de implementación
- [ ] Crear `LogsModule`, `LogsController`, `LogsService`.
- [ ] Implementar Repository para interactuar con tabla `daily_logs` de Supabase.
- [ ] Implementar `PUT /v1/daily-logs` (Upsert logic).
- [ ] Implementar `GET /v1/daily-logs`.
- [ ] Aplicar validación Zod Pipes usando esquemas de `shared`.

### 4. Validaciones obligatorias
- Tests E2E (Supertest) para PUT y GET.
- Validar que un usuario no puede leer/escribir logs de otro usuario (RLS + AuthGuard).

### 5. Cierre de la tarea
- `git add .`
- `git commit -m "feat(api): implement daily logs crud"`
- `git push origin feature/backend-logs`
- Merge a develop y eliminación de rama.

---

## T-04: Frontend Base y Daily Logs UI

### 1. Descripción
Configurar Next.js con Tailwind, Auth (Supabase Client) y crear el formulario de carga diario (`US-LOG-01`).

### 2. Flujo de trabajo Git
- `git checkout -b feature/frontend-logs`

### 3. Checklist de implementación
- [ ] Configurar `lib/supabase.ts` y `AuthContext`.
- [ ] Configurar `lib/api.ts` (Axios interceptor con Token).
- [ ] Implementar Layout principal (Sidebar/Navbar).
- [ ] Crear página `(dashboard)/logs/page.tsx` con formulario React Hook Form + Zod.
- [ ] Conectar formulario a `PUT /v1/daily-logs`.

### 4. Validaciones obligatorias
- Login exitoso en la app.
- Carga de datos en formulario se persiste en backend (verificar en DB o GET).

### 5. Cierre de la tarea
- `git add .`
- `git commit -m "feat(web): setup basic ui and daily logs form"`
- `git push origin feature/frontend-logs`
- Merge a develop y eliminación de rama.

---

## T-05: Backend - Módulo Events y Chat Parsing

### 1. Descripción
Implementar el registro de eventos (`daily_events`) y el parsing básico de texto para `US-LOG-02`.

### 2. Flujo de trabajo Git
- `git checkout -b feature/backend-chat`

### 3. Checklist de implementación
- [ ] Crear `EventsModule`.
- [ ] Implementar `POST /v1/daily-events`.
- [ ] Implementar servicio de Parsing (Regex/Heurística inicial) para detectar kg, ml, pasos.
- [ ] Implementar lógica de "Side Effect": Si el parser detecta dato, actualizar `daily_logs`.

### 4. Validaciones obligatorias
- Test Unitario del Parser: "Tomé 500ml de agua" -> `{ type: 'water', value: 500 }`.
- Test Integración: Enviar evento de texto actualiza el contador de agua en `daily_logs`.

### 5. Cierre de la tarea
- `git add .`
- `git commit -m "feat(api): implement events module and basic text parsing"`
- `git push origin feature/backend-chat`
- Merge a develop y eliminación de rama.

---

## T-06: Frontend - Chat UI

### 1. Descripción
Crear la interfaz de chat interactiva para el registro rápido según `US-LOG-02` y `FRONTEND.md`.

### 2. Flujo de trabajo Git
- `git checkout -b feature/frontend-chat`

### 3. Checklist de implementación
- [ ] Crear componente de Chat (Lista de mensajes, Input area).
- [ ] Conectar input a `POST /v1/daily-events`.
- [ ] Implementar optimistic updates para sensación de inmediatez.
- [ ] Mostrar feedback del sistema como mensajes entrantes.

### 4. Validaciones obligatorias
- Validar flujo completo: Escribir mensaje -> Aparece en chat -> Dato se actualiza en DB.

### 5. Cierre de la tarea
- `git add .`
- `git commit -m "feat(web): implement chat interface"`
- `git push origin feature/frontend-chat`
- Merge a develop y eliminación de rama.

---

## T-07: Dashboard y Análisis Determinístico

### 1. Descripción
Implementar la visualización de datos (`US-DASH-01`) y la lógica de scores en Backend.

### 2. Flujo de trabajo Git
- `git checkout -b feature/dashboard-logic`

### 3. Checklist de implementación
- [ ] **Backend**: Implementar `AnalysisModule` (Cálculo de scores, promedios).
- [ ] **Backend**: Exponer endpoint de resumen/análisis (si no es parte del GET logs).
- [ ] **Web**: Instalar `recharts`.
- [ ] **Web**: Crear componentes `DailyProgress` (Barras) y `WeightChart` (Línea).
- [ ] **Web**: Integrar en `(dashboard)/page.tsx`.

### 4. Validaciones obligatorias
- Verificar que los gráficos renderizan datos reales del backend.
- Verificar cálculos de porcentajes de progreso.

### 5. Cierre de la tarea
- `git add .`
- `git commit -m "feat(fullstack): implement analysis logic and dashboard visualization"`
- `git push origin feature/dashboard-logic`
- Merge a develop y eliminación de rama.

---

## T-08: Integración IA - Orquestador

### 1. Descripción
Implementar el servicio de conexión con OpenRouter y la orquestación de agentes (`US-AI-01`).

### 2. Flujo de trabajo Git
- `git checkout -b feature/ai-orchestrator`

### 3. Checklist de implementación
- [ ] **Backend**: Crear `AiModule`.
- [ ] Implementar servicio cliente de OpenRouter.
- [ ] Implementar `POST /v1/ai/daily-brief`.
- [ ] Construir el `SystemPrompt` base y el context builder (recolectar data del día).

### 4. Validaciones obligatorias
- Test de conexión con OpenRouter (usando un mock o request real controlado).
- Verificar manejo de errores (timeouts, rate limits).

### 5. Cierre de la tarea
- `git add .`
- `git commit -m "feat(api): implement ai orchestration service"`
- `git push origin feature/ai-orchestrator`
- Merge a develop y eliminación de rama.

---

## T-09: Definición de Personas (Prompts)

### 1. Descripción
Configurar los prompts específicos y la lógica para Analyst, Coach y Nutritionist (`US-AI-02`).

### 2. Flujo de trabajo Git
- `git checkout -b feature/ai-personas`

### 3. Checklist de implementación
- [ ] Implementar prompts en `AiModule` siguiendo `*_LOGIC.md`.
- [ ] Implementar lógica de fallback si un modelo falla.
- [ ] Formatear respuestas (Markdown cleaning).
- [ ] Frontend: Mostrar el reporte diario con pestañas para cada agente.

### 4. Validaciones obligatorias
- Generar un reporte de prueba y verificar "personalidad" de cada agente.
- Verificar que no haya alucinaciones graves sobre los datos numéricos provistos.

### 5. Cierre de la tarea
- `git add .`
- `git commit -m "feat(fullstack): implement ai personas and daily brief ui"`
- `git push origin feature/ai-personas`
- Merge a develop y eliminación de rama.
