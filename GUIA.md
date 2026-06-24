# Guía de Lokta Gym — Apuntes del Proyecto

> Este archivo se va actualizando a medida que avanzamos.
> Para exportarlo a PDF: abrilo en VS Code → clic derecho → "Open Preview" → imprimí a PDF, o instalá la extensión **Markdown PDF**.

---

## ¿Qué es este proyecto?

**Lokta Gym** es una aplicación web fullstack para gestión de un gimnasio. Tiene dos partes que se comunican entre sí:

- **Frontend (client/)**: lo que ve el usuario en el navegador. Hecho con React + Vite.
- **Backend (server/)**: el servidor que maneja los datos, la seguridad y la lógica. Hecho con Node.js + Express.

---

## Capítulo 1 — Estructura del Proyecto

### ¿Por qué separamos client/ y server/?

En una app fullstack moderna, el frontend y el backend son dos programas distintos que corren en puertos diferentes:

- El **cliente** corre en `http://localhost:5173` (puerto de Vite)
- El **servidor** corre en `http://localhost:5000` (puerto de Express)

Tenerlos en carpetas separadas nos permite:
1. Deployarlos en servicios distintos (el frontend en Vercel, el backend en Railway, por ejemplo)
2. Que cada uno tenga sus propias dependencias (`node_modules`) sin mezclarlas
3. Trabajar en uno sin tocar el otro

### La carpeta `server/`

```
server/
├── index.js          ← Punto de entrada. Arranca todo.
├── .env.example      ← Plantilla de variables de entorno
├── package.json      ← Dependencias y scripts del backend
├── controllers/      ← La lógica de cada operación (qué hace cada endpoint)
├── models/           ← La forma de los datos en MongoDB (esquemas)
├── routes/           ← Las URLs disponibles de la API
├── middleware/       ← Funciones que se ejecutan entre el request y el response
└── services/         ← Integraciones con APIs externas
```

### La carpeta `client/`

```
client/
├── index.html        ← El único HTML de toda la app (React es Single Page App)
├── vite.config.js    ← Configuración de Vite
├── package.json      ← Dependencias y scripts del frontend
└── src/
    ├── main.jsx      ← Punto de entrada de React
    ├── App.jsx       ← Define las rutas del frontend
    ├── pages/        ← Una página = una ruta visible en el navegador
    ├── components/   ← Piezas reutilizables (botones, cards, etc.)
    ├── context/      ← Estado global compartido entre páginas
    └── assets/       ← Imágenes, íconos, fuentes
```

---

## Capítulo 2 — Base de Datos: MongoDB y Mongoose

### ¿Qué es MongoDB?

MongoDB es una **base de datos NoSQL**. A diferencia de MySQL o PostgreSQL (que usan tablas con filas y columnas), MongoDB guarda los datos como **documentos JSON**.

Un usuario en MongoDB se ve así:
```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "password": "$2a$10$hasheado...",
  "role": "user",
  "activeMembership": false,
  "createdAt": "2024-06-01T10:00:00.000Z"
}
```

### ¿Qué es Mongoose?

Mongoose es una librería que nos permite usar MongoDB desde Node.js de forma más cómoda y segura. Nos deja definir **esquemas** (la "forma" que deben tener los documentos) y **modelos** (clases para interactuar con cada colección).

Sin Mongoose podríamos guardar cualquier cosa sin validar. Con Mongoose definimos reglas: "el email es obligatorio", "el rol solo puede ser user/coach/admin", etc.

### Los Modelos creados

#### `User.js`

Campos:
- `name` — nombre completo, obligatorio
- `email` — único, en minúsculas
- `password` — hasheada con bcrypt (nunca se guarda el texto plano)
- `role` — solo puede ser `"user"`, `"coach"` o `"admin"`
- `activeMembership` — booleano, `false` por defecto

**Concepto clave: pre-save hook**

