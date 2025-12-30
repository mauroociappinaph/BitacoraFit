# BitácoraFit

**BitácoraFit** es una aplicación web personal de seguimiento fitness integral ("holística") que combina un registro diario detallado, visualización de datos (dashboard) y un equipo de asistentes de IA especializados (Coach, Nutricionista, Analista) para optimizar el rendimiento y el bienestar.

## Visión General

El propósito de BitácoraFit es permitir un registro sin fricción (vía chat o formulario) de métricas diarias y ofrecer feedback determinístico y basado en IA que sea:
- **Objetivo y neutral**: Sin juicios morales.
- **Contextual**: Basado en un plan versionado y la realidad del día.
- **Privado**: Datos propiedad del usuario.

## Stack Tecnológico

La arquitectura es un **Monorepo** gestionado con `pnpm` (workspaces).

- **Frontend**: [Next.js](https://nextjs.org) (App Router), TypeScript, Tailwind CSS, Recharts.
- **Backend**: [NestJS](https://nestjs.com) (REST API), TypeScript, Fastify (opcional) o Express.
- **Base de Datos**: [Supabase](https://supabase.com) (PostgreSQL + Auth + RLS).
- **IA**: [OpenRouter](https://openrouter.ai) (acceso unificado a modelos LLM).
- **Paquete de Gestión**: `pnpm` (Recomendado).

## Estructura del Proyecto (Monorepo)

```text
/
├── apps/
│   ├── web/          # Next.js App Router (UI, Auth, Dashboard, Chat)
│   ├── api/          # NestJS (REST API, Cron Jobs, Validations)
├── packages/
│   ├── shared/       # DTOs, Types, Zod Schemas, Constants (Shared logic)
├── docs/             # Documentación de arquitectura (Source of Truth)
├── plan.yaml         # Fuente de la verdad del plan fitness (Versionado)
└── README.md         # Este archivo
```

## Documentación (Índice)

La documentación se divide en archivos especializados para mantener la claridad y la separación de preocupaciones.

- **[USER_STORIES.md](./USER_STORIES.md)**: Historias de usuario y flujos principales.
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: **Canonical Reference** (Variables de entorno, Endpoints, Tablas, Módulos). Diseño de alto nivel.
- **[DATA_MODEL.md](./DATA_MODEL.md)**: Esquema de base de datos, RLS y definiciones de tablas.
- **[API.md](./API.md)**: Contrato de API REST, payloads y seguridad.

### Lógica y Negocio
- **[PLAN_VERSIONING.md](./PLAN_VERSIONING.md)**: Estructura y reglas del `plan.yaml`.
- **[ANALYSIS_LOGIC.md](./ANALYSIS_LOGIC.md)**: Fórmulas determinísticas, cálculo de tendencias y scores.

### Inteligencia Artificial (Personas)
- **[ANALYST_LOGIC.md](./ANALYST_LOGIC.md)**: Lógica y prompts para el Analista (Resumen objetivo).
- **[COACH_LOGIC.md](./COACH_LOGIC.md)**: Lógica y prompts para el Coach (Entrenamiento).
- **[NUTRITION_LOGIC.md](./NUTRITION_LOGIC.md)**: Lógica y prompts para el Nutricionista.

### Guías de Implementación
- **[FRONTEND.md](./FRONTEND.md)**: Guía de desarrollo UI y cliente.
- **[BACKEND.md](./BACKEND.md)**: Guía de arquitectura NestJS y capas.
- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Flujos de CI/CD, Git, y estándares de calidad.
- **[ROADMAP.md](./ROADMAP.md)**: Fases del proyecto y mejoras futuras.

## Restricciones Clave

1.  **Code Size**: Ningún archivo fuente (`.ts`, `.tsx`, `.js`) debe superar las **300 líneas**. Refactorizar si se acerca a este límite.
2.  **Modularización**: Feature-first. Módulos autocontenidos (ej: `modules/logs/`) antes que capas horizontales puras.
3.  **Números en Docs**: Usar placeholders (`<int>`, `<kg>`) para valores no estructurales. Números permitidos solo como ejemplos ilustrativos.
4.  **IA Neutra**: Todas las salidas de IA deben ser en **Español Rioplatense**, objetivas, sin juicios y sin diagnósticos médicos.

## CI/CD (Estrategia)

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles completos. Se utiliza GitHub Actions para validación continua de PRs (Lint, Test, Typecheck).
