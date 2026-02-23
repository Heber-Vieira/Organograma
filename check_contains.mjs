import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    // Admin key or something? Just anon key
    // Can we fetch a specific row to see the response type or error?
    // Let's do a basic query with contains to see if it throws an error.

    const { data, error } = await supabase
        .from('charts')
        .select('allowed_users')
        .contains('allowed_users', ['00000000-0000-0000-0000-000000000000'])
        .limit(1);

    console.log("CONTAINS TEST:", { data, error });
}
checkSchema();