```js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

Este código se ejecuta automáticamente **antes de guardar** el usuario en MongoDB. Si la contraseña fue modificada, la hashea. Así nunca guardamos contraseñas en texto plano, sin importar si el programador se olvida de hashear.

#### `Exercise.js`

Cachea los ejercicios que vienen de la API externa (ExerciseDB). ¿Por qué cacheamos? Porque cada llamada a la API externa cuesta dinero y tiempo. Si ya tenemos los datos en nuestra BD, los devolvemos de ahí.

Campos importantes:
- `externalId` — el ID original del ejercicio en ExerciseDB
- `targetMuscle` — músculo principal (ej: "chest", "biceps")
- `secondaryMuscles` — array de músculos secundarios
- `isRehabFriendly` — si es apto para rehabilitación (lo marcan coaches/admins)

#### `Routine.js`

Una rutina pertenece a un usuario y tiene ejercicios. Usamos **referencias** (ObjectId) en lugar de copiar los datos:

```js
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }]
```

Esto es como una "clave foránea" en bases de datos relacionales. En lugar de duplicar todos los datos del usuario dentro de la rutina, guardamos solo su ID y después hacemos un `.populate()` para traer los datos completos.

---

## Capítulo 3 — Autenticación: JWT y bcrypt

### El flujo completo de registro y login

```
REGISTRO:
1. Usuario envía { name, email, password }
2. Verificamos que el email no exista
3. Mongoose pre-save hook hashea la contraseña automáticamente
4. Guardamos el usuario en MongoDB
5. Generamos un JWT firmado con el ID del usuario
6. Devolvemos { token, user } al frontend

LOGIN:
1. Usuario envía { email, password }
2. Buscamos el usuario por email
3. Comparamos la contraseña ingresada con la hasheada (bcrypt.compare)
4. Si coincide, generamos un JWT
5. Devolvemos { token, user } al frontend
```

### ¿Qué es JWT?

JWT (JSON Web Token) es un token firmado digitalmente que contiene información del usuario. Se ve así:

```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY2NWYxYSJ9.signatura
```

Tiene tres partes separadas por puntos:
1. **Header** — algoritmo de firma (HS256)
2. **Payload** — datos (el ID del usuario)
3. **Signature** — verificación de que nadie lo modificó

El servidor firma el token con `JWT_SECRET`. Si alguien intenta modificar el payload, la firma no va a coincidir y el token será rechazado.

**¿Por qué no guardamos sesiones en el servidor?**

Con JWT el servidor es **stateless**: no guarda ningún registro de quién está logueado. El token viaja en cada request y el servidor simplemente lo verifica. Esto es más escalable porque podés tener múltiples servidores sin compartir estado.

### ¿Qué es bcrypt?

bcrypt es un algoritmo de hashing diseñado específicamente para contraseñas. A diferencia de MD5 o SHA256 (que son rápidos), bcrypt es **deliberadamente lento**, lo que hace los ataques de fuerza bruta mucho más costosos.

El "salt" es un valor aleatorio que se agrega a la contraseña antes de hashear:
- Sin salt: `hash("1234")` siempre da el mismo resultado → vulnerable a tablas rainbow
- Con salt: `hash("1234" + saltAleatorio)` da un resultado único cada vez

`bcrypt.genSalt(10)` genera un salt con factor de costo 10 (2^10 = 1024 iteraciones).

### El middleware de autenticación (`authMiddleware.js`)

```js
const protect = async (req, res, next) => {
  // Extrae el token del header: "Authorization: Bearer eyJ..."
  token = req.headers.authorization.split(' ')[1];
  // Verifica la firma y extrae el payload
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // Adjunta el usuario a req.user para usarlo en el controller
  req.user = await User.findById(decoded.id).select('-password');
  next();
};
```

Este middleware se usa como guardia en las rutas protegidas:
```js
router.get('/', protect, getAllExercises);
//             ↑ se ejecuta primero, si falla devuelve 401
```

---

## Capítulo 4 — API Externa: ExerciseDB

### ¿Qué es RapidAPI?

RapidAPI es un marketplace de APIs. ExerciseDB es una API disponible ahí que nos da acceso a miles de ejercicios con GIFs, instrucciones, músculos trabajados, etc.

Para usarla necesitamos:
1. Crear una cuenta en RapidAPI
2. Suscribirse a ExerciseDB (tiene plan gratuito)
3. Obtener la API Key y ponerla en `.env` como `RAPIDAPI_KEY`

### El patrón Cache-First

Nuestro `exerciseService.js` implementa un patrón muy común:

```
¿Tenemos ejercicios en MongoDB?
├── SÍ → devolvemos los de MongoDB (rápido, gratis)
└── NO → llamamos a ExerciseDB, guardamos en MongoDB, devolvemos
```

Esto se llama **cache-first** o **cache-aside**. Beneficios:
- La primera vez es lenta (llama a la API)
- Todas las siguientes son instantáneas (sale de MongoDB)
- Reducimos el uso de la API (evitamos superar límites del plan gratuito)

---

## Capítulo 5 — El Frontend: React + Vite

### ¿Qué es Vite?

Vite es un **bundler** (empaquetador) moderno que reemplaza a Create React App. Es mucho más rápido porque:
- En desarrollo usa ES Modules nativos del navegador (sin empaquetar)
- En producción usa Rollup para optimizar el bundle final

### ¿Cómo se comunica el cliente con el servidor?

Cuando el frontend hace `fetch('/api/exercises')`, Vite redirige esa petición a `http://localhost:5000/api/exercises` gracias al **proxy** que configuramos en `vite.config.js`:

