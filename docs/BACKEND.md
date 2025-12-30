# Backend Guide (NestJS)

Guía de implementación para `apps/api`.

## Stack

- **Framework**: NestJS (Express).
- **Lenguaje**: TypeScript Strict.
- **Validación**: `zod` + `nestjs-zod` (única validación).
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
    ├── auth/             # Auth Guard, JWT Strategy
    │   ├── auth.module.ts
    │   └── jwt.strategy.ts
    ├── logs/             # Manejo de daily_logs y CRUD
    │   ├── logs.controller.ts  # HTTP
    │   ├── logs.service.ts     # Business Logic
    │   ├── logs.repository.ts  # Database access
    │   └── logs.module.ts
    ├── events/           # Manejo de daily_events y Parsing
    │   ├── events.controller.ts
    │   ├── events.service.ts
    │   ├── events.repository.ts
    │   └── events.module.ts
    ├── plan/             # Lectura y parsing de plan.yaml
    │   ├── plan.service.ts
    │   └── plan.module.ts
    ├── analysis/         # Motor determinístico, lógica pura
    │   ├── analysis.service.ts
    │   └── analysis.module.ts
    └── ai/               # Servicios de OpenRouter, Prompts, Orquestación
        ├── ai.controller.ts
        ├── ai.service.ts
        └── ai.module.ts
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
    - Abstraen Supabase client (service role key).
    - "Buscar log por fecha y usuario".

4.  **Domain (Analysis)**:
    - Funciones puras siempre que sea posible.
    - Fácil de testear unitariamente (Input -> Output).

## Configuración y Seguridad

- **Variables de Entorno**: Usar `@nestjs/config` para cargar y validar `.env` al inicio. Fallar rápido si falta `OPENROUTER_API_KEY_*`.
- **Cors**: Configurar restringido al dominio del frontend en producción.
- **Rate Limiting**: Usar `@nestjs/throttler` con configuración por ENV.
    - Global: <global_rate_limit> req/min (configurable por ENV).
    - AI Endpoints: <ai_rate_limit> req/min (configurable por ENV, para cuidar costos/cuota).

## Logging

No loguear información sensible (PII, contenido de prompts de usuario raw).
Loguear errores con stack trace y contexto (UserID, RequestID).

## Testing

- **Unit**: Jest (`.spec.ts`). Obligatorio para `AnalysisModule`.
- **E2E**: Supertest. Obligatorio para endpoints críticos (`/daily-logs`, `/ai/daily-brief`).
