# Analysis Logic (Deterministic)

Este documento detalla las fórmulas matemáticas y reglas lógicas que se ejecutan **antes** de llamar a la IA.
El objetivo es proveer a los agentes de datos duros ("hard facts") para que no alucinen tendencias.

## 1. Tendencia de Peso (Linear Regression)

Se calcula una regresión lineal simple ($y = mx + b$) sobre los pesos registrados en una ventana de tiempo.

- **Ventana**: Últimos `<trend_window_days>` días (Default sugerido: 14 o 30, configurable por ENV).
- **Datos**: Pares $(día, peso)$. Se ignoran días sin peso registrado.

**Fórmulas:**
- `slope` ($m$): Tendencia en kg/día. Multiplicar por 7 para kg/semana.
- `predicted_weight` (Mañana): $m \times (hoy + 1) + b$.

**Clasificación de Tendencia (Etiqueta):**
- Si $m \times 7 < -<threshold_kg>$: "Bajada Rápida"
- Si $m \times 7$ entre $-<threshold_kg>$ y $-0.1$: "Bajada Sostenida"
- Si $m \times 7$ entre $-0.1$ y $+0.1$: "Mantenimiento"
- Si $m \times 7 > +<threshold_kg>$: "Subida"

_Nota: `<threshold_kg>` es un parámetro configurable (ej: 0.5)_

## 2. Adherence Score (0-100)

Puntaje diario que mide qué tan cerca estuvo el usuario de sus targets del `plan.yaml`.

**Componentes (Pesos sugeridos, ajustables en `packages/shared`):**
- **Pasos**: 30%
- **Proteína**: 30%
- **Agua**: 20%
- **Sueño**: 20%

**Cálculo de componente individual:**
$$
ScoreComponente = \min\left(\frac{Actual}{Target}, 1.0\right) \times 100
$$
_Nota: No se premia el exceso ("overachieving") por encima del 100% para evitar distorsiones, salvo configuración específica._

**Score Total:**
$$
Adherence = (ScorePasos \times 0.3) + (ScoreProt \times 0.3) + (ScoreAgua \times 0.2) + (ScoreSueño \times 0.2)
$$

## 3. Detección de Anomalías (Flags)

Reglas heurísticas booleanas. Si se activan, se pasan en el `AiContextDTO`.

| Flag ID | Condición Lógica | Significado |
| :--- | :--- | :--- |
| `WEIGHT_SPIKE` | $PesoHoy > (PesoAyer + <weight_jump_threshold_kg>)$ | Retención de líquidos o error de medición. |
| `LOW_SLEEP` | $PromedioSueño(3dias) < <min_sleep_hours>$ | Deuda de sueño acumulada. |
| `HIGH_FATIGUE` | `steps` altos ayer + `workout` ayer + `sleep` bajo hoy | Riesgo de sobreentrenamiento. |
| `MISSING_DATA` | Si faltan > 2 métricas principales (steps, peso, etc.) | Datos incompletos, IA debe advertir. |

_Nota: Los valores con `<...>` son configurables (ej: 2kg para spike, 6h para sueño)._
