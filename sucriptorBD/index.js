const dotenv = require("dotenv");

dotenv.config();

const { AMQPJsonConsumer } = require("./src/infrastructure/AMQPJsonConsumer.js");
const { SupabaseLeadRepository } = require("./src/infrastructure/repositories/SupabaseLeadRepository.js");
const { SaveLeadUseCase } = require("./src/application/SaveLeadUseCase.js");

const leadRepository = new SupabaseLeadRepository({
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    table: process.env.SUPABASE_TABLE,
});

const saveLeadUseCase = new SaveLeadUseCase(leadRepository);

const consumer = new AMQPJsonConsumer({
    url: process.env.CLOUDAMQP_URL,
    exchange: process.env.CLOUDAMQP_EXCHANGE,
    queue: process.env.QUEUE,
    routingKey: process.env.ROUTING_KEY,
    prefetch: process.env.PREFETCH,
    connectionName: "suscriptor-bd",
});

async function start() {
    console.log("[SuscriptorBD] Escuchando mensajes...");
    await consumer.start((payload) => saveLeadUseCase.execute(payload));
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
    console.error("Error iniciando suscriptor de base de datos:", error);
    process.exit(1);
});
