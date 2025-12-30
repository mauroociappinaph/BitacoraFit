# Analysis Logic (Deterministic)

Este documento detalla las fórmulas matemáticas y reglas lógicas que se ejecutan **antes** de llamar a la IA.
El objetivo es proveer a los agentes de datos duros ("hard facts") para que no alucinen tendencias.

## 1. Tendencia de Peso (Linear Regression)

Se calcula una regresión lineal simple ($y = mx + b$) sobre los pesos registrados en una ventana de tiempo.

- **Ventana**: Últimos <TREND_WINDOW_DAYS> días (configurable por ENV).
- **Ejemplo ilustrativo (no prescriptivo)**: 14 o 30.
- **Datos**: Pares $(día, peso)$. Se ignoran días sin peso registrado.

**Fórmulas:**
- `slope` ($m$): Tendencia en kg/día. Multiplicar por 7 para kg/semana.
- `predicted_weight` (Mañana): $m \times (hoy + 1) + b$.

**Clasificación de Tendencia (Etiqueta):**
- Si $m \times 7 < -<threshold_kg>$: "Bajada Rápida"
- Si $m \times 7$ entre $-<threshold_kg>$ y $-<trend_band_kg_per_week>$: "Bajada Sostenida"
- Si $m \times 7$ entre $-<trend_band_kg_per_week>$ y $+<trend_band_kg_per_week>$: "Mantenimiento"
- Si $m \times 7 > +<threshold_kg>$: "Subida"

_Nota: `<threshold_kg>` es un parámetro configurable (ejemplo ilustrativo: 0.5)_

## 2. Adherence Score (0-100)

Puntaje diario que mide qué tan cerca estuvo el usuario de sus targets del `plan.yaml`.

**Componentes (Pesos configurables en `packages/shared`):**
- **Pasos**: <WEIGHT_STEPS>
- **Proteína**: <WEIGHT_PROTEIN>
- **Agua**: <WEIGHT_WATER>
- **Sueño**: <WEIGHT_SLEEP>

**Regla**: Los pesos deben sumar 1.0.

**Cálculo de componente individual:**
$$
ScoreComponente = \min\left(\frac{Actual}{Target}, 1.0\right) \times 100
$$
_Nota: No se premia el exceso ("overachieving") por encima del 100% para evitar distorsiones, salvo configuración específica._
_Los valores 1.0 y 100 son constantes del cálculo del score (no prescriptivas)._

**Score Total:**
$$
Adherence = (ScorePasos \times <WEIGHT_STEPS>) + (ScoreProt \times <WEIGHT_PROTEIN>) + (ScoreAgua \times <WEIGHT_WATER>) + (ScoreSueño \times <WEIGHT_SLEEP>)
$$

## 3. Detección de Anomalías (Flags)

Reglas heurísticas booleanas. Si se activan, se pasan en el `AiContextDTO`.

| Flag ID | Condición Lógica | Significado |
| :--- | :--- | :--- |
| `WEIGHT_SPIKE` | $PesoHoy > (PesoAyer + <weight_jump_threshold_kg>)$ | Retención de líquidos o error de medición. |
| `LOW_SLEEP` | $PromedioSueño(3dias) < <min_sleep_hours>$ | Deuda de sueño acumulada. |
| `HIGH_FATIGUE` | `steps_yesterday` > <high_steps_threshold> AND `workout_yesterday.completed` = true AND `sleep_hours_today` < <min_sleep_hours> | Riesgo de sobreentrenamiento. |
| `MISSING_DATA` | Si faltan > <missing_metrics_threshold> métricas principales (steps, peso, etc.) | Datos incompletos, IA debe advertir. |

_Nota: Los valores con `<...>` son configurables (ejemplo ilustrativo: 2 kg, 6 h)._
