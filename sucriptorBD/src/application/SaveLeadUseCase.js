const { LeadSchema } = require("../domain/lead.schema.js");

class SaveLeadUseCase {
    constructor(leadRepository) {
        this.leadRepository = leadRepository;
    }

    async execute(input) {
        const lead = LeadSchema.parse(input);
        return this.leadRepository.save(lead);
    }
}

module.exports = { SaveLeadUseCase };
