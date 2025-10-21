const dotenv = require("dotenv");

dotenv.config();

const { AMQPJsonConsumer } = require("./src/infrastructure/AMQPJsonConsumer.js");
const { SMTPEmailService } = require("./src/infrastructure/services/SMTPEmailService.js");
const { SendWelcomeEmailUseCase } = require("./src/application/enviarEmail.js");

const emailService = new SMTPEmailService({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
});

const sendWelcomeEmailUseCase = new SendWelcomeEmailUseCase(emailService);

const consumer = new AMQPJsonConsumer({
    url: process.env.CLOUDAMQP_URL,
    exchange: process.env.CLOUDAMQP_EXCHANGE,
    queue: process.env.QUEUE,
    routingKey: process.env.ROUTING_KEY,
    prefetch: process.env.PREFETCH,
    connectionName: "suscriptor-email",
});

async function start() {
    console.log("[SuscriptorEmail] Escuchando mensajes...");
    await consumer.start((payload) => sendWelcomeEmailUseCase.execute(payload));
}

async function stop() {
    await consumer.stop();
}

process.on("SIGINT", async () => {
    await stop();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await stop();
    process.exit(0);
});

start().catch((error) => {
    console.error("Error iniciando suscriptor de email:", error);
    process.exit(1);
});
