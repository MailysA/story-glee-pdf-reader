import { createClient } from '@supabase/supabase-js'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    console.log('Fetching public stories...');

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: corsHeaders }
      )
    }

    console.log(`Found ${data?.length || 0} public stories`);
    
    return new Response(
      JSON.stringify(data), 
      { headers: corsHeaders }
    )
  } catch (err) {
    console.error('Function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: corsHeaders }
    )
  }
})