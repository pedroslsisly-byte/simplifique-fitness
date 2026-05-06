import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lryragggpfjtetonteyn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyeXJhZ2dncGZqdGV0b250ZXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjkxOTEsImV4cCI6MjA5MzE0NTE5MX0.XA620KCWHHAvKYsV_2nMtSi6og7X1Hkv5QKZr5RXg_A';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'present' : 'missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});