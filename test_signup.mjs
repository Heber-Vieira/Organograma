import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const tempSupabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

async function trySignUp() {
    const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email: 'marcia.silva@manserv.com.br',
        password: 'password123',
        options: {
            data: {
                full_name: 'Marcia Silva',
                role: 'user'
            }
        }
    });

    console.log("Sign up result:", { authData, authError });
}

trySignUp();
