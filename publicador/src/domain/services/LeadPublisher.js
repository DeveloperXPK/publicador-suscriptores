/**
 * Contrato que define como se publica un lead.
 * Aplicamos el Principio de Inversion de Dependencias: los casos de uso
 * dependen de esta abstraccion y no de la infraestructura concreta.
 */
class LeadPublisher {
    /**
     * Publica un lead en el canal correspondiente.
     * @param {object} lead Datos validados del lead.
     * @returns {Promise<void>}
     */
    async publishRegistration(lead) {
        throw new Error("Metodo no implementado: publishRegistration");
    }
}

module.exports = { LeadPublisher };

module.exports = { LeadPublisher };
