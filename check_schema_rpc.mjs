import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';
// This is Anon Key. We can't query information_schema from REST API without RPC.
