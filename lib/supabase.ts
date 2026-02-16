/// <reference path="../vite-env.d.ts" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERRO CRÍTICO: Variáveis de ambiente do Supabase não definidas. Verifique o .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
