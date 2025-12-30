# API Reference

Contrato de la API REST de **BitácoraFit**.

## Generalidades

- **Base URL**: `/v1`
- **Autenticación**: Header `Authorization: Bearer <supabase_jwt>`
- **Formatos**: JSON para requests y responses.
- **Fechas**: Formato string `YYYY-MM-DD`.

---

## Endpoints

### 1. Daily Logs

#### GET `/v1/daily-logs`
Obtiene el log agregado de una fecha específica.

**Query Params:**
- `date` (Requerido): `YYYY-MM-DD`

**Response 200 OK:**
```json
{
  "id": "uuid",
  "date": "2024-01-01",
  "steps": 5000,
  "weight_kg": 80.5,
  "water_l": 1.2,
  "workout": null,
  "notes": "Me siento cansado"
}
```
**Response 404:** No existe log para esa fecha.

#### PUT `/v1/daily-logs`
Crea o actualiza (Upsert) el log del día.

**Query Params:**
- `date` (Requerido): `YYYY-MM-DD`

**Body (Parcial permitido):**
```json
{
  "steps": 6000,
  "notes": "Caminata extra"
}
```
**Response 200 OK**: Objeto `daily_log` actualizado completo.

---

### 2. Daily Events (Chat)

#### POST `/v1/daily-events`
Punto de entrada principal para el Chat de registro.
_Side effect_: Si no existe `daily_log` para la fecha, se crea. Si el evento es parseable (ej: "Tomé agua"), se actualiza el `daily_log` automáticamente.

**Body:**
```json
{
  "date": "2024-01-01",
  "content": "Sumá 500ml de agua"
}
```

**Response 201 Created:**
```json
{
  "event": {
    "id": "uuid",
    "raw_text": "Sumá 500ml de agua",
    "parsed_event": { "type": "water", "amount": 0.5, "unit": "l" }
  },
  "daily_log": {
    "date": "2024-01-01",
    "water_l": 2.5
    // ... resto del log actualizado
  }
}
```

#### GET `/v1/daily-events`
Lista los eventos del día cronológicamente.

**Query Params:**
- `date`: `YYYY-MM-DD`

**Response 200 OK:**
```json
[
  { "id": "uuid", "raw_text": "...", "created_at": "..." }
]
```

---

### 3. Artificial Intelligence

Todos los endpoints de IA esperan un contexto implícito (el día actual o especificado) y devuelven Markdown estructurado.

#### POST `/v1/ai/daily-brief`
Orquestador. Ejecuta análisis y genera el reporte completo de los 3 agentes.

**Body:**
```json
{
  "date": "2024-01-01",
  "force_refresh": true // Opcional, para regenerar
}
```

**Response 200 OK:**
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
