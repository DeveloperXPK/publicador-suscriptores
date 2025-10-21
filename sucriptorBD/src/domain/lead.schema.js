const { z } = require("zod");

const LeadSchema = z.object({
    nombre: z.string().min(3).max(100),
    email: z.email(),
    programa: z.string().min(2).max(50),
});

module.exports = { LeadSchema };
