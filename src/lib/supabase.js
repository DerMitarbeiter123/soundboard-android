import { createClient } from '@supabase/supabase-js'

// These will be set via environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Debug logging
console.log('🔑 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Key starts with:', supabaseAnonKey.substring(0, 20) + '...');
console.log('Key type:', supabaseAnonKey.startsWith('sb_publishable_') ? '✅ Publishable (NEW)' :
    supabaseAnonKey.startsWith('eyJ') ? '✅ Anon (LEGACY)' :
        '❌ UNKNOWN - Check your .env!');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
})
