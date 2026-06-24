# 3. Arquitectura actual (estado real del código)

Este documento describe lo que **existe hoy** en el repo, no una aspiración. Sirve como línea de base para medir qué falta para vender el producto.

## Diagrama de componentes

```mermaid
flowchart LR
    subgraph Cliente
        FE["React + Vite\n(client/)"]
    end

    subgraph Servidor["Servidor único Express (server/)"]
        AUTH[authController]
        EXE[exerciseController]
        ROU[routineController]
        LOG[logController]
        USR[userController]
        MW["authMiddleware\n(protect / restrictTo)"]
    end

    DB[(MongoDB\nlocal o Atlas)]
    EXT[("ExerciseDB\nvía RapidAPI")]

    FE -- "fetch /api/* + JWT Bearer" --> Servidor
    MW --> AUTH
    MW --> EXE
    MW --> ROU
    MW --> LOG
    MW --> USR
    AUTH --> DB
    EXE --> DB
    ROU --> DB
    LOG --> DB
    USR --> DB
    EXE -. "cache-aside\n(solo si la colección está vacía)" .-> EXT
```

**Punto crítico de diseño**: todo vive en un único proceso Express + una única base Mongo, sin separación por tenant. No hay load balancer, no hay caché compartido (Redis), no hay cola de trabajos. Para el volumen de un MVP/beta esto es correcto — no hay que sobre-construir antes de tener usuarios.

## Modelo de datos (ER)

```mermaid
erDiagram
    USER {
        ObjectId _id
        string name
        string email
        string password_hash
        string role "user | coach | admin"
        boolean activeMembership
    }
    ROUTINE {
        ObjectId _id
        string name
        ObjectId user_FK
    }
    EXERCISE {
        ObjectId _id
        string externalId
        string name
        string targetMuscle
        string equipment
        boolean isRehabFriendly
    }
    WORKOUTLOG {
        ObjectId _id
        ObjectId user_FK
        ObjectId routine_FK
        string notes
        date createdAt
    }

    USER ||--o{ ROUTINE : "es dueño de"
    USER ||--o{ WORKOUTLOG : "registra"
    ROUTINE ||--o{ EXERCISE : "incluye (M:N)"
    ROUTINE ||--o{ WORKOUTLOG : "se completa como"
```

**Gap de negocio visible en el modelo**: no existe una entidad `Gym`/`Tenant` ni una relación explícita `Coach—Alumno`. El campo `role` alcanza para autorización pero no para "estos son los alumnos de este coach" ni para "este gimnasio tiene estos coaches". Por eso hoy cualquier coach puede asignar una rutina a cualquier `userId` del sistema (ver hallazgo de seguridad en la revisión previa).

## Flujo de autenticación (lo que hay)

```mermaid
sequenceDiagram
    participant U as Usuario (browser)
    participant FE as React (AuthContext)
    participant API as Express /api/auth
    participant DB as MongoDB

    U->>FE: submit login(email, password)
    FE->>API: POST /api/auth/login
    API->>DB: findOne({email})
    DB-->>API: user + password hash
    API->>API: bcrypt.compare(password)
    API->>API: jwt.sign({id}, JWT_SECRET, 7d)
    API-->>FE: {token, user}
    FE->>FE: localStorage.setItem(token, user)
    FE-->>U: navigate /exercises
```

Sin refresh token, sin revocación, sin rate limiting en este endpoint — ver [06-riesgos-y-metricas.md](06-riesgos-y-metricas.md).

## Flujo "coach asigna rutina" (el feature de negocio central, tal cual está hoy)

```mermaid
sequenceDiagram
    participant C as Coach
    participant FE as CoachDashboard
    participant API as POST /api/routines
    participant DB as MongoDB

    C->>FE: selecciona alumno + nombre de rutina
    FE->>API: POST {name, userId} + JWT del coach
    API->>API: restrictTo no aplica aquí —\nsolo protect (cualquier user logueado pasa)
    API->>API: if (userId && role in [coach, admin]) targetUser = userId
    API->>DB: Routine.create({name, user: targetUser})
    DB-->>API: routine creada
    API-->>FE: 201 routine

    note over API,DB: No valida que userId exista,\nni que sea "alumno de" este coach.
```

## Inventario de deuda técnica que bloquea venta (resumen)

| Ítem | Por qué bloquea vender | Detalle |
|---|---|---|
| Sin Stripe real | No hay forma de cobrar | `activeMembership` se activa a mano desde el panel admin |
| Sin multi-tenant | Un gimnasio no puede tener "su" espacio aislado | Todos los usuarios comparten un namespace global |
| Sin relación coach↔alumno | El feature de venta principal (gestión de alumnos) es endeble | Cualquier coach ve/asigna a cualquier usuario |
| Sin rate limiting / helmet | Riesgo de seguridad ante tráfico real | `server/index.js` solo tiene `cors()` y `express.json()` |
| Sin paginación | No escala con catálogo/usuarios reales | `GET /exercises`, `/users`, `/logs` devuelven todo sin límite |
| Sin tests/CI | Cada release es a ciegas | No hay `.github/workflows`, no hay test runner configurado |

Este inventario es el insumo directo del roadmap en [05-roadmap.md](05-roadmap.md).
