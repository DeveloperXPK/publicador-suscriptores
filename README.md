# 🎓 Sistema de Pre-inscripciones Unilasallista

Sistema distribuido de gestión de leads para pre-inscripciones universitarias, implementado con arquitectura de publicador-suscriptores usando AMQP (RabbitMQ/CloudAMQP).

## 📋 Descripción

Este proyecto implementa un sistema de registro de **leads** (candidatos interesados) para programas universitarios. Cuando un prospecto completa el formulario de pre-inscripción, el sistema:

1. **Publica** el evento de registro en un exchange AMQP
2. **Suscriptor BD**: Guarda el lead en Supabase
3. **Suscriptor Email**: Envía notificación por correo electrónico

## 🏗️ Arquitectura

```
┌─────────────────┐
│   PUBLICADOR    │
│  (Formulario)   │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │  AMQP  │
    │Exchange│
    └───┬────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌──────┐  ┌──────┐
│  BD  │  │Email │
│Suscr.│  │Suscr.│
└──────┘  └──────┘
```

### Componentes

#### 📤 **Publicador** (`/publicador`)
- Servidor HTTP con formulario web
- Publica eventos de registro a múltiples routing keys
- Puerto: `3000` (por defecto)

#### 💾 **Suscriptor BD** (`/sucriptorBD`)
- Consume mensajes de la cola de base de datos
- Guarda leads en Supabase
- Routing key: `registro.bd`

#### 📧 **Suscriptor Email** (`/suscriptorEmail`)
- Consume mensajes de la cola de emails
- Envía notificaciones por SMTP
- Routing key: `registro.email`

## 🎨 Principios de Diseño Aplicados

### SOLID
- ✅ **SRP** (Single Responsibility): Cada clase tiene una única responsabilidad
- ✅ **OCP** (Open/Closed): Abierto para extensión, cerrado para modificación
- ✅ **DIP** (Dependency Inversion): Dependemos de abstracciones, no de implementaciones concretas

### Arquitectura en Capas (Layered Architecture)
```
┌─────────────────────┐
│   Presentation      │  ← HTTP, Consumidores AMQP
├─────────────────────┤
│   Application       │  ← Casos de uso (lógica de negocio)
├─────────────────────┤
│      Domain         │  ← Entidades, Schemas, Contratos
├─────────────────────┤
│  Infrastructure     │  ← Implementaciones (AMQP, SMTP, Supabase)
└─────────────────────┘
```

Cada capa tiene responsabilidades específicas y las dependencias fluyen hacia el dominio:

## 🚀 Instalación

