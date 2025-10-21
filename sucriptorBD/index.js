const dotenv = require("dotenv");
dotenv.config();
const { consumeJson, shutdown } = require("./src/infrastructure/rabbit.js"); // el cliente Rabbit
const { saveLead } = require("./src/application/saveLead.usecase.js"); // tu lógica de negocio

// 2️⃣ Define una función principal asincrónica
async function main() {
    // consumeJson: escucha la cola, recibe cada mensaje y ejecuta una función
    await consumeJson(async (payload) => {
        // Aquí decides qué hacer con cada mensaje recibido
        await saveLead(payload); // ejecuta el caso de uso (valida y guarda)
    });

    // 3️⃣ Captura señales del sistema para cerrar limpio
    process.on("SIGINT", async () => { // Ctrl+C en consola
        await shutdown(); // cierra canal y conexión Rabbit
        process.exit(0);
    });

    process.on("SIGTERM", async () => { // parada desde Docker o sistema
        await shutdown();
        process.exit(0);
    });
}

// 4️⃣ Ejecuta la función
main().catch((e) => {
    console.error("Fatal bootstrap error:", e);
    process.exit(1);
});
