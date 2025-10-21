const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { registerLead } = require("../application/registerLead.usecase.js");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/submit", async (req, res) => {
    try {
        const result = await registerLead(req.body);
        res.status(202).json(result);
    } catch (e) {
        // si falló Zod, e.errors; si otra cosa, String(e)
        const err = e?.errors ?? String(e);
        res.status(400).json({ ok: false, error: err });
    }
});

app.listen(PORT, () => {
    console.log(`Publisher API on :${PORT}`);
});