# Backend Guide (NestJS)

Guía de implementación para `apps/api`.

## Stack

- **Framework**: NestJS (Express o Fastify).
- **Lenguaje**: TypeScript Strict.
- **Validación**: `zod` + `nestjs-zod` (recomendado) o `class-validator`.
- **Docs**: Swagger (`@nestjs/swagger`).
- **Logs**: Pino (JSON logs).

## Arquitectura por Capas

Respetar estrictamente la separación de preocupaciones documentada en [ARCHITECTURE.md](./ARCHITECTURE.md).

```text
src/
├── app.module.ts
├── main.ts
├── common/               # Guards, Interceptors, Filters, Pipes
└── modules/
    ├── logs/
    │   ├── logs.controller.ts  # HTTP
    │   ├── logs.service.ts     # Business Logic
    │   ├── logs.repository.ts  # Database access
    │   └── logs.module.ts
    ├── analysis/         # Lógica pura (sin DB dependencies directas, recibe DTOs)
    └── ai/               # OpenRouter Integration
```

## Reglas de Implementación

1.  **Controllers**:
    - Extramadamente delgados.
    - Solo trasforman HTTP -> DTO y DTO -> HTTP.
    - Manejan códigos de estado (200, 201, 404).

2.  **Services**:
    - Contienen la lógica de orquestación.
    - "Si el log no existe, créalo, luego llama al análisis, luego guarda".

3.  **Repositories**:
    - Abstraen Supabase/Prisma.
    - "Buscar log por fecha y usuario".

4.  **Domain (Analysis)**:
    - Funciones puras siempre que sea posible.
    - Fácil de testear unitariamente (Input -> Output).

## Configuración y Seguridad

- **Variables de Entorno**: Usar `@nestjs/config` para cargar y validar `.env` al inicio. Fallar rápido si falta `OPENROUTER_API_KEY_*`.
- **Cors**: Configurar restringido al dominio del frontend en producción.
- **Rate Limiting**: Usar `@nestjs/throttler`.
    - Global: 100 req/min.
    - AI Endpoints: 10 req/min (para cuidar costos/cuota).

## Logging

No loguear información sensible (PII, contenido de prompts de usuario raw).
Loguear errores con stack trace y contexto (UserID, RequestID).

## Testing

- **Unit**: Jest (`.spec.ts`). Obligatorio para `AnalysisModule`.
- **E2E**: Supertest. Obligatorio para endpoints críticos (`/daily-logs`, `/ai/daily-brief`).

## Cron Jobs (Fase 4)

- **Endpoint**: `/cron/missing-data-alert`
- **Frecuencia**: Diaria a las 20:00
- **Propósito**: Alertar al usuario si faltan datos del día
