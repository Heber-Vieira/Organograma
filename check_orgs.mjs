import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrgs() {
    const { data: orgs, error } = await supabase.from('organizations').select('id, name, logo_url');
    console.log('Organizações encontradas:', orgs);

    const { data: charts, error: chartError } = await supabase.from('charts').select('id, name, created_by');
    console.log('Organogramas encontrados:', charts);
}

checkOrgs();
