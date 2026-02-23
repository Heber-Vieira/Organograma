import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllowedUsersType() {
    const { data, error } = await supabase
        .from('charts')
        .select('allowed_users')
        .not('allowed_users', 'is', null)
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data:', data);
        if (data && data.length > 0) {
            console.log('Type of allowed_users:', typeof data[0].allowed_users);
            console.log('Is Array?', Array.isArray(data[0].allowed_users));
        }
    }
}
checkAllowedUsersType();
