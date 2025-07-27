// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
    const supabase = createClient(
    // @ts-ignore
    Deno.env.get('SUPABASE_URL')!,
    // @ts-ignore
    Deno.env.get('SUPABASE_ANON_KEY')!
  );

  // Récupérer les catégories et leurs thèmes associés
  const { data, error } = await supabase
    .from('theme_categories')
    .select('id, name, icon, themes (id, value, label, description, video)')
    .order('name', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}); 