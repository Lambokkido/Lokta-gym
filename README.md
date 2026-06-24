# Lokta Gym

Plataforma web fullstack para gestión de gimnasio: catálogo de ejercicios con API externa, rutinas personalizadas, seguimiento de progreso y autenticación por roles.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + Vite 8 + Tailwind CSS |
| Backend | Node.js + Express 4 |
| Base de datos | MongoDB Atlas + Mongoose 8 |
| Autenticación | JWT + bcrypt |
| Pagos | Stripe *(próximamente)* |
| API externa | ExerciseDB via RapidAPI |

## Features

- [x] Autenticación con roles: `user`, `coach`, `admin`
- [x] Catálogo de ejercicios con caché en MongoDB (ExerciseDB)
- [x] Filtros por músculo, equipamiento y rehabilitación
- [x] Rutas protegidas con JWT en backend y React Router en frontend
- [x] Rutinas personalizadas por usuario (CRUD completo)
- [x] Agregar y quitar ejercicios de una rutina
- [x] Seguimiento de progreso (historial de entrenamientos)
- [x] Dashboard de coach con asignación de rutinas a alumnos
- [x] Panel de administración (gestión de roles y membresías)
- [ ] Gestión de membresías con Stripe

## Estructura del proyecto

```
lokta-gym/
├── client/                     # Frontend React + Vite
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx            # Punto de entrada React
│       ├── App.jsx             # Definición de rutas y guards por rol
│       ├── index.css           # Tailwind CSS
│       ├── components/
│       │   └── Navbar.jsx      # Navegación con links por rol
│       ├── pages/
│       │   ├── Home.jsx        # Landing page pública
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Exercises.jsx   # Catálogo con filtros
│       │   ├── Routines.jsx    # Lista de rutinas del usuario
│       │   ├── RoutineDetail.jsx # Detalle + agregar ejercicios + completar
│       │   ├── Progress.jsx    # Historial de entrenamientos
│       │   ├── CoachDashboard.jsx # Asignar rutinas a alumnos
│       │   └── AdminPanel.jsx  # Gestión de usuarios y membresías
│       └── context/
│           └── AuthContext.jsx # Estado global de autenticación
├── server/                     # Backend Express
│   ├── index.js                # Punto de entrada del servidor
│   ├── .env.example            # Plantilla de variables de entorno
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── exerciseController.js
│   │   ├── routineController.js
│   │   ├── logController.js    # Historial de entrenamientos
│   │   └── userController.js   # Gestión de usuarios (admin)
│   ├── models/
│   │   ├── User.js
│   │   ├── Exercise.js
│   │   ├── Routine.js
│   │   └── WorkoutLog.js       # Registro de entrenamientos completados
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── exerciseRoutes.js
│   │   ├── routineRoutes.js
│   │   ├── logRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js   # protect + restrictTo
│   └── services/
│       └── exerciseService.js  # Caché ExerciseDB
├── GUIA.md                     # Guía de aprendizaje del proyecto
└── README.md
```

## Cómo correrlo localmente

### Requisitos previos

- Node.js >= 18
- Cuenta en MongoDB Atlas (gratuita)
- Cuenta en RapidAPI con acceso a ExerciseDB

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd lokta-gym
```

### 2. Configurar el backend

```bash
cd server
cp .env.example .env
# Editar .env con tus credenciales reales
npm install
npm run dev
```

El servidor queda en `http://localhost:5000`

### 3. Configurar el frontend

```bash
cd client
npm install
npm run dev
```

El cliente queda en `http://localhost:5173`

## Variables de entorno

Copiar `server/.env.example` a `server/.env` y completar:

```env
PORT=5000
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/lokta-gym
JWT_SECRET=una_cadena_larga_y_aleatoria
RAPIDAPI_KEY=tu_key_de_rapidapi
STRIPE_SECRET_KEY=sk_test_...
```

## API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Crear cuenta nueva |
| POST | `/api/auth/login` | Iniciar sesión, devuelve JWT |

### Ejercicios *(requieren JWT)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/exercises` | Todos los ejercicios |
| GET | `/api/exercises/:id` | Ejercicio por ID |
| GET | `/api/exercises/filter` | Filtrar por `?muscle=`, `?equipment=`, `?rehab=true` |

### Rutinas *(requieren JWT)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/routines` | Mis rutinas |
| POST | `/api/routines` | Crear rutina |
| PUT | `/api/routines/:id` | Actualizar rutina |
| DELETE | `/api/routines/:id` | Eliminar rutina |

### Progreso *(requieren JWT)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/logs` | Historial de entrenamientos |
| POST | `/api/logs` | Registrar entrenamiento completado |
| DELETE | `/api/logs/:id` | Eliminar registro |

### Usuarios *(requieren JWT + rol admin/coach)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listar todos los usuarios |
| PUT | `/api/users/:id/role` | Cambiar rol (solo admin) |
| PUT | `/api/users/:id/membership` | Activar/desactivar membresía (solo admin) |
