const nodemailer = require("nodemailer");
const { IEmailService } = require("../../domain/services/IEmailService.js");

class SMTPEmailService extends IEmailService {
    constructor({ host, port, user, pass, from }) { // Desestructuramos el objeto de configuracion
        super();
        this.from = from || user;
        this.transporter = nodemailer.createTransport({
            host,
            port: Number(port),
            secure: Number(port) === 465,
            auth: {
                user,
                pass,
            },
        });
    }

    async sendWelcomeEmail(lead) {
        const message = {
            from: this.from,
            to: this.from, // Enviamos al mismo correo del remitente para pruebas
            subject: `Nuevo registro: ${lead.nombre} en ${lead.programa}`,
            html: [
                `<h1>Nuevo Lead Registrado</h1>`,
                `<p><strong>Nombre:</strong> ${lead.nombre}</p>`,
                `<p><strong>Email:</strong> ${lead.email}</p>`,
                `<p><strong>Programa:</strong> ${lead.programa}</p>`,
                "<hr>",
                "<p>Este es un correo de notificación del sistema de pre-inscripciones.</p>",
            ].join(""),
        };

        await this.transporter.sendMail(message);
    }
}

module.exports = { SMTPEmailService };
