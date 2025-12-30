# Historias de Usuario (User Stories)

Este documento describe los flujos funcionales principales de **BitácoraFit** desde la perspectiva del usuario.

## Roles
- **Usuario**: El dueño de la bitácora (Mauro). Único actor humano.
- **Sistema**: El backend, la base de datos y los procesos automáticos.
- **Agentes IA**: Analista, Coach, Nutricionista.

---

## 1. Registro Diario (Logging)

### US-LOG-01: Registro vía Formulario Web
**Como** usuario,
**Quiero** ingresar mis métricas del día (peso, pasos, agua, sueño) en un formulario estructurado,
**Para** asegurar la precisión de los datos cuando tengo tiempo para sentarme frente a la app.

**Criterios de Aceptación:**
- El formulario carga los datos existentes del día (si los hay) para editar.
- Validación inmediata de tipos de datos (números positivos).
- Botón "Guardar" actualiza el `daily_log` (Upsert).

### US-LOG-02: Registro vía Chat (Lenguaje Natural)
**Como** usuario,
**Quiero** escribir actualizaciones rápidas durante el día (ej: "Tomé 500ml de agua", "Caminé 30 mins"),
**Para** no depender de recordar todo hasta la noche.

**Criterios de Aceptación:**
- El sistema parsea el mensaje e identifica la intención (sumar agua, setear peso, agregar caminata).
- Si el mensaje es ambiguo, el sistema pregunta el dato faltante.
- El sistema responde con el estado actualizado (ej: "Agregado. Total agua: 1.5L").
- El mensaje original se guarda en `daily_events` para auditoría.

---

## 2. Visualización y Análisis (Dashboard)

### US-DASH-01: Ver Resumen del Día
**Como** usuario,
**Quiero** ver una tarjeta resumen con mi progreso de hoy vs. los objetivos del plan,
**Para** saber qué me falta para cumplir (ej: "Faltan 2000 pasos").

**Criterios de Aceptación:**
- Barras de progreso o indicadores visuales para: Proteína, Pasos, Agua, Sueño.
- Comparación contra los targets definidos en el `plan.yaml` vigente para la fecha.

### US-DASH-02: Ver Tendencias de Peso
**Como** usuario,
**Quiero** ver un gráfico de mi peso en los últimos 30 días con una línea de tendencia,
**Para** ignorar las fluctuaciones diarias de agua y enfocarme en la dirección real (bajada/subida).

**Criterios de Aceptación:**
- Gráfico de línea (peso real) + Línea de tendencia (regresión lineal).
- Visualización clara si la tendencia es consistente con el objetivo.

---

## 3. Feedback de Inteligencia Artificial

### US-AI-01: Generar Devolución Diaria (Daily Brief)
**Como** usuario,
**Quiero** recibir un reporte consolidado al final del día (o a demanda) con la opinión de mis 3 asistentes,
**Para** ajustar mi comportamiento para mañana.

**Criterios de Aceptación:**
- **Analista**: Muestra un resumen de métricas clave, score de adherencia (0-100) y flags de anomalías (ej: "Sueño bajo 3 días seguidos").
- **Coach**: Da feedback específico sobre el entrenamiento realizado o sugerencias de descanso si detecta fatiga.
- **Nutricionista**: Opina sobre la ingesta calórica/proteica y sugiere ajustes para la próxima comida o día.
- La generación es manual (botón "Generar Informe") o automática a una hora de corte.

### US-AI-02: Consistencia de Personalidad
**Como** usuario,
**Quiero** que el Coach sea motivador pero prudente y el Analista sea frío y directo,
**Para** distinguir claramente qué es un dato duro y qué es una recomendación blanda.

**Criterios de Aceptación:**
- El sistema utiliza prompts separados y modelos específicos para cada rol para garantizar la separación de voces.
- El lenguaje es consistentemente Español Rioplatense.

---

## 4. Gestión del Plan

### US-PLAN-01: Evolución del Plan
**Como** usuario,
**Quiero** que el sistema adapte sus objetivos basándose en cambios en el archivo de plan,
**Para** poder cambiar de fase (ej: de "pérdida de grasa" a "mantenimiento") sin perder el historial.

**Criterios de Aceptación:**
- Al cambiar la configuración en `plan.yaml` con una nueva fecha `effective_from`, los días subsiguientes usan los nuevos targets automáticamente.
- Los días anteriores mantienen su evaluación histórica con los targets viejos.