```js
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
}
```

Esto evita errores de CORS en desarrollo y nos permite escribir URLs relativas (`/api/...`) en lugar de absolutas.

### React Router DOM

`react-router-dom` nos permite crear una **Single Page Application (SPA)**: el navegador nunca recarga la página. En vez de eso, React intercambia los componentes según la URL.

En `App.jsx` definimos las rutas:
```jsx
<Route path="/exercises" element={<PrivateRoute><Exercises /></PrivateRoute>} />
```

`PrivateRoute` es un guardia: si el usuario no está logueado, lo redirige a `/login`.

### El Context de Autenticación

`AuthContext.jsx` resuelve un problema clásico de React: ¿cómo comparte el estado de login entre componentes que no son padre-hijo directos?

La solución es el **Context API**:
1. `AuthProvider` envuelve toda la app y guarda el estado (`user`, `token`)
2. Cualquier componente puede acceder a ese estado con `useAuth()`
3. El token también se guarda en `localStorage` para que la sesión persista si recargás la página

---

## Capítulo 6 — Variables de Entorno

### ¿Qué son las variables de entorno?

Son valores de configuración que **no queremos hardcodear** en el código porque:
- Cambian entre entornos (development, production)
- Son secretos que no deben subirse a GitHub

Usamos el archivo `.env` (que está en `.gitignore`) y la librería `dotenv` para cargarlas:

```js
require('dotenv').config();
// Ahora podemos usar process.env.JWT_SECRET, etc.
```

El archivo `.env.example` sí se sube a GitHub como plantilla, pero sin los valores reales. Cada desarrollador crea su propio `.env` localmente.

### Variables del proyecto

| Variable | Dónde se usa | Ejemplo |
|----------|-------------|---------|
| `PORT` | Express listen | `5000` |
| `MONGO_URI` | Conexión MongoDB | `mongodb://localhost:27017/lokta-gym` |
| `JWT_SECRET` | Firmar/verificar tokens | `una_cadena_larga_y_aleatoria` |
| `STRIPE_SECRET_KEY` | Pagos (próximamente) | `sk_test_...` |
| `RAPIDAPI_KEY` | ExerciseDB | `tu_key_de_rapidapi` |

---

## Capítulo 7 — Dependencias Instaladas

### Backend (`server/`)

| Paquete | Para qué sirve |
|---------|---------------|
| `express` | El framework HTTP. Maneja requests y responses. |
| `cors` | Permite que el frontend (otro dominio/puerto) haga peticiones al backend. |
| `mongoose` | ORM para MongoDB. Define esquemas y modelos. |
| `dotenv` | Carga el archivo `.env` como variables de entorno. |
| `bcryptjs` | Hashea y verifica contraseñas de forma segura. |
| `jsonwebtoken` | Genera y verifica tokens JWT. |
| `axios` | Hace peticiones HTTP a APIs externas (ExerciseDB). |
| `nodemon` *(dev)* | Reinicia el servidor automáticamente cuando guardás cambios. |

### Frontend (`client/`)

| Paquete | Para qué sirve |
|---------|---------------|
| `react` | La librería para construir interfaces con componentes. |
| `react-dom` | Conecta React con el DOM del navegador. |
| `react-router-dom` | Navegación entre páginas sin recargar (SPA). |
| `vite` *(dev)* | Servidor de desarrollo y bundler para producción. |
| `@vitejs/plugin-react` *(dev)* | Plugin que le permite a Vite entender JSX y React. |
| `tailwindcss` *(dev)* | Framework de CSS utilitario para estilizar componentes. |
| `@tailwindcss/vite` *(dev)* | Plugin que integra Tailwind con Vite. |

---

## Capítulo 8 — Rutinas: CRUD completo

### ¿Qué es CRUD?

CRUD son las 4 operaciones básicas sobre datos:

