# Roadmap

Fases de implementación planificadas para **BitácoraFit**.

## Fase 1: MVP (Minimum Viable Product)
**Objetivo**: Registro de datos y almacenamiento seguro.

- [ ] Setup Monorepo (Next + Nest + Shared).
- [ ] Configuración de Supabase (Auth + Tablas Core).
- [ ] Endpoint `PUT /v1/daily-logs` y Formulario Web Básico.
- [ ] Despliegue inicial (Vercel + (Railway/Fly.io/Render)).

## Fase 2: Análisis Determinístico & Chat
**Objetivo**: Feedback visual inmediato y reducción de fricción.

- [ ] Implementación de la lógica determinística definida en `ANALYSIS_LOGIC.md` (Tendencias, Scores).
- [ ] Chat UI + Parsing Básico (Reglas Regex).
- [ ] Dashboard con gráficos de Recharts.

## Fase 3: Inteligencia Artificial
**Objetivo**: Feedback cualitativo personalizado.

- [ ] Integración OpenRouter (NestJS).
- [ ] Orquestador `POST /v1/ai/daily-brief`.
- [ ] Implementación de Personas (Analista, Coach, Nutricionista).
- [ ] Tests de Prompts.

## Fase 4: Refinamiento & Automatización
**Objetivo**: Usabilidad avanzada.

- [ ] Cron Jobs internos para alertas automáticas si falta data (no endpoints públicos).
- [ ] Mejoras en el Parser del Chat (v2 NLP más robusto, manteniendo fallback determinístico).
- [ ] PWA Support (Instalable en móvil).
- [ ] Plan Versioning UI (Editor visual de `plan.yaml`).

## Futuro (Backlog)
- [ ] Integración con wearables (Apple Health / Google Fit).
- [ ] Gamification (Rachas, Medallas).
- [ ] Modo "Offline First" (Local-first sync).
