import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice = 'sarah', model = 'eleven_multilingual_v2' } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    // Voice mapping to ElevenLabs voice IDs
    const voiceMapping: Record<string, string> = {
      'sarah': 'EXAVITQu4vr4xnSDxMaL',
      'laura': 'FGY2WhTYpPnrIDTdsKH5', 
      'charlie': 'IKne3meq5aSn9XLyUdCD',
      'aria': '9BWtsMINqrJLrRacOk9x',
    }

    const voiceId = voiceMapping[voice] || voiceMapping['sarah']

    // Use ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': 'sk_ceb270edfe61cefb68e6b2811203d2194ecf7a6d3aaf16d8',
            // 'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY') || 'sk_ceb270edfe61cefb68e6b2811203d2194ecf7a6d3aaf16d8',
      },
      body: JSON.stringify({
        text: text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', errorText)
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    // Convert audio to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    )

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})