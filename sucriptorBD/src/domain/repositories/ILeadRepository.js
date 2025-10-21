/**
 * Como no utilizamos TypeScript, esta clase actua como una interfaz
 * Nos ayuda a hacer que cumpla un contrato que esta como funcion
 * en la clase AMQPLeadPublisher.
 */
class ILeadRepository {
    async save(_lead) {
        throw new Error("save no esta implementado");
    }
}

module.exports = { ILeadRepository };