| Letra | Operación | HTTP | Ejemplo |
|-------|-----------|------|---------|
| C | Create (Crear) | POST | Crear una rutina |
| R | Read (Leer) | GET | Ver mis rutinas |
| U | Update (Actualizar) | PUT | Renombrar una rutina |
| D | Delete (Eliminar) | DELETE | Borrar una rutina |

### Endpoints de rutinas

```
GET    /api/routines        → devuelve todas las rutinas del usuario logueado
POST   /api/routines        → crea una rutina nueva
PUT    /api/routines/:id    → actualiza nombre o ejercicios de una rutina
DELETE /api/routines/:id    → elimina una rutina
```

Todas requieren el JWT en el header: `Authorization: Bearer <token>`

### Seguridad: el usuario solo ve sus propias rutinas

En el controller, siempre filtramos por `user: req.user._id`:

```js
// Solo devuelve rutinas donde el campo "user" coincide con el usuario del token
const routines = await Routine.find({ user: req.user._id });
```

Esto garantiza que un usuario nunca pueda ver ni modificar las rutinas de otro, aunque conozca el ID.

### `.populate()` en Mongoose

Las rutinas guardan los ejercicios como IDs (referencias). Para traer los datos completos usamos `.populate()`:

```js
await Routine.find({ user: req.user._id }).populate('exercises', 'name targetMuscle equipment');
//                                                   ↑ campo    ↑ campos que queremos traer
```

Sin `.populate()` recibiríamos solo `["665f1a...", "665f1b..."]`.
Con `.populate()` recibimos los objetos completos de cada ejercicio.

---

## Capítulo 9 — Estilos con Tailwind CSS

### ¿Qué es Tailwind?

Tailwind es un framework de CSS **utilitario**. En vez de escribir clases con nombres semánticos como `.card` o `.navbar` y luego definir su CSS en un archivo separado, Tailwind te da clases pequeñas que hacen una sola cosa:

```jsx
// Sin Tailwind — necesitás un archivo CSS con la clase .boton
<button className="boton">Guardar</button>

// Con Tailwind — el estilo está directamente en el JSX
<button className="bg-green-500 text-white px-4 py-2 rounded-lg">Guardar</button>
```

### Cómo se instala en este proyecto

1. `npm install -D tailwindcss @tailwindcss/vite` en la carpeta `client/`
2. Agregar el plugin en `vite.config.js`
3. Crear `src/index.css` con `@import "tailwindcss"`
4. Importar ese CSS en `main.jsx`

### Las clases más usadas

**Colores** (fondo y texto):
```
bg-gray-900    → fondo gris oscuro
bg-green-500   → fondo verde
text-white     → texto blanco
text-gray-400  → texto gris claro
```

**Espaciado** (los números son múltiplos de 4px):
```
p-4     → padding: 16px (en todos los lados)
px-6    → padding horizontal: 24px
py-2    → padding vertical: 8px
mt-4    → margin-top: 16px
gap-4   → espacio entre hijos flex/grid: 16px
```

**Layout:**
```
flex            → display: flex
flex-col        → dirección vertical
items-center    → alinea al centro (eje cruzado)
justify-between → espacia los hijos al máximo
grid            → display: grid
grid-cols-3     → 3 columnas iguales
```

**Bordes y formas:**
```
rounded-lg      → border-radius: 8px
rounded-full    → círculo perfecto
border          → border: 1px solid
border-gray-600 → color del borde
```

**Interactividad:**
```
hover:bg-green-600   → cambia el fondo al pasar el mouse
transition-colors    → anima el cambio de color suavemente
focus:outline-none   → saca el borde azul del foco por defecto
```

**Transparencias** (con `/`):
```
bg-red-500/20    → fondo rojo con 20% de opacidad
text-green-400   → verde más suave que green-500
```

**Responsive** (mobile-first):
```
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
↑ celular      ↑ tablet       ↑ desktop
```
Las clases sin prefijo aplican a todos los tamaños. `sm:`, `md:`, `lg:` sobreescriben a partir de ese ancho.

### ¿Cómo practicarlo?

La mejor forma es ir modificando clases y ver el resultado en tiempo real con Vite. Algunas ideas:
- Cambiá `bg-green-500` por `bg-blue-500` → todo cambia de color
- Cambiá `rounded-lg` por `rounded-full` → los botones se vuelven pastillas
- Agregá `shadow-xl` a una card → aparece una sombra
- Probá `opacity-50` en un elemento → se vuelve semitransparente

