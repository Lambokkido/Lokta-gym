# 1. Herramientas recomendadas

## Backend (server/)

| Necesidad | Herramienta | Por qué esta y no otra |
|---|---|---|
| Test runner + asserts | **Vitest** | Mismo runner que el frontend (ver README). API compatible con Jest (`describe/it/expect`), migración mental cero si alguien viene de Jest. |
| Tests de API/HTTP | **Supertest** | Estándar de facto para testear Express sin levantar un puerto real; se integra directo con `app` exportado de `index.js`. |
| Base de datos efímera | **mongodb-memory-server** | Descarga su propio binario de Mongo y lo corre en memoria por test run — cero dependencia de un Mongo real en CI, y cada test suite arranca con DB limpia. Mismo enfoque que usé manualmente para levantar el proyecto, pero automatizado por test. |
| Mock de la API externa (RapidAPI ExerciseDB) | **nock** | `exerciseService.js` usa `axios` — nock intercepta a nivel de HTTP, así los tests no dependen de que RapidAPI esté arriba ni gastan cuota real. |
| Datos de prueba | **@faker-js/faker** | Generar usuarios/rutinas realistas sin hardcodear fixtures repetidos en cada test. |
| Cobertura | **@vitest/coverage-v8** (built-in) | Sin dependencias extra; umbral sugerido 70-80% en `controllers/` y `services/`, no perseguir 100%. |
| Linting de seguridad | **eslint-plugin-security** | Detecta patrones riesgosos (regex de usuario sin escapar, como el `filterExercises` actual) antes de que lleguen a review. |

## Frontend (client/)

| Necesidad | Herramienta | Por qué esta y no otra |
|---|---|---|
| Test runner | **Vitest** | Ya comparte config con Vite (`vite.config.js`), arranca sin configuración adicional de transformación JSX/ESM. |
| Tests de componentes | **React Testing Library** | Testea comportamiento (lo que ve/hace el usuario), no implementación — encaja con componentes como `Login.jsx`, `RoutineDetail.jsx` que son básicamente formularios + fetch. |
| Mock de red en tests de componentes | **MSW (Mock Service Worker)** | Intercepta `fetch` a nivel de red, no la función `fetch` en sí — los componentes no se enteran de que están mockeados. Reusable para Storybook a futuro si se agrega. |
| E2E | **Playwright** | Ver comparación abajo. |
| Accesibilidad | **@axe-core/playwright** | Corre auditorías de a11y dentro de los mismos tests E2E — relevante porque la revisión de diseño marcó gaps de accesibilidad (labels, contraste). |
| Regresión visual (opcional, fase 2) | **Playwright `toHaveScreenshot()`** | Built-in, sin costo de servicio externo (Chromatic/Percy) hasta que el equipo crezca. |

### Playwright vs. Cypress (por qué Playwright)

| Criterio | Playwright | Cypress |
|---|---|---|
| Multi-pestaña / multi-contexto | Nativo | Limitado |
| Velocidad de ejecución paralela | Mejor (workers nativos) | Requiere plan pago para paralelizar en CI fácil |
| Interceptar y seedear vía API directamente | `request` context integrado | Requiere plugins |
| Multi-browser real (Firefox, WebKit) | Sí | Solo Chromium-based + Firefox experimental |
| Curva de aprendizaje | Similar | Similar |

Para un equipo chico que corre todo en GitHub Actions, Playwright gana por friction de CI y por su `request` API para preparar/limpiar estado de test (por ejemplo, loguearse vía API en vez de hacerlo por UI en cada test, lo que ahorra minutos de CI).

## Performance / carga

| Herramienta | Uso |
|---|---|
| **k6** | Scriptable en JS, fácil de integrar al mismo repo. Caso de uso concreto: validar que el rate limiting de `/api/auth/login` (Fase 0 del roadmap) realmente corta a partir de N intentos, y medir el p95 de `GET /api/exercises` con el catálogo completo cargado. |

## Seguridad automatizada

| Herramienta | Uso |
|---|---|
| **npm audit** / **Dependabot** | Ya gratis en GitHub, alertas de dependencias vulnerables — mínimo indispensable. |
| **OWASP ZAP (baseline scan)** | Correr contra un deploy de staging en CI nocturno, no en cada PR (es lento). Detecta lo genérico: headers faltantes, cookies sin flags, etc. — complementa, no reemplaza, los tests de IDOR específicos del dominio. |

## Resumen de paquetes a instalar

```bash
# server/
npm install -D vitest supertest mongodb-memory-server nock @faker-js/faker @vitest/coverage-v8 eslint-plugin-security

# client/
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw jsdom
npm install -D @playwright/test
npx playwright install --with-deps
```
