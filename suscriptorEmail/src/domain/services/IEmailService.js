/**
 * Como no utilizamos TypeScript, esta clase actua como una interfaz
 * Nos ayuda a hacer que cumpla un contrato que esta como funcion
 * en la clase SMTPEmailService.
 */
class IEmailService {
    async enviarEmail(_lead) {
        throw new Error("enviarEmail no esta implementado");
    }
}

module.exports = { IEmailService };
