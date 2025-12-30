# API Reference

Contrato de la API REST de **BitácoraFit**.

## Generalidades

- **Base URL**: `/v1`
- **Autenticación**: Header `Authorization: Bearer <supabase_jwt>`
- **Formatos**: JSON para requests y responses.
- **Fechas**: Formato string `YYYY-MM-DD`.
- **UserId**: Se deriva del claim `sub` del JWT de Supabase; no se acepta userId en payload.
- **Convención**: DB usa snake_case, API/DTO usa camelCase.

---

## Endpoints

### 1. Daily Logs

#### GET `/v1/daily-logs`
Obtiene el log agregado de una fecha específica.

**Query Params:**
- `date` (Requerido): `YYYY-MM-DD`

**Response 200 OK (ejemplo ilustrativo no prescriptivo):**
```json
{
  "id": "uuid",
  "date": "<YYYY-MM-DD>",
  "steps": <int>,
  "weightKg": <kg>,
  "waterL": <number>,
  "workout": null,
  "notes": "<string>"
}
```
**Response 404:** No existe log para esa fecha.

#### PUT `/v1/daily-logs`
Crea o actualiza (Upsert) el log del día.

**Query Params:**
- `date` (Requerido): `YYYY-MM-DD`

**Body (Parcial permitido, ejemplo ilustrativo no prescriptivo):**
```json
{
  "steps": <int>,
  "notes": "<string>"
}
```
**Response 200 OK**: Objeto `daily_log` actualizado completo.

---

### 2. Daily Events (Chat)

#### POST `/v1/daily-events`
Punto de entrada principal para el Chat de registro.
_Side effect_: Si no existe `daily_log` para la fecha, se crea. Si el evento es parseable (ej: "Tomé agua"), se actualiza el `daily_log` automáticamente.

**Body (ejemplo ilustrativo no prescriptivo):**
```json
{
  "date": "<YYYY-MM-DD>",
  "content": "<string>"
}
```

**Response 201 Created (ejemplo ilustrativo no prescriptivo):**
```json
{
  "event": {
    "id": "uuid",
    "dailyLogId": "uuid",
    "rawText": "<string>",
    "parsedEvent": { "type": "<intent>", "value": "<...>" },
    "createdAt": "<ISO-8601>"
  },
  "dailyLog": {
    "id": "uuid",
    "date": "<YYYY-MM-DD>",
    "waterL": <number>
    // ... resto del log actualizado
  }
}
```

**Nota de mapeo de campos:**
- Request `content` → se persiste como `raw_text` (DB) → expuesto como `rawText` (API)

#### GET `/v1/daily-events`
Lista los eventos del día cronológicamente.

**Query Params:**
- `date`: `YYYY-MM-DD`

**Response 200 OK (ejemplo ilustrativo no prescriptivo):**
```json
[
  {
    "id": "uuid",
    "dailyLogId": "uuid",
    "rawText": "<string>",
    "createdAt": "<ISO-8601>"
  }
]
```

---

### 3. Artificial Intelligence

Todos los endpoints de IA esperan un contexto determinístico basado en:
- **Usuario**: Se deriva del claim `sub` del JWT de Supabase
- **Fecha**: Se determina por el parámetro `date` en el body. Si no se envía `date`, el backend usa la fecha UTC actual YYYY-MM-DD.

#### POST `/v1/ai/daily-brief`
Orquestador. Ejecuta análisis y genera el reporte completo de los 3 agentes.

**Body (ejemplo ilustrativo no prescriptivo):**
```json
{
  "date": "<YYYY-MM-DD>",
  "forceRefresh": <boolean>
}
```

**Response 200 OK (ejemplo ilustrativo no prescriptivo):**
```json
{
  "analyst": {
    "markdown": "## Resumen\n...",
    "model": "google/gemma-3-12b:free"
  },
  "coach": {
    "markdown": "## Entrenamiento\n...",
    "model": "google/gemma-3-12b:free"
  },
  "nutrition": {
    "markdown": "## Nutrición\n...",
    "model": "meta-llama/llama-3.3-70b-instruct:free"
  }
}
```

**Nota**: El formato exacto del markdown generado por cada agente está especificado en `docs/*_LOGIC.md`. Si el formato no coincide, se aplica fallback y se registra `invalid_format`.

#### POST `/v1/ai/analyst-summary`
#### POST `/v1/ai/coach-message`
#### POST `/v1/ai/nutrition-message`

Endpoints individuales para regenerar partes específicas. Mismo body/response format (pero solo un agente).

---

## Manejo de Errores

Formato estándar de error:

```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request"
}
```

**Códigos comunes:**
- `401 Unauthorized`: Token JWT invitálido o faltante.
- `429 Too Many Requests`: Rate limit excedido (especialmente en `/ai/*`).
- `400 Bad Request`: Validación de payload fallida (Zod).
