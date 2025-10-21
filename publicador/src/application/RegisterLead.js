const { LeadSchema } = require("../domain/lead.schema.js");

/**
 * Caso de uso que registra un lead y delega la publicacion del evento.
 * Principio de Responsabilidad Unica: valida y delega; no conoce detalles
 * de AMQP. Principio de Inversion de Dependencias: recibe un LeadPublisher.
 */
class RegisterLeadUseCase {
    constructor(leadPublisher) {
        this.leadPublisher = leadPublisher;
    }

    async execute(input) {
        const lead = LeadSchema.parse(input);
        await this.leadPublisher.publishRegistration(lead);
        return { ok: true, lead };
    }
}

module.exports = { RegisterLeadUseCase };
