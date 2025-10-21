const amqp = require("amqplib");
const dotenv = require("dotenv");

dotenv.config();

const {
    CLOUDAMQP_URL,
    CLOUDAMQP_EXCHANGE,
    ROUTING_KEY,
    QUEUE,
    PREFETCH
} = process.env;

let conn = null;
let ch = null;

/** Crea/recupera canal y asegura el exchange (durable). */
async function getChannel() {
    if (ch) return ch;

    conn = await amqp.connect(CLOUDAMQP_URL, {
        heartbeat: 30,
        clientProperties: { connection_name: "suscriptor-email" }
    });

    conn.on("close", () => { ch = null; console.log("[rabbit] connection closed"); });
    conn.on("error", (e) => { ch = null; console.error("[rabbit] connection error:", e); });

    ch = await conn.createChannel();
    await ch.assertExchange(CLOUDAMQP_EXCHANGE, "topic", { durable: true });
    return ch;
}

/** Asegura queue y binding a la routing key. */
async function assertQueueBinding() {
    const channel = await getChannel();
    await channel.assertQueue(QUEUE, {
        durable: true,
        // Si quieres DLQ, agrega:
        // arguments: { "x-dead-letter-exchange": `${EXCHANGE}.dlx` }
    });
    await channel.bindQueue(QUEUE, CLOUDAMQP_EXCHANGE, ROUTING_KEY);
    await channel.prefetch(Number(PREFETCH));
    return channel;
}

/**
 * Consume mensajes JSON y ejecuta un handler.
 * - Convierte Buffer → JSON
 * - Si OK: ACK
 * - Si error de negocio/validación: NACK (sin requeue → va a DLQ si existe)
 */
async function consumeJson(onMessage) {
    const channel = await assertQueueBinding();

    await channel.consume(QUEUE, async (msg) => {
        if (!msg) return;
        try {
            const payload = JSON.parse(msg.content.toString());
            await onMessage(payload);          // aquí llamas tu caso de uso
            channel.ack(msg);                  // éxito → confirmamos
        } catch (err) {
            console.error("[consumer] error:", err);
            channel.nack(msg, false, false);   // falla → no requeue (evita loop)
        }
    }, { noAck: false });

    console.log(`[consumer] listening queue=${QUEUE} rk=${ROUTING_KEY} ex=${CLOUDAMQP_EXCHANGE}`);
}

/** Cierre ordenado en SIGINT/SIGTERM */
async function shutdown() {
    try {
        if (ch) { await ch.close(); ch = null; }
        if (conn) { await conn.close(); conn = null; }
        console.log("[rabbit] shutdown complete");
    } catch (e) {
        console.error("[rabbit] shutdown error:", e);
    }
}

module.exports = { consumeJson, shutdown };