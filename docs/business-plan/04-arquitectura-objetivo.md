# 4. Arquitectura objetivo (para vender a gimnasios reales)

No es una reescritura — es la evolución incremental del mismo Express + Mongo, agregando lo que el modelo de negocio necesita: multi-tenant, cobro real y observabilidad. Filosofía: **escalar cuando duela, no antes**.

## Cambios al modelo de datos

```mermaid
erDiagram
    GYM {
        ObjectId _id
        string name
        string stripeCustomerId
        string plan "free | coach | gym | gym_pro"
    }
    USER {
        ObjectId _id
        ObjectId gym_FK "null = usuario independiente"
        string role
        boolean activeMembership
    }
    COACH_STUDENT {
        ObjectId coach_FK
        ObjectId student_FK
        ObjectId gym_FK
    }
    ROUTINE {
        ObjectId _id
        ObjectId user_FK
        ObjectId assignedBy_FK "coach que la creó, null si self-service"
    }
    SUBSCRIPTION {
        ObjectId _id
        ObjectId gym_FK
        string stripeSubscriptionId
        string status
        date currentPeriodEnd
    }

    GYM ||--o{ USER : "emplea/contiene"
    GYM ||--o{ SUBSCRIPTION : "paga"
    USER ||--o{ COACH_STUDENT : "coach de"
    USER ||--o{ COACH_STUDENT : "alumno de"
    USER ||--o{ ROUTINE : "es dueño de"
```

**Por qué `COACH_STUDENT` como tabla propia y no un array en `User`**: permite que un alumno tenga más de un coach a lo largo del tiempo (historial), y que las queries "alumnos de este coach" sean un índice directo en vez de un scan.

## Arquitectura de despliegue objetivo

```mermaid
flowchart TB
    subgraph Edge
        CDN["CDN / static hosting\n(Vercel o Netlify para client/)"]
    end

    subgraph App["App tier"]
        LB["Load balancer"]
        API1["Express API (instancia 1)"]
        API2["Express API (instancia 2..N)"]
    end

    subgraph Datos
        MONGO[(MongoDB Atlas\ncon índices por gym_FK)]
        REDIS[(Redis\ncaché de ExerciseDB + rate limiting)]
    end

    subgraph Terceros
        STRIPE[Stripe\nCheckout + Webhooks]
        RAPIDAPI[ExerciseDB / RapidAPI]
    end

    subgraph Obs["Observabilidad"]
        LOGS[Logs centralizados]
        METRICS[Métricas / uptime]
    end

    Browser((Usuario)) --> CDN
    Browser --> LB
    LB --> API1
    LB --> API2
    API1 --> MONGO
    API2 --> MONGO
    API1 --> REDIS
    API2 --> REDIS
    API1 --> RAPIDAPI
    API1 <--> STRIPE
    API1 --> LOGS
    API2 --> LOGS
    API1 --> METRICS
```

## Flujo de cobro objetivo (hoy no existe, hay que construirlo)

```mermaid
sequenceDiagram
    participant Admin as Admin del gimnasio
    participant FE as AdminPanel
    participant API as Express
    participant Stripe as Stripe Checkout
    participant Webhook as Webhook handler

    Admin->>FE: clic "Activar plan Gym"
    FE->>API: POST /api/billing/checkout-session
    API->>Stripe: crear Checkout Session
    Stripe-->>FE: redirect URL
    FE->>Admin: redirige a pago
    Admin->>Stripe: completa pago
    Stripe->>Webhook: event checkout.session.completed
    Webhook->>API: marca Gym.plan = "gym", Subscription.status = "active"
    API-->>Admin: email de confirmación
```

Esto reemplaza el toggle manual de `activeMembership` en el AdminPanel actual por un flujo real de cobro recurrente.

## Qué NO construir todavía (sobre-ingeniería a evitar)

- **Microservicios**: con el volumen esperado de una beta/early-stage, un monolito Express bien dividido en módulos alcanza. Separar servicios agrega complejidad operativa sin beneficio hasta tener tráfico real que lo justifique.
- **Kubernetes**: un PaaS (Render, Railway, Fly.io) o un par de instancias detrás de un load balancer simple es suficiente hasta escala media.
- **Mobile app nativa**: el roadmap prioriza que la web sea responsive y funcione bien en mobile antes de invertir en una app nativa — ver [05-roadmap.md](05-roadmap.md).

## Stack de observabilidad mínimo viable

| Necesidad | Solución de bajo costo |
|---|---|
| Logs | Pino/Winston → stdout → servicio gestionado (e.g. Better Stack, Axiom) |
| Errores en frontend/backend | Sentry (free tier alcanza para early stage) |
| Uptime | UptimeRobot o Better Uptime sobre `/api/health` (hay que hacer que ese endpoint chequee Mongo real, hoy no lo hace) |
| Métricas de negocio | Eventos simples a una tabla propia o PostHog (self-host u open source friendly) |
