# Plan Versioning (plan.yaml)

El archivo `plan.yaml` es la única fuente de la verdad para los objetivos y targets del usuario.
Está diseñado para evolucionar con el tiempo sin perder la historia.

## Estructura del Archivo

El archivo contiene una lista de revisiones del plan, ordenadas cronológicamente (aunque el sistema debe ordenarlas por fecha para procesar).

```yaml
plans:
  - effective_from: "<YYYY-MM-DD>"
    name: "Fase 1: Mantenimiento activo"
    targets:
      daily_steps: <int> # Ejemplo ilustrativo (no prescriptivo)
      daily_water_l: <number> # Ejemplo ilustrativo (no prescriptivo)
      daily_protein_g: <int> # Ejemplo ilustrativo (no prescriptivo)
      sleep_hours: <number> # Ejemplo ilustrativo (no prescriptivo)
      calories_target: <int> # Ejemplo ilustrativo (no prescriptivo)
    workout_schedule:
      monday: "Push + Caminata"
      tuesday: "Caminata Larga"
      # ... resto de la semana

  - effective_from: "<YYYY-MM-DD>"
    name: "Fase 2: Cutting agresivo"
    targets:
      daily_steps: <int> # Ejemplo ilustrativo (no prescriptivo)
      # ... targets actualizados
```

> **Nota**: Los valores numéricos anteriores son _ejemplos ilustrativos (no prescriptivos)_. No deben usarse como prescripción médica real. El usuario debe editar su `plan.yaml` con sus propios objetivos.

## Lógica de Selección ("Plan Vigente")

Para cualquier fecha `D` dada, el sistema debe seleccionar la revisión `P` tal que:

1.  `P.effective_from <= D`
2.  `P.effective_from` sea la fecha más cercana posible a `D` (la más reciente del pasado).

**Ventana de análisis**: Últimos <TREND_WINDOW_DAYS> días (configurable por ENV).
**Ejemplo ilustrativo (no prescriptivo)**: 14 o 30.

**Mantenimiento de peso**: entre -<trend_band_kg_per_week> y +<trend_band_kg_per_week>.

**Pesos de adherence**: <WEIGHT_STEPS>, <WEIGHT_PROTEIN>, <WEIGHT_WATER>, <WEIGHT_SLEEP> (suman 1.0).

**MISSING_DATA**: faltan > <missing_metrics_threshold> métricas principales.

**Algoritmo (Pseudocódigo):**

```typescript
function getEffectivePlan(date: string, allPlans: Plan[]): Plan | null {
  // 1. Filtrar planes que empezaron en o antes de la fecha
  const validPlans = allPlans.filter(p => p.effective_from <= date);

  // 2. Si no hay planes válidos, retornar null (o error de configuración)
  if (validPlans.length === 0) return null;

  // 3. Ordenar descendente por fecha (el más reciente primero)
  validPlans.sort((a, b) => b.effective_from.localeCompare(a.effective_from));

  // 4. Retornar el primero
  return validPlans[0];
}
```

## Auditoría de Cambios

Como el archivo está en el repositorio git (`plan.yaml`), la auditoría de cambios ("quién cambió el target de pasos y cuándo") se delega al historial de Git.

- **No se reescriben revisiones pasadas**: Si te equivocaste en el plan de enero y estamos en marzo, corregilo SOLO si afecta análisis históricos que quieras regenerar.
- **Cambios futuros**: Podes agregar una revisión con fecha futura (ej: el lunes que viene) y el sistema la tomará automáticamente cuando llegue el día.
