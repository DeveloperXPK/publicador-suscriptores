const { LeadSchema } = require("../domain/lead.schema.js");

class SendWelcomeEmailUseCase {
    constructor(emailService) {
        this.emailService = emailService;
    }

    async execute(input) {
        const lead = LeadSchema.parse(input);
        await this.emailService.sendWelcomeEmail(lead);
    }
}

module.exports = { SendWelcomeEmailUseCase };
