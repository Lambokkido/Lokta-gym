# 1. Resumen ejecutivo

## Problema

Los gimnasios chicos/medianos y los entrenadores independientes gestionan rutinas, progreso y alumnos con WhatsApp, Excel o papel. No hay trazabilidad del entrenamiento, el coach no tiene visibilidad agregada de sus alumnos, y el usuario final no tiene un catálogo de ejercicios confiable ni un historial de su propio progreso.

## Solución

Lokta Gym es una plataforma web donde:
- El **usuario final** accede a un catálogo de ejercicios (ExerciseDB), arma rutinas propias y registra su progreso.
- El **coach** asigna rutinas a sus alumnos y tiene un dashboard de seguimiento.
- El **admin** (dueño del gimnasio/estudio) gestiona roles y membresías.

## Propuesta de valor por segmento

| Segmento | Dolor actual | Lokta Gym resuelve |
|---|---|---|
| Usuario final | No sabe qué hacer en el gimnasio, no registra avances | Catálogo filtrable + rutinas + historial |
| Coach / personal trainer | Gestiona alumnos a mano (Excel/WhatsApp) | Dashboard de asignación y seguimiento |
| Dueño de gimnasio | No tiene control de membresías ni roles | Panel admin con roles y estado de membresía |

## Por qué ahora

- El backend ya tiene el modelo de roles (`user`/`coach`/`admin`) y JWT funcionando — el riesgo técnico de arrancar ya está mitigado.
- El catálogo de ejercicios depende de una API externa gratuita/barata (RapidAPI ExerciseDB), lo que baja el costo de adquirir contenido inicial a casi cero.
- Stripe está contemplado en el modelo de datos (`activeMembership`) aunque no implementado — el camino a monetizar ya está trazado en el código.

## Qué falta para ser vendible (no solo funcional)

Ver [03-arquitectura-actual.md](03-arquitectura-actual.md) para el detalle técnico, pero a alto nivel:
- Falta el cobro real (Stripe Checkout + webhooks).
- Falta la relación real coach↔alumno (hoy un coach ve y puede asignar rutinas a *cualquier* usuario del sistema, no solo a "los suyos").
- Falta multi-tenant: hoy no hay concepto de "gimnasio" como entidad — todos los usuarios viven en un único namespace global.

Estos tres puntos son los que separan "proyecto funcional" de "producto que un gimnasio puede pagar".
