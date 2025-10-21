const { LeadSchema } = require("../domain/lead.schema.js");

/**
 * Caso de uso: guardar Lead (aquí solo lo mostramos).
 * Luego sustituiremos console.log por repo.upsert(lead).
 */
async function saveLead(input) {
    const lead = LeadSchema.parse(input); // valida contrato
    // TODO: aquí va tu persistencia real (Prisma/Supabase)
    console.log("[usecase] Lead listo para guardar:", lead.programa, lead.email);
    return { ok: true, id: lead };
}

module.exports = { saveLead };