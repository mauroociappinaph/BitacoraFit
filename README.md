# BitácoraFit

**BitácoraFit** es una aplicación integral para el seguimiento de la salud y el fitness, diseñada para ayudar a los usuarios a registrar sus métricas diarias, visualizar su progreso y recibir feedback personalizado de asistentes de IA (Analista, Coach, Nutricionista). La aplicación se enfoca en proporcionar datos duros y recomendaciones accionables para ajustar el comportamiento del usuario hacia sus objetivos de bienestar.

## Visión General del Proyecto

Este proyecto es una aplicación web full-stack implementada como un monorepo, utilizando Next.js para el frontend, NestJS para el backend, Supabase como base de datos y autenticación, y OpenRouter para la integración con modelos de inteligencia artificial.

## Arquitectura de Alto Nivel

El sistema se compone de un frontend (Next.js), un backend (NestJS) y servicios externos (Supabase, OpenRouter).

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

### Principios de Arquitectura

1.  **Separación de Responsabilidades**: Controllers delgados, lógica de negocio en Services, acceso a datos en Repositories, lógica pura en Domain.
2.  **Gestión de Estado**: El estado del día se recalcula o actualiza incrementalmente. `daily_logs` es la proyección actual, `daily_events` es el "event sourcing" liviano.
3.  **Seguridad**: Autenticación JWT en todos los endpoints protegidos, RLS en la base de datos y manejo de Prompt Injection.

## Fases del Roadmap

El desarrollo de BitácoraFit se divide en las siguientes fases:

*   **Fase 1: MVP (Minimum Viable Product)**: Registro de datos y almacenamiento seguro (Setup Monorepo, Supabase, `PUT /v1/daily-logs`, Despliegue inicial).
*   **Fase 2: Análisis Determinístico & Chat**: Feedback visual inmediato y reducción de fricción (Lógica determinística, Chat UI + Parsing Básico, Dashboard con gráficos).
*   **Fase 3: Inteligencia Artificial**: Feedback cualitativo personalizado (Integración OpenRouter, Orquestador AI, Personas de IA, Tests de Prompts).
*   **Fase 4: Refinamiento & Automatización**: Usabilidad avanzada (Cron Jobs, Parser Chat v2, PWA Support, Plan Versioning UI).

## Historias de Usuario Clave

BitácoraFit se centra en estas funcionalidades principales para el usuario:

*   **Registro Diario**:
    *   **US-LOG-01**: Registro de métricas vía formulario web estructurado para precisión.
    *   **US-LOG-02**: Registro rápido vía chat con lenguaje natural, con parsing inteligente de eventos.
*   **Visualización y Análisis (Dashboard)**:
    *   **US-DASH-01**: Resumen diario del progreso vs. objetivos.
    *   **US-DASH-02**: Gráfico de tendencias de peso para un enfoque a largo plazo.
*   **Feedback de Inteligencia Artificial**:
    *   **US-AI-01**: Reporte consolidado diario con opiniones de Analista, Coach y Nutricionista.
    *   **US-AI-02**: Consistencia de personalidad en las respuestas de los agentes de IA.
*   **Gestión del Plan**:
    *   **US-PLAN-01**: El sistema adapta sus objetivos basándose en cambios en el archivo `plan.yaml`.

## Tecnologías Utilizadas

*   **Monorepo**: pnpm
*   **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Recharts, Axios.
*   **Backend**: NestJS (Express), TypeScript, Zod + nestjs-zod, Swagger, Pino Logger.
*   **Base de Datos**: Supabase (Postgres, Auth, RLS).
*   **Inteligencia Artificial**: OpenRouter (para acceso a diversos modelos de IA).
*   **Control de Versiones**: Git, Conventional Commits, Husky.

## Estructura del Monorepo

El proyecto está organizado en un monorepo gestionado por pnpm, con la siguiente estructura principal:

*   `apps/`: Contiene las aplicaciones principales.
    *   `api/`: Aplicación backend (NestJS).
    *   `web/`: Aplicación frontend (Next.js).
*   `packages/`: Contiene paquetes compartidos entre las aplicaciones.
    *   `shared/`: Tipos, utilidades y constantes compartidas (TypeScript).
*   `docs/`: Documentación del proyecto.

## Configuración y Variables de Entorno

Las variables de entorno son cruciales para la configuración del proyecto y se gestionan a través de archivos `.env` (local) y GitHub Secrets (CI/CD). Algunas variables clave incluyen:

*   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`
*   `OPENROUTER_API_KEY_ANALYST`, `OPENROUTER_API_KEY_COACH`, `OPENROUTER_API_KEY_NUTRITION` (y sus backups opcionales)
*   `PORT` (para el backend), `NEXT_PUBLIC_API_URL` (para el frontend)

Para más detalles, consulte el archivo `ARCHITECTURE.md`.