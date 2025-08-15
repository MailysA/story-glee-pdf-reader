// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing id parameter' }), 
        { status: 400, headers: corsHeaders }
      )
    }

    console.log(`Fetching story with id: ${id}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: corsHeaders }
      )
    }

    if (!data) {
      console.log('Story not found');
      return new Response(
        JSON.stringify({ error: 'Story not found' }), 
        { status: 404, headers: corsHeaders }
      )
    }

    console.log('Story found successfully');
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