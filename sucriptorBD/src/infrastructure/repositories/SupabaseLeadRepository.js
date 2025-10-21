const { createClient } = require("@supabase/supabase-js");
const { ILeadRepository } = require("../../domain/repositories/ILeadRepository.js");

class SupabaseLeadRepository extends ILeadRepository {
    constructor({ url, key, table }) {
        super();
        this.client = createClient(url, key);
        this.table = table || "preinscripcion";
    }

    // Guardamos los datos 
    async save(lead) {
        const { data, error } = await this.client
            .from(this.table)
            .insert([lead])
            .select()
            .single();

        if (error) {
            throw new Error(`No se pudo guardar el lead: ${error.message}`);
        }

        return data;
    }
}

module.exports = { SupabaseLeadRepository };
