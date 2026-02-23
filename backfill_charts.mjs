import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillCharts() {
    console.log("Iniciando backfill de charts...");

    // 1. Encontrar o ID do usuário Heber Vieira (ou o admin atual)
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .ilike('full_name', '%Heber Vieira%')
        .limit(1);

    if (profileError || !profiles || profiles.length === 0) {
        console.error("Erro ao encontrar o perfil do Heber Vieira:", profileError);
        return;
    }

    const heberId = profiles[0].id;
    console.log(`Encontrado Heber Vieira com ID: ${heberId}`);

    // 2. Atualizar todos os charts que tem created_by nulo
    const { data: updatedCharts, error: updateError } = await supabase
        .from('charts')
        .update({ created_by: heberId })
        .is('created_by', null)
        .select('id, name');

    if (updateError) {
        console.error("Erro ao atualizar charts:", updateError);
        return;
    }

    console.log(`Sucesso! ${updatedCharts.length} organogramas foram atualizados com o criador Heber Vieira.`);
    console.log("Organogramas afetados:", updatedCharts.map(c => c.name).join(', '));
}

backfillCharts();
