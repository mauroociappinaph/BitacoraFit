# Data Model (Supabase Postgres)

Este documento define el esquema de base de datos para **BitácoraFit**.
Debe mantenerse consistente con la [Canonical Reference](./ARCHITECTURE.md).

## Convenciones
- **Tablas**: `snake_case` (plural).
- **Columnas**: `snake_case`.
- **Primary Keys**: `id` uuid (default: `gen_random_uuid()`).
- **Foreign Keys**: `referencia_id`.
- **Timestamps**: `created_at` (default `now()`), `updated_at`.
- **Defaults numéricos**: Forman parte del diseño del esquema (no son recomendaciones).

---

## Tablas

### 1. `daily_logs`
Estado agregado del día. Fuente única de verdad para el análisis.
**Garantía**: Solo un registro por usuario por fecha.

| Columna | Tipo | Constraints | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, Default `gen_random_uuid()` | Identificador único del log |
| `user_id` | `uuid` | Not Null, Index | ID del usuario (Auth Supabase) |
| `date` | `date` | Not Null, Index | Fecha del registro (YYYY-MM-DD) |
| `steps` | `int` | Default 0 | Pasos totales |
| `weight_kg` | `numeric(5,2)` | Nullable | Peso registrado en kg |
| `water_l` | `numeric(3,2)` | Default 0 | Litros de agua consumidos |
| `sleep_hours` | `numeric(3,1)` | Nullable | Horas de sueño |
| `calories_in` | `int` | Default 0 | Calorías consumidas |
| `protein_g` | `int` | Default 0 | Proteínas (gramos) |
| `workout` | `jsonb` | Default `null` | Estructura: `{ type, completed, calories_burned, avg_bpm, minutes }` (campos opcionales según aplique) |
| `walk` | `jsonb` | Default `null` | Estructura: `{ minutes, calories_burned, avg_bpm, distance_km }` (campos opcionales según aplique) |
| `notes` | `text` | Default `""` | Notas del usuario (Untrusted) |
| `created_at` | `timestamptz` | Default `now()` | |
| `updated_at` | `timestamptz` | Default `now()` | |

**Índices y Constraints:**
- Constraint Unique: `UNIQUE (user_id, date)`

### 2. `daily_events`
Event logs append-only derivados del chat o acciones del usuario. Usado para "reconstruir" o auditar el día.
**Nota**: En tablas append-only no usamos `updated_at`.

| Columna | Tipo | Constraints | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, Default `gen_random_uuid()` | |
| `daily_log_id`| `uuid` | FK -> `daily_logs.id` | Vinculación estricta al día |
| `raw_text` | `text` | Not Null | Texto original del usuario |
| `parsed_event`| `jsonb` | Nullable | Resultado del parser `{ type, amount, unit }` |
| `author_role` | `text` | Default `'user'` | Quién generó el evento |
| `created_at` | `timestamptz` | Default `now()` | Orden cronológico de eventos |

**Índices:**
- Index en `daily_log_id`
- Index en `created_at`

### 3. `ai_outputs`
Historial de respuestas generadas por los agentes. Trazabilidad y mejora continua.
**Nota**: En tablas append-only no usamos `updated_at`.

| Columna | Tipo | Constraints | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, Default `gen_random_uuid()` | |
| `daily_log_id`| `uuid` | FK -> `daily_logs.id` | Contexto de la respuesta |
| `agent` | `text` | Not Null | `analyst`, `coach`, `nutrition` |
| `model` | `text` | Not Null | Modelo usado (string exacto del modelo OpenRouter) |
| `content` | `text` | Not Null | Respuesta en Markdown |
| `tokens` | `int` | Nullable | Tokens consumidos (aprox) |
| `is_valid` | `boolean` | Default `true` | Flag por si falla validación de formato |
| `created_at` | `timestamptz` | Default `now()` | |

---

## Row Level Security (RLS)

PostgreSQL debe tener RLS habilitado en todas las tablas.

### Políticas (Policies)

**`daily_logs`**
- `SELECT`: `auth.uid() = user_id`
- `INSERT`: `auth.uid() = user_id`
- `UPDATE`: `auth.uid() = user_id`
- `DELETE`: `auth.uid() = user_id`

**`daily_events`**
- `SELECT`: `daily_log_id IN (SELECT id FROM daily_logs WHERE user_id = auth.uid())`
- `INSERT`: Solo desde Backend usando Service Role. El backend valida ownership por JWT (sub) antes de insertar.

**`ai_outputs`**
- `SELECT`: `daily_log_id IN (SELECT id FROM daily_logs WHERE user_id = auth.uid())`
- `INSERT`: Solo Backend (Service Role). No permitir insert desde anon/authenticated roles directos.

## Migraciones (Snippets Ilustrativos)

**Nota**: Snippet ilustrativo (no prescriptivo), incompleto: muestra estructura y constraints clave.

```sql
-- Ejemplo de creación de daily_logs
create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  steps int default 0,
  weight_kg numeric(5,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, date)
);

alter table public.daily_logs enable row level security;
```
