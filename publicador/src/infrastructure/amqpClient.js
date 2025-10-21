const amqp = require("amqplib");
const dotenv = require("dotenv");
const { LeadPublisher } = require("../domain/services/LeadPublisher.js");

dotenv.config();

/**
 * Implementacion concreta que publica leads usando AMQP.
 * Principio de Responsabilidad Unica: solo conoce como
 * conectarse a AMQP y publicar el evento de registro.
 */
class AMQPLeadPublisher extends LeadPublisher {
    constructor(connectionUrl, exchange, routingKeys) {
        super();
        this.connectionUrl = connectionUrl;
        this.exchange = exchange;
        this.routingKeys = Array.isArray(routingKeys) ? routingKeys : [];
        if (this.routingKeys.length === 0) {
            throw new Error("Se requiere al menos una routing key para publicar el lead");
        }
        this.connection = null;
        this.channel = null;
    }

    async publishRegistration(lead) {
        const channel = await this._getChannel();
        const body = Buffer.from(JSON.stringify(lead));
        const options = {
            persistent: true,
            contentType: "application/json",
        };

        if (lead?.id !== undefined) {
            options.messageId = String(lead.id);
        }

        for (const routingKey of this.routingKeys) {
            const sent = channel.publish(this.exchange, routingKey, body, options);

            if (!sent) {
                await new Promise((resolve) => channel.once("drain", resolve));
            }
        }
    }

    async close() {
        if (this.channel) {
            await this.channel.close();
            this.channel = null;
        }
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }

    async _getChannel() {
        if (this.channel) return this.channel;

        this.connection = await amqp.connect(this.connectionUrl, {
            heartbeat: 30,
            clientProperties: { connection_name: "publicador" },
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

module.exports = { AMQPLeadPublisher };
