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
├── app/                  # Rutas (Pages)
│   ├── (auth)/           # Route Group: login, callback
│   ├── (dashboard)/      # Route Group: layout protegido
│   │   ├── page.tsx      # Dashboard Home
│   │   ├── logs/         # Formulario de carga
│   │   └── chat/         # Interfaz de chat diario
│   └── api/              # Route Handlers (proxies si necesario)
├── components/
│   ├── ui/               # Componentes base (Button, Card)
│   ├── domain/           # Componentes de negocio (DailyProgress, WeightChart)
│   └── layout/           # Header, Sidebar
├── lib/
│   ├── api.ts            # Instancia de Axios configurada
│   └── supabase.ts       # Cliente Supabase Browser
├── hooks/                # Hooks custom (useDailyLog)
└── types/                # Tipos específicos de frontend
```

## Cliente API (`lib/api.ts`)

Centralizar todas las llamadas HTTP.

```typescript
import axios from "axios";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const supabase = createClientComponentClient();
  const { data } = await supabase.auth.getSession();

  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return config;
});

export default api;
```

## Autenticación

El lifecycle de auth (Login, Refresh Token) lo maneja el cliente de Supabase (`@supabase/auth-helpers-nextjs`).
El frontend solo obtiene el token y lo inyecta en los headers de Axios para hablar con el Backend NestJS.

## UI/UX

- **Diseño**: Minimalista, orientado a tarjetas ("bento grid" style).
- **Feedback**: Toasts para confirmar guardado de logs.
- **Chat**: Interfaz tipo WhatsApp/Telegram. Scroll automático al fondo. Input con autocompletado si es posible.
- **Dashboard**:
    - **Hoy**: Tarjetas grandes con métricas clave.
    - **Semana**: Gráficos pequeños (Sparklines).

## Restricciones

- **Component Size**: Componentes > 250 líneas deben dividirse.
- **Server vs Client**: Usar Server Components para data fetching inicial donde sea posible, pero dado que es una app muy interactiva (dashboard, chat), muchos componentes serán `"use client"`.
