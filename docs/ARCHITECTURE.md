# Architecture & Canonical Reference

Este documento es la **Fuente de la Verdad (Canonical Reference)** para la arquitectura técnica de **BitácoraFit**. Cualquier discrepancia entre este archivo y otro documento o implementación, **este archivo prevalece**.

## Diagrama de Alto Nivel

```mermaid
graph TD
    User((Usuario))

    subgraph "Frontend (Next.js)"
        UI[App Router UI]
        Chat[Chat Component]
        Dashboard[Dashboard Viz]
    end

    subgraph "Backend (NestJS)"
        API[API Gateway / Controllers]
        Auth[Auth Guard (Supabase)]
        Logic[Service Layer]
        Analysis[Analysis Engine (Deterministic)]
        AI_Orch[AI Orchestrator]
    end

    subgraph "Infrastructure / External"
        DB[(Supabase Postgres)]
        OR[OpenRouter API]
        Plan[plan.yaml (Repo)]
    end

    User --> UI
    UI --> API
    Chat --> API

    API --> Auth
    Auth --> Logic

    Logic --> DB
    Logic --> Analysis
    Logic --> Plan

    AI_Orch --> Analysis
    AI_Orch --> DB
    AI_Orch --> OR
```

---

# Canonical Reference

## 1. Variables de Entorno (Environment Variables)

Nombres exactos requeridos en `.env` (Backend) y `.env.local` (Frontend).

| Variable | Descripción | Ámbito |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexión a Supabase Postgres (Transaction pooler) | Backend |
| `DIRECT_URL` | URL de conexión directa a la DB (para migraciones) | Backend |
| `SUPABASE_URL` | URL del proyecto Supabase | Shared |
| `SUPABASE_ANON_KEY` | Client-side anon key | Frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key (Bypass RLS) | Backend |
| `JWT_SECRET` | Secret para validar tokens de Supabase | Backend |
| `OPENROUTER_API_KEY_ANALYST` | Key para el agente Analista | Backend |
| `OPENROUTER_API_KEY_COACH` | Key para el agente Coach | Backend |
| `OPENROUTER_API_KEY_NUTRITION` | Key para el agente Nutricionista | Backend |
| `PORT` | Puerto de la API (Default: 3000) | Backend |
| `NEXT_PUBLIC_API_URL` | URL base del backend para el frontend | Frontend |

_Nota: Puede haber claves de backup (ej: `OPENROUTER_API_KEY_ANALYST_BACKUP`) según estrategia en `*_LOGIC.md`._

## 2. Modelos de IA (Constantes)

Modelos seleccionados y sus backups. Ver `*_LOGIC.md` para detalles de uso.

| Rol | Modelo Principal | Modelo Backup (Aprox) |
| :--- | :--- | :--- |
| **Analyst** | `google/gemma-3-12b:free` | `meta-llama/llama-3.3-70b-instruct:free` |
| **Coach** | `google/gemma-3-12b:free` | `meta-llama/llama-3.3-70b-instruct:free` |
| **Nutrition** | `meta-llama/llama-3.3-70b-instruct:free` | `google/gemma-3-12b:free` |

## 3. Base de Datos (Tablas Core)

Esquema `public`. Convención `snake_case` plural. Ver [DATA_MODEL.md](./DATA_MODEL.md) para DDL completo.

| Tabla | PK | Unique Constraints | Descripción |
| :--- | :--- | :--- | :--- |
| `daily_logs` | `id` (uuid) | `(user_id, date)` | Estado agregado del día. Fuente única de verdad del progreso. |
| `daily_events` | `id` (uuid) | - | Logs de eventos del chat (raw + parsed). Append-only. |
| `ai_outputs` | `id` (uuid) | - | Historial de respuestas generadas por los agentes. Auditable. |

## 4. API Endpoints (Core)

Base path: `/v1`. Ver [API.md](./API.md) para contratos detallados.

**Daily Logging**
- `GET /v1/daily-logs?date=YYYY-MM-DD`
- `PUT /v1/daily-logs?date=YYYY-MM-DD` (Upsert parcial)

**Daily Events (Chat)**
- `POST /v1/daily-events`
- `GET /v1/daily-events?date=YYYY-MM-DD`

**Artificial Intelligence**
- `POST /v1/ai/analyst-summary`
- `POST /v1/ai/coach-message`
- `POST /v1/ai/nutrition-message`
- `POST /v1/ai/daily-brief` (Orquestador all-in-one)

## 5. Módulos NestJS (Estructura)

La aplicación backend debe organizarse siguiendo estos módulos (Feature-first).

- `AppModule` (Raíz)
- `AuthModule` (Guards, JWT Strategy)
- `LogsModule` (Manejo de `daily_logs` y CRUD)
- `EventsModule` (Manejo de `daily_events` y Parsing)
- `AnalysisModule` (Motor determinístico, puro)
- `PlanModule` (Lectura y parsing de `plan.yaml`)
- `AiModule` (Servicios de OpenRouter, Prompts, Orquestación)

## 6. Objetos de Transferencia (DTOs Compartidos)

Definidos en `packages/shared`.

- **`AiContextDTO`**: Contrato estricto y único enviado a todos los agentes.
    - `date`: string
    - `userProfile`: { name, ... }
    - `metrics`: { ... } (del `daily_log`)
    - `analysis`: { score, trends, flags }
    - `planTargets`: { steps, calories, ... } (del `plan.yaml` vigente)
    - `notes`: string (Truncado y marcado como UNTRUSTED)

---

## Principios de Arquitectura

1.  **Separación de Responsabilidades**:
    - **Controllers**: Solo ruteo HTTP, validación básica (Pipes) y llamadas a servicios.
    - **Services**: Lógica de negocio y orquestación.
    - **Repositories/Data Access**: Consultas directas a Supabase/Prisma.
    - **Domain**: Lógica pura de cálculo (Analysis) sin dependencias de I/O.

2.  **Gestión de Estado**:
    - El estado del día se recalcula o actualiza incrementalmente.
    - `daily_logs` es la proyección actual.
    - `daily_events` es el "event sourcing" liviano (log de auditoría y origen de datos complejos).

3.  **Seguridad**:
    - **Auth**: Todo endpoint (salvo health check) requiere JWT válido.
    - **RLS**: La base de datos impone seguridad a nivel de fila (`user_id`).
    - **Prompt Injection**: Los inputs de usuario (`notes`, chat) se tratan como no confiables. Se truncan y se envuelven en delimitadores XML-like en los prompts.
