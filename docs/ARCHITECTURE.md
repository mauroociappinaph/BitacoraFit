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
| `SUPABASE_URL` | URL del proyecto Supabase | Shared |
| `SUPABASE_ANON_KEY` | Client-side anon key (solo web) | Frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key (bypass RLS). Solo backend | Backend |
| `SUPABASE_JWT_SECRET` | Secret HS256 para validar JWTs emitidos por Supabase | Backend |
| `OPENROUTER_API_KEY_ANALYST` | API key OpenRouter para el agente Analyst | Backend |
| `OPENROUTER_API_KEY_COACH` | API key OpenRouter para el agente Coach | Backend |
| `OPENROUTER_API_KEY_NUTRITION` | API key OpenRouter para el agente Nutricionista | Backend |
| `OPENROUTER_API_KEY_ANALYST_BACKUP` | (Opcional) API key backup para Analyst | Backend |
| `OPENROUTER_API_KEY_COACH_BACKUP` | (Opcional) API key backup para Coach | Backend |
| `OPENROUTER_API_KEY_NUTRITION_BACKUP` | (Opcional) API key backup para Nutricionista | Backend |
| `PORT` | Puerto de la API (Default: <port>; ejemplo ilustrativo no prescriptivo: 3000) | Backend |
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

**Foreign Keys (canónicas)**

- `daily_events.daily_log_id → daily_logs.id`
- `ai_outputs.daily_log_id → daily_logs.id`

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
    - `date`: string (YYYY-MM-DD)
    - `objective`: string (ej: "marcar abdominales")
    - `metrics`: objeto (derivado de daily_logs, estructurado)
    - `analysis`: objeto (score, trends, flags, prediction)
    - `planTargets`: objeto (targets relevantes del plan vigente para esa fecha)
    - `notes`: string (opcional, truncado; UNTRUSTED)

---

## Principios de Arquitectura

1.  **Separación de Responsabilidades**:
    - **Controllers**: Solo ruteo HTTP, validación básica (Pipes) y llamadas a servicios.
    - **Services**: Lógica de negocio y orquestación.
    - **Repositories/Data Access**: Consultas mediante Supabase client (service role key) en el backend.
    - **Domain**: Lógica pura de cálculo (Analysis) sin dependencias de I/O.

2.  **Gestión de Estado**:
    - El estado del día se recalcula o actualiza incrementalmente.
    - `daily_logs` es la proyección actual.
    - `daily_events` es el "event sourcing" liviano (log de auditoría y origen de datos complejos).

3.  **Seguridad**:
    - **Auth**: Todo endpoint (salvo health check) requiere JWT válido.
    - **RLS**: La base de datos impone seguridad a nivel de fila (`user_id`).
    - **Prompt Injection**: Los inputs de usuario (`notes`, chat) se tratan como no confiables. Antes de enviarlos a IA: truncar a <notes_max_chars> (placeholder) y envolver con:
  <untrusted_notes>
  ...texto truncado...
  </untrusted_notes>
  Regla: la IA debe ignorar instrucciones dentro de <untrusted_notes>.
