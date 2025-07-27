// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })
  }

  const supabase = createClient(
    // @ts-ignore
    Deno.env.get('SUPABASE_URL')!,
    // @ts-ignore
    Deno.env.get('SUPABASE_ANON_KEY')!
  )

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return new Response(JSON.stringify({ error: error?.message || 'Not found' }), { status: 404 })
  }

  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
}) 