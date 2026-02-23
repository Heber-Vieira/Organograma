import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || ''; // We need service role key to query auth users, but we can't get it from env.local usually.

// Let's just create a test to check if the RPC exists
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRPC() {
    console.log("Testing RPC existence...");
    const { data, error } = await supabase.rpc('delete_user_by_admin', { user_id: '00000000-0000-0000-0000-000000000000' });
    console.log("RPC Test Result:", { data, error });

    // Test auth list (will fail with anon key, but let's see)
    // const authRes = await supabase.auth.admin.listUsers();
    // console.log("Auth users:", authRes);
}

testRPC();
