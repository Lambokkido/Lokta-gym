# 2. Modelo de negocio

## Business Model Canvas

| Bloque | Contenido |
|---|---|
| **Segmentos de cliente** | (1) Gimnasios chicos/medianos sin software propio. (2) Entrenadores personales independientes. (3) Usuarios finales que entrenan solos pero quieren estructura. |
| **Propuesta de valor** | Gestión de rutinas + catálogo de ejercicios + seguimiento de progreso + roles (alumno/coach/admin) en una sola plataforma web, sin instalar nada. |
| **Canales** | Venta directa B2B a gimnasios/estudios (demo + onboarding asistido), y self-service B2C para coaches independientes (registro, prueba gratuita). |
| **Relación con clientes** | Soporte por chat/email para el admin del gimnasio; self-service para usuarios finales. |
| **Fuentes de ingreso** | Ver tabla de pricing abajo. |
| **Recursos clave** | Backend (Express/Mongo), catálogo ExerciseDB cacheado, infraestructura de auth/roles ya construida. |
| **Actividades clave** | Desarrollo de producto, soporte a gimnasios, mantenimiento del caché de ejercicios, cobros recurrentes. |
| **Socios clave** | RapidAPI (ExerciseDB), Stripe (pagos), proveedor de hosting/DB (Atlas). |
| **Estructura de costos** | Hosting (Mongo Atlas + servidor), licencia RapidAPI, fees de Stripe (~2.9% + costo fijo), soporte. |

## Pricing propuesto

| Plan | Audiencia | Precio sugerido (mensual) | Incluye |
|---|---|---|---|
| **Free** | Usuario individual | $0 | Catálogo de ejercicios, 1 rutina propia, historial básico |
| **Coach** | Entrenador independiente | USD 12–15 / mes | Rutinas ilimitadas, hasta 15 alumnos, dashboard de seguimiento |
| **Gym** | Gimnasio/estudio | USD 49–79 / mes (por sede) | Coaches ilimitados, panel admin, gestión de membresías, soporte prioritario |
| **Gym Pro** | Cadena de gimnasios | A medida | Multi-sede, reportes agregados, integraciones (control de acceso, facturación) |

> Nota: el modelo de datos actual (`User.activeMembership: Boolean`) solo soporta "activo/inactivo", no diferentes tiers. Para vender estos planes hay que extender el esquema (ver [04-arquitectura-objetivo.md](04-arquitectura-objetivo.md)).

## Competencia (referencia rápida)

| Competidor | Fortaleza | Debilidad frente a Lokta Gym |
|---|---|---|
| Trainerize | Maduro, app móvil | Caro para gimnasios chicos, complejo de onboardear |
| Excel / WhatsApp (no-software) | Gratis, ya lo usan | Cero trazabilidad, no escala con más alumnos |
| Apps de gimnasio "in-house" | A medida | Costoso de desarrollar y mantener |

Lokta Gym compite por precio + simplicidad para el segmento de gimnasios chicos/coaches independientes que hoy no pagan nada porque las alternativas son o gratis-pero-manuales o caras-y-complejas.

## Go-to-market (fases)

1. **Beta cerrada**: 3–5 gimnasios/coaches reales usando el producto gratis a cambio de feedback (valida retención y feature gaps).
2. **Lanzamiento self-service** para coaches independientes (canal más barato de adquirir).
3. **Venta B2B directa** a gimnasios una vez que el plan "Gym" tiene multi-tenant real y cobro automático.

## Unit economics (estimación inicial, a validar)

| Métrica | Supuesto inicial |
|---|---|
| CAC (coach independiente, self-service) | Bajo (~contenido + referidos), foco en producto |
| CAC (gimnasio, venta directa) | Alto — requiere demo y onboarding asistido |
| Churn objetivo (plan Gym) | < 5% mensual una vez con multi-tenant y soporte |
| LTV/CAC objetivo | > 3x antes de invertir en ads pagos |

Estos números son hipótesis de partida — el roadmap en [05-roadmap.md](05-roadmap.md) incluye una fase de beta específicamente para validarlos antes de invertir en adquisición pagada.
