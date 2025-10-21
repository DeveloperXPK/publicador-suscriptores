const { z } = require("zod"); // Importa Zod para la validación de esquemas

// Define el esquema de Lead utilizando Zod
const LeadSchema = z.object({
    nombre: z.string().min(3).max(100),
    email: z.email(),
    programa: z.string().min(2).max(50),
})

module.exports = { LeadSchema }; // Exporta el esquema para su uso en otras partes de la aplicación