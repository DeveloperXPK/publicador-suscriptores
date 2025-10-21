const { LeadSchema } = require("../domain/lead.schema.js");
const { publishJson } = require("../infrastructure/rabbitClient.js");
const dotenv = require("dotenv");

dotenv.config();

async function registerLead(input) {
    // validar contra el contrato del dominio
    const lead = LeadSchema.parse(input);

    // publicar
    await publishJson('registro.bd', lead);
    await publishJson('registro.email', lead);
    return { ok: true, lead: lead };
}

module.exports = { registerLead };