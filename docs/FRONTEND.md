# Frontend Guide (Next.js App Router)

Guía de implementación para `apps/web`.

## Stack

- **Framework**: Next.js 14+ (App Router).
- **Lenguaje**: TypeScript Strict.
- **Estilos**: Tailwind CSS.
- **Gráficos**: Recharts.
- **State/Data**: React Query (TanStack Query) recomendado para cacheo de API.
- **HTTP**: Axios (con interceptors).

## Estructura de Carpetas

```text
apps/web/src/
├── app/                  # Rutas (App Router)
│   ├── (auth)/           # Route Group: login, callback
│   ├── (dashboard)/      # Route Group: layout protegido
│   │   ├── page.tsx      # Dashboard Home
│   │   ├── logs/         # Formulario de carga
│   │   └── chat/         # Interfaz de chat diario
│   └── api/              # Route Handlers (proxies solo si necesario por CORS/headers)
├── components/
│   ├── ui/               # Componentes base (Button, Card)
│   ├── domain/           # Componentes de negocio (DailyProgress, WeightChart)
│   └── layout/           # Header, Sidebar
├── lib/
│   ├── api.ts            # Instancia de Axios configurada
│   └── supabase.ts       # Cliente Supabase Browser
├── hooks/                # Hooks custom (useDailyLog)
└── types/                # Tipos específicos de frontend (preferir importar desde packages/shared)
```

## Cliente API (`lib/api.ts`)

Centralizar todas las llamadas HTTP.

**Configuración básica (pseudocódigo):**
```text
- Crear instancia Axios con baseURL: NEXT_PUBLIC_API_URL
- Agregar interceptor de request para inyectar JWT de Supabase
- El JWT se obtiene del cliente Supabase en el frontend
- Todos los requests usan prefijo /v1 (base path canónico)
```

**Nota**: El baseURL debe apuntar al backend y los paths usan prefijo /v1.

## Autenticación

Supabase client en frontend maneja login/refresh; el frontend adjunta el JWT al header Authorization.
El lifecycle de auth (Login, Refresh Token) lo maneja el cliente de Supabase.
El frontend solo obtiene el token y lo inyecta en los headers de Axios para hablar con el Backend NestJS.

## UI/UX

- **Diseño**: Minimalista, orientado a tarjetas ("bento grid" style).
- **Feedback**: Toasts para confirmar guardado de logs.
- **Chat**: Interfaz tipo WhatsApp/Telegram. Scroll automático al fondo. Input con autocompletado si es posible.
- **Dashboard**:
    - **Hoy**: Tarjetas grandes con métricas clave.
    - **Semana**: Gráficos pequeños (Sparklines).

## Restricciones

- **Component Size**: No superar 300 líneas; refactorizar al acercarse a 250–300.
- **Server vs Client**: Usar Server Components para data fetching inicial donde sea posible, pero dado que es una app muy interactiva (dashboard, chat), muchos componentes serán `"use client"`.
