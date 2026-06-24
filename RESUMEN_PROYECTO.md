# Resumen del Proyecto — Lokta Gym

## ¿Qué es?

Lokta Gym es una aplicación web fullstack para gestión de gimnasio, construida como proyecto de aprendizaje. Permite a usuarios registrarse, explorar ejercicios, armar rutinas personalizadas y registrar su progreso. Tiene sistema de roles con funcionalidades distintas para usuarios, coaches y administradores.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express 4 |
| Base de datos | MongoDB Atlas + Mongoose |
| Autenticación | JWT + bcrypt |
| API externa | ExerciseDB via RapidAPI |

---

## Arquitectura

Monorepo con dos aplicaciones independientes:

- `client/` — SPA React que corre en `localhost:5173`
- `server/` — API REST Express que corre en `localhost:5000`
- Comunicación via fetch + proxy de Vite (evita CORS en desarrollo)
- Autenticación stateless con JWT (el token viaja en el header `Authorization: Bearer`)

---

## Modelos de datos (MongoDB)

### User
```js
{ name, email, password (hashed), role: ['user','coach','admin'], activeMembership: Boolean }
```

### Exercise
```js
{ externalId, name, targetMuscle, secondaryMuscles, equipment, gifUrl, instructions, isRehabFriendly }
```
*Los ejercicios se cachean desde ExerciseDB (RapidAPI) para no llamar a la API en cada request.*

### Routine
```js
{ name, user: ObjectId, exercises: [ObjectId] }
```

### WorkoutLog
```js
{ user: ObjectId, routine: ObjectId, notes: String, createdAt: Date }
```

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/exercises               → lista completa (JWT)
GET    /api/exercises/filter        → ?muscle= &equipment= &rehab=true (JWT)
GET    /api/exercises/:id           → por ID externo (JWT)

GET    /api/routines                → mis rutinas (JWT)
POST   /api/routines                → crear (JWT) — coaches pueden pasar userId
PUT    /api/routines/:id            → actualizar nombre/ejercicios (JWT)
DELETE /api/routines/:id            → eliminar (JWT)

GET    /api/logs                    → mi historial (JWT)
POST   /api/logs                    → registrar entrenamiento (JWT)
DELETE /api/logs/:id                → eliminar registro (JWT)

GET    /api/users                   → listar usuarios (admin/coach)
PUT    /api/users/:id/role          → cambiar rol (admin)
PUT    /api/users/:id/membership    → activar membresía (admin)
```

---

## Páginas del frontend

| Ruta | Página | Acceso |
|------|--------|--------|
| `/` | Home (landing) | Público |
| `/login` | Login | Público |
| `/register` | Registro | Público |
| `/exercises` | Catálogo con filtros | Usuario logueado |
| `/routines` | Lista de rutinas | Usuario logueado |
| `/routines/:id` | Detalle de rutina (agregar/quitar ejercicios, completar) | Usuario logueado |
| `/progress` | Historial de entrenamientos | Usuario logueado |
| `/coach` | Dashboard de coach | Coach + Admin |
| `/admin` | Panel de administración | Admin |

---

## Sistema de roles

- `protect` — middleware que verifica el JWT y adjunta `req.user`
- `restrictTo(...roles)` — middleware que verifica que el rol esté permitido
- `RoleRoute` — componente React que redirige si el usuario no tiene el rol requerido
- El navbar muestra links distintos según el rol del usuario logueado

---

## Features completadas

- [x] Autenticación completa (registro, login, JWT, bcrypt)
- [x] Catálogo de ejercicios con caché en MongoDB
- [x] Filtros por músculo, equipamiento y rehabilitación
- [x] CRUD de rutinas personalizadas
- [x] Agregar/quitar ejercicios de una rutina
- [x] Completar rutina y registrar en historial
- [x] Seguimiento de progreso con estadísticas básicas
- [x] Dashboard de coach (asignar rutinas a alumnos)
- [x] Panel de admin (roles y membresías)
- [x] Diseño con Tailwind CSS (tema oscuro)
- [ ] Integración con Stripe (pagos)
- [ ] Deploy

---

## Preguntas que pueden surgir sobre el proyecto

**¿Por qué usaste JWT en vez de sesiones?**
JWT es stateless: el servidor no guarda ningún registro de quién está logueado. El token viaja en cada request y el servidor solo lo verifica con la firma. Escala mejor porque no necesitás compartir estado entre servidores.

**¿Por qué MongoDB y no SQL?**
Los ejercicios vienen de una API externa con estructura variable (arrays de strings, campos opcionales). MongoDB maneja bien esquemas flexibles. Además, el proyecto es un buen caso de uso para referencias (Routine → User, Routine → Exercise) sin necesidad de joins complejos.

**¿Qué es el patrón cache-first que usás?**
Antes de llamar a ExerciseDB, chequeamos si ya tenemos ejercicios en MongoDB. Si hay datos, los devolvemos sin llamar a la API. Esto evita superar los límites del plan gratuito y hace las respuestas mucho más rápidas.

**¿Cómo funciona Tailwind?**
Framework de CSS utilitario. Las clases se ponen directo en el JSX (`className="bg-gray-900 text-white px-4"`). No hay archivos CSS separados por componente. Vite genera solo el CSS de las clases que se usan.
