# 6. Riesgos, métricas y SLAs

## Matriz de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Filtración de datos entre gimnasios (sin multi-tenant real) | Alta hoy | Alto (legal/reputacional) | Fase 1 del roadmap — bloqueante para vender a más de un gimnasio |
| Dependencia de RapidAPI/ExerciseDB (rate limits, caída, cambio de pricing) | Media | Medio | Caché ya cachea en Mongo; agregar fallback/alerta si la API externa falla |
| Brute force sobre login | Alta si hay tráfico real | Medio | Rate limiting (Fase 0) |
| Stripe webhook perdido o duplicado | Media | Alto (cobro inconsistente) | Idempotencia por `stripeEventId`, reintentos, logging de eventos crudos |
| Churn por fricción de onboarding (gimnasios no técnicos) | Alta | Alto | Beta cerrada con soporte 1:1 antes de self-service |
| Un solo desarrollador / sin tests / sin CI | Alta | Alto | Priorizar tests de los flujos de auth y billing antes de escalar features |

## KPIs / North Star

| Métrica | Por qué importa | Cómo medirla |
|---|---|---|
| **Alumnos activos por coach** (North Star) | Mide si el coach realmente adopta el producto con sus alumnos, no solo se registra | Eventos de `WorkoutLog` creados por alumnos de cada coach, semanal |
| Activación (% que crea al menos 1 rutina en 7 días) | Mide si el onboarding funciona | Cohortes por fecha de registro |
| Retención D30 de coaches | Mide si el producto genera hábito | % de coaches con login + acción en el día 30 |
| Conversión Free → Coach/Gym | Mide si el pricing tiene sentido | Eventos de upgrade vs. registros totales |
| Churn mensual (plan Gym) | Mide salud del ingreso recurrente | `Subscription.status` cancelado / activo |

## SLAs propuestos (una vez en producción con clientes pagos)

| Servicio | Objetivo |
|---|---|
| Uptime de la API | 99.5% mensual (margen razonable para un equipo chico) |
| Tiempo de respuesta de soporte (plan Gym) | < 24h hábiles |
| Backup de MongoDB | Diario, retención 7 días mínimo (Atlas lo da out-of-the-box) |
| Tiempo de respuesta API (p95) | < 500ms para endpoints de lectura sin filtros pesados |

## Supuestos a validar en la beta (Fase 3 del roadmap)

Estos números en [02-modelo-de-negocio.md](02-modelo-de-negocio.md) son hipótesis, no datos:

1. Que un gimnasio chico pague USD 49–79/mes por esto en vez de seguir con Excel/WhatsApp.
2. Que un coach independiente perciba suficiente valor para pagar antes de tener 10+ alumnos.
3. Que la fricción de migrar alumnos existentes a la plataforma no sea un bloqueante de adopción.

La beta cerrada de la Fase 3 existe específicamente para confirmar o refutar estos tres supuestos antes de invertir en adquisición pagada.