El sitio oficial **tailwindcss.com** tiene un buscador de clases muy útil.

---

---

## Capítulo 10 — Seguimiento de Progreso

### ¿Qué registramos?

Cada vez que el usuario completa una rutina, se crea un documento `WorkoutLog` en MongoDB:

```js
{
  user: ObjectId,     // quién entrenó
  routine: ObjectId,  // qué rutina hizo
  notes: String,      // notas opcionales
  createdAt: Date     // cuándo lo hizo (automático con timestamps)
}
```

### El flujo completo

1. El usuario entra al detalle de una rutina (`/routines/:id`)
2. Presiona **"✓ Completar rutina"**
3. El frontend hace `POST /api/logs` con el `routineId`
4. El backend crea el `WorkoutLog` y lo devuelve populado
5. En `/progress` el usuario ve todo su historial ordenado por fecha

### Estadísticas simples sin librerías

Para mostrar métricas rápidas usamos JavaScript puro:

```js
// Total de entrenamientos
logs.length

// Rutinas distintas entrenadas
new Set(logs.map(l => l.routine._id)).size
```

`Set` es una estructura de datos que no permite duplicados. Pasarle un array y medir su tamaño nos da los valores únicos.

---

## Capítulo 11 — Roles y Permisos

### Los tres roles del sistema

| Rol | Puede hacer |
|-----|-------------|
| `user` | Ver ejercicios, crear sus propias rutinas, registrar progreso |
| `coach` | Todo lo anterior + ver lista de usuarios + crear rutinas para alumnos |
| `admin` | Todo lo anterior + cambiar roles + activar/desactivar membresías |

### Protección en el backend: `restrictTo`

```js
router.get('/', restrictTo('admin', 'coach'), getAllUsers);
//                ↑ solo pasan las requests de admin o coach
```

Si un `user` intenta acceder, recibe un `403 Forbidden`.

### Protección en el frontend: `RoleRoute`

```jsx
function RoleRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

// Uso:
<Route path="/admin" element={<RoleRoute roles={['admin']}><AdminPanel /></RoleRoute>} />
```

Si alguien intenta entrar a `/admin` sin ser admin, lo redirige al inicio. La seguridad real está en el backend — el frontend es solo UX.

### Navbar dinámico por rol

El navbar muestra diferentes links según el rol del usuario logueado:

```jsx
{user.role === 'admin' && <Link to="/admin">Admin</Link>}
{(user.role === 'coach' || user.role === 'admin') && <Link to="/coach">Coach</Link>}
```

---

## Capítulo 12 — Filtros en el Catálogo de Ejercicios

### El endpoint de filtros

```
GET /api/exercises/filter?muscle=chest&equipment=barbell&rehab=true
```

En el backend usamos **expresiones regulares** (`$regex`) para búsqueda case-insensitive:

```js
if (muscle) query.targetMuscle = { $regex: new RegExp(muscle, 'i') };
//                                                              ↑ 'i' = ignora mayúsculas/minúsculas
```

### URLSearchParams en el frontend

Para construir la URL de filtros dinámicamente usamos `URLSearchParams`:

```js
const params = new URLSearchParams();
if (muscle) params.append('muscle', muscle);
if (equipment) params.append('equipment', equipment);
const url = `/api/exercises/filter?${params.toString()}`;
// Resultado: /api/exercises/filter?muscle=chest&equipment=barbell
```

### useEffect con dependencias

Los filtros se aplican automáticamente cuando cambian los selectores:

```js
useEffect(() => {
  fetchExercises();
}, [muscle, equipment, rehab]); // se re-ejecuta cuando cambia cualquiera de estos
```

---

## Próximos pasos

- [x] Configurar el archivo `.env` con las credenciales reales
- [x] Conectar a MongoDB Atlas (base de datos en la nube)
- [x] Implementar las rutinas (CRUD completo)
- [x] Agregar y quitar ejercicios de una rutina
- [x] Diseño visual con Tailwind CSS
- [x] Filtros en el catálogo de ejercicios
- [x] Seguimiento de progreso del usuario
- [x] Dashboard de coach con asignación de rutinas
- [x] Panel de administración
- [ ] Integrar Stripe para pagos
- [ ] Deploy: backend en Railway, frontend en Vercel
- [ ] Subir a GitHub

---

*Última actualización: Progreso + Roles + Filtros + Admin + Coach*
