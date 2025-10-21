const amqp = require("amqplib");

class AMQPJsonConsumer {
    constructor(options) {
        this.url = options.url;
        this.exchange = options.exchange;
        this.queue = options.queue;
        this.routingKey = options.routingKey;
        this.prefetch = Number(options.prefetch) || 1;
        this.connectionName = options.connectionName || "suscriptor";
        this.connection = null;
        this.channel = null;
    }

    async start(onMessage) {
        if (typeof onMessage !== "function") {
            throw new Error("onMessage debe ser una funcion");
        }

        const channel = await this._ensureChannel();
        await channel.assertQueue(this.queue, { durable: true });
        await channel.bindQueue(this.queue, this.exchange, this.routingKey);
        await channel.prefetch(this.prefetch);

        await channel.consume(this.queue, async (msg) => {
            if (!msg) return;

            try {
                const payload = JSON.parse(msg.content.toString());
                await onMessage(payload);
                channel.ack(msg);
            } catch (error) {
                console.error("[AMQPJsonConsumer] Error procesando mensaje:", error);
                channel.nack(msg, false, false);
            }
        }, { noAck: false });

        console.log(`[AMQPJsonConsumer] Escuchando ${this.queue} (${this.routingKey})`);
    }

    async stop() {
        if (this.channel) {
            await this.channel.close();
            this.channel = null;
        }
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }

    async _ensureChannel() {
        if (this.channel) return this.channel;

        this.connection = await amqp.connect(this.url, {
            heartbeat: 30,
            clientProperties: { connection_name: this.connectionName },
        });

        this.connection.on("close", () => {
            this.channel = null;
            this.connection = null;
        });

        this.connection.on("error", () => {
            this.channel = null;
            this.connection = null;
        });

        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange(this.exchange, "topic", { durable: true });
        return this.channel;
    }
}

module.exports = { AMQPJsonConsumer };