### Requisitos Previos
- Node.js (v20 o superior)
- Cuenta en [CloudAMQP](https://www.cloudamqp.com/) o RabbitMQ local
- Cuenta en [Supabase](https://supabase.com/)
- Servidor SMTP (Gmail, Mailtrap, etc.)

### Instalación de Dependencias

```bash
# Instalar dependencias en cada proyecto
cd publicador
npm install

cd ../sucriptorBD
npm install

cd ../suscriptorEmail
npm install
```

## ⚙️ Configuración

Crea un archivo `.env` en cada carpeta:

### 📤 Publicador (`publicador/.env`)

```env
# Puerto del servidor HTTP
PORT=3000

# Conexión AMQP (CloudAMQP o RabbitMQ)
CLOUDAMQP_URL=amqp://usuario:password@host:5672/vhost
CLOUDAMQP_EXCHANGE=leads_exchange

# Routing keys separadas por comas
CLOUDAMQP_ROUTING_KEYS=registro.bd,registro.email
```

### 💾 Suscriptor BD (`sucriptorBD/.env`)

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_anon_key
SUPABASE_TABLE=leads

# AMQP
CLOUDAMQP_URL=amqp://usuario:password@host:5672/vhost
CLOUDAMQP_EXCHANGE=leads_exchange
QUEUE=queue_leads_bd
ROUTING_KEY=registro.bd
PREFETCH=1
```

### 📧 Suscriptor Email (`suscriptorEmail/.env`)

```env
# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_app

# AMQP
CLOUDAMQP_URL=amqp://usuario:password@host:5672/vhost
CLOUDAMQP_EXCHANGE=leads_exchange
QUEUE=queue_leads_email
ROUTING_KEY=registro.email
PREFETCH=1
```

## 📊 Variables de Entorno

### 🔧 Publicador

| Variable | Descripción | Ejemplo | Requerido |
|----------|-------------|---------|-----------|
| `PORT` | Puerto del servidor HTTP | `3000` | No (default: 3000) |
| `CLOUDAMQP_URL` | URL de conexión AMQP | `amqp://user:pass@host:5672` | ✅ Sí |
| `CLOUDAMQP_EXCHANGE` | Nombre del exchange | `leads_exchange` | ✅ Sí |
| `CLOUDAMQP_ROUTING_KEYS` | Routing keys (separadas por coma) | `registro.bd,registro.email` | No (default: registro.bd,registro.email) |

### 🗄️ Suscriptor BD

| Variable | Descripción | Ejemplo | Requerido |
|----------|-------------|---------|-----------|
| `SUPABASE_URL` | URL de tu proyecto Supabase | `https://xxx.supabase.co` | ✅ Sí |
| `SUPABASE_KEY` | Anon/Public key de Supabase | `eyJhbG...` | ✅ Sí |
| `SUPABASE_TABLE` | Nombre de la tabla | `leads` | ✅ Sí |
| `CLOUDAMQP_URL` | URL de conexión AMQP | `amqp://user:pass@host:5672` | ✅ Sí |
| `CLOUDAMQP_EXCHANGE` | Nombre del exchange | `leads_exchange` | ✅ Sí |
| `QUEUE` | Nombre de la cola | `queue_leads_bd` | ✅ Sí |
| `ROUTING_KEY` | Routing key | `registro.bd` | ✅ Sí |
| `PREFETCH` | Mensajes a procesar simultáneamente | `1` | No (default: 1) |

### 📬 Suscriptor Email

| Variable | Descripción | Ejemplo | Requerido |
|----------|-------------|---------|-----------|
| `SMTP_HOST` | Servidor SMTP | `smtp.gmail.com` | ✅ Sí |
| `SMTP_PORT` | Puerto SMTP (587 o 465) | `587` | ✅ Sí |
| `SMTP_USER` | Usuario/email SMTP | `tu@email.com` | ✅ Sí |
| `SMTP_PASS` | Contraseña/App Password | `tu_password` | ✅ Sí |
| `CLOUDAMQP_URL` | URL de conexión AMQP | `amqp://user:pass@host:5672` | ✅ Sí |
| `CLOUDAMQP_EXCHANGE` | Nombre del exchange | `leads_exchange` | ✅ Sí |
| `QUEUE` | Nombre de la cola | `queue_leads_email` | ✅ Sí |
| `ROUTING_KEY` | Routing key | `registro.email` | ✅ Sí |
| `PREFETCH` | Mensajes a procesar simultáneamente | `1` | No (default: 1) |

## 🏃 Ejecución

### Ejecutar todos los servicios (en terminales separadas):

```bash
# Terminal 1 - Publicador
cd publicador
node src/presentation/https.js

# Terminal 2 - Suscriptor BD
cd sucriptorBD
node index.js

# Terminal 3 - Suscriptor Email
cd suscriptorEmail
node index.js
```

### Modo desarrollo (con watch):

```bash
# Publicador con auto-reload
node src/presentation/https.js --watch
```

## 📝 Uso

1. Abre el navegador en `http://localhost:3000`
2. Completa el formulario de pre-inscripción:
   - Nombre
   - Apellido
   - Email
   - Carrera
3. Envía el formulario
4. El sistema automáticamente:
   - ✅ Guarda el lead en Supabase
   - ✅ Envía notificación por email

## 🗃️ Estructura de Datos

### Lead Schema

```javascript
{
  nombre: string,      // Nombre completo del lead
  email: string,       // Email del lead (validado)
  programa: string     // Programa/Carrera de interés
}
```

### Tabla Supabase

```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  programa TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Tecnologías Utilizadas

- **Node.js** - Runtime
- **Express.js** - Servidor HTTP
- **amqplib** - Cliente AMQP
- **Nodemailer** - Envío de emails
- **@supabase/supabase-js** - Cliente Supabase
- **Zod** - Validación de schemas
- **Bootstrap 5** - Estilos del formulario

## 📂 Estructura del Proyecto

```
publicador-suscriptores/
├── publicador/
│   ├── src/
│   │   ├── application/
│   │   │   └── RegisterLead.js
│   │   ├── domain/
│   │   │   ├── lead.schema.js
│   │   │   └── services/
│   │   │       └── LeadPublisher.js
│   │   ├── infrastructure/
│   │   │   └── amqpClient.js
│   │   └── presentation/
│   │       ├── https.js
│   │       └── index.html
│   ├── package.json
│   └── .env
├── sucriptorBD/
│   ├── src/
│   │   ├── application/
│   │   │   └── SaveLeadUseCase.js
│   │   ├── domain/
│   │   │   ├── lead.schema.js
│   │   │   └── repositories/
│   │   │       └── ILeadRepository.js
│   │   └── infrastructure/
│   │       ├── AMQPJsonConsumer.js
│   │       └── repositories/
│   │           └── SupabaseLeadRepository.js
│   ├── index.js
│   ├── package.json
│   └── .env
└── suscriptorEmail/
    ├── src/
    │   ├── application/
    │   │   └── enviarEmail.js
    │   ├── domain/
    │   │   ├── lead.schema.js
    │   │   └── services/
    │   │       └── IEmailService.js
    │   └── infrastructure/
    │       ├── AMQPJsonConsumer.js
    │       └── services/
    │           └── SMTPEmailService.js
    ├── index.js
    ├── package.json
    └── .env
```

## 🐛 Troubleshooting

### Error de conexión AMQP
```
Error: connect ECONNREFUSED
```
**Solución**: Verifica que `CLOUDAMQP_URL` sea correcta y el servicio esté activo.

### Email no se envía
```
Error: Invalid login
```
**Solución**: 
- Si usas Gmail, genera una [App Password](https://support.google.com/accounts/answer/185833)
- Verifica `SMTP_USER` y `SMTP_PASS`

### Lead no se guarda en Supabase
```
Error: Invalid API key
```
**Solución**: Verifica `SUPABASE_URL` y `SUPABASE_KEY`. Asegúrate de que la tabla existe.

## 📄 Licencia

Este proyecto es parte de un ejercicio académico de Arquitectura del Software.

## 👥 Autor

Desarrollado como proyecto de Parcial 2 - Arquitectura del Software - Unilasallista

---

**¿Qué es un Lead?** 
Un lead es una persona que ha mostrado interés en un producto o servicio. En este caso, es un prospecto que completó el formulario de pre-inscripción y podría convertirse en estudiante.
