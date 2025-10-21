const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { AMQPLeadPublisher } = require("../infrastructure/amqpClient.js");
const { RegisterLeadUseCase } = require("../application/RegisterLead.js");

dotenv.config();

const routingKeys = process.env.CLOUDAMQP_ROUTING_KEYS
    ? process.env.CLOUDAMQP_ROUTING_KEYS.split(",").map((value) => value.trim()).filter(Boolean)
    : ["registro.bd", "registro.email"];

const leadPublisher = new AMQPLeadPublisher(
    process.env.CLOUDAMQP_URL,
    process.env.CLOUDAMQP_EXCHANGE,
    routingKeys,
);

const registerLeadUseCase = new RegisterLeadUseCase(leadPublisher);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/submit", async (req, res) => {
    try {
        const result = await registerLeadUseCase.execute(req.body);
        res.status(202).json(result);
    } catch (error) {
        const payload = error?.errors ?? String(error);
        res.status(400).json({ ok: false, error: payload });
    }
});

process.on("SIGINT", async () => {
    await leadPublisher.close();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await leadPublisher.close();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Publicador API en http://localhost:${PORT}`);
});
