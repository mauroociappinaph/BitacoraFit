# Contributing Guide

Estándares y procesos para colaborar en **BitácoraFit**.

## Git Workflow

Utilizamos un flujo basado en Trunk Based Development o Feature Branching simplificado.

- Rama principal: `main`
- Ramas de feature: `feat/nombre-corta`, `fix/issue-description`
- PRs: Requeridos para mergear a `main`.

### Conventional Commits

Es obligatorio usar [Conventional Commits](https://www.conventionalcommits.org/).

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Cambios en documentación (`.md`)
- `refactor`: Cambios de código que no arreglan bugs ni agregan features
- `chore`: Tareas de mantenimiento (build, deps)

Ejemplo: `feat(logs): add water intake tracking`

## Estándares de Código

Se aplican automáticamente vía ESLint y Prettier.

- **Frontend**: Reglas de React Hooks, a11y, import order.
- **Backend**: Reglas de NestJS, circular dependency prevention.
- **Formato**: Prettier (`.prettierrc`).

## CI/CD (GitHub Actions)

Cada Pull Request dispara un pipeline de validación.
La configuración reside en `.github/workflows/ci.yml`.

### Jobs

1.  **Lint & Format Check**
    ```bash
    pnpm lint
    pnpm format:check
    ```
2.  **Type Check**
    ```bash
    pnpm typecheck # tsc --noEmit en todos los workspaces
    ```
3.  **Unit Tests**
    ```bash
    pnpm test:unit # Jest
    ```
4.  **E2E API Tests**
    ```bash
    pnpm test:e2e:api # Supertest contra NestJS levantado
    ```
5.  **E2E Web Tests** (Opcional)
    - Se ejecuta solo si el PR tiene el label `run-e2e-web`.
    - Usa Playwright.
    - Evita costos y flakiness en PRs menores.

## Gestión de Secretos

- **Local**: Copiar `.env.example` a `.env`. NUNCA commitear `.env`.
- **CI**: Usar GitHub Secrets (`OPENROUTER_API_KEY`, etc.).
- **Stubs**: Para tests CI, usar valores falsos/stubs para evitar llamadas reales a APIs costosas.

## Despliegue (Deploy)

- **Frontend**: Automático al merge a `main` -> **Vercel**.
- **Backend**: Opciones documentadas para despliegue de contenedor Docker:
    - **Railway**: setup simple.
    - **Fly.io**: escalado global.
    - **Render**: opción costo-efectiva.
