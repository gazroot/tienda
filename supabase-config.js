/*
 * CONFIGURACIÓN DE SUPABASE PARA AURA // NØIR
 * Reemplaza estos dos valores por los de tu proyecto: Supabase > Project Settings > API.
 * En el navegador solo se debe usar la clave publicable/anon. NUNCA pegues la service_role key aquí.
 */
const SUPABASE_URL = "https://iyitbmupbqayjhanakjs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_85UP1O64YBbWvnGYQD_Cdg_ZGwHfRD0";

if (!window.supabase) {
  console.error("No se cargó la librería de Supabase.");
} else if (SUPABASE_URL.startsWith("https://iyitbmupbqayjhanakjs.supabase.co") || SUPABASE_ANON_KEY.startsWith("sb_publishable_85UP1O64YBbWvnGYQD_Cdg_ZGwHfRD0")) {
  console.warn("Configura SUPABASE_URL y SUPABASE_ANON_KEY en supabase-config.js.");
} else {
  window.auraSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
