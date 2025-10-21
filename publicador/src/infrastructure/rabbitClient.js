const amqp = require("amqplib");
const dotenv = require("dotenv");

dotenv.config();

let conn, ch;

async function getChannel() {
    if (ch) return ch;
    conn = await amqp.connect(process.env.CLOUDAMQP_URL, {
        heartbeat: 30,
        clientProperties: { connection_name: "publisher-api" },
    });
    conn.on("close", () => { ch = null; });
    conn.on("error", () => { ch = null; });

    ch = await conn.createChannel();
    await ch.assertExchange(process.env.CLOUDAMQP_EXCHANGE, "topic", { durable: true });
    return ch;
}

async function publishJson(routingKey, payload) {
    const channel = await getChannel();
    const buf = Buffer.from(JSON.stringify(payload));
    const ok = channel.publish(process.env.CLOUDAMQP_EXCHANGE, routingKey, buf, {
        persistent: true,
        contentType: "application/json",
        messageId: payload.id,
    });
    if (!ok) await new Promise(r => channel.once("drain", r));
}

module.exports = { publishJson, getChannel };