import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { text, voice = 'sarah', model = 'eleven_multilingual_v2', storyId, userId } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    if (!storyId || !userId) {
      throw new Error('Story ID and User ID are required')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Créer un hash unique pour cette combinaison texte + voix
    const textEncoder = new TextEncoder()
    const data = textEncoder.encode(text + voice)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    const audioPath = `${userId}/${storyId}_${contentHash}.mp3`
    
    console.log(`Vérification cache pour: ${audioPath}`)

    // Vérifier si l'audio existe déjà dans le cache (storage)
    const { data: existingFile, error: checkError } = await supabase.storage
      .from('story-audio')
      .list(userId, {
        search: `${storyId}_${contentHash}.mp3`
      })

    if (!checkError && existingFile && existingFile.length > 0) {
      console.log('Audio trouvé dans le cache, pas de génération nécessaire')
      
      // Récupérer l'URL publique de l'audio en cache
      const { data: urlData } = supabase.storage
        .from('story-audio')
        .getPublicUrl(audioPath)

      const cachedAudioUrl = urlData.publicUrl

      // Vérifier si l'histoire a déjà l'audio_url dans la DB, sinon la mettre à jour
      const { data: storyData } = await supabase
        .from('stories')
        .select('audio_url')
        .eq('id', storyId)
        .eq('user_id', userId)
        .single()

      if (!storyData?.audio_url) {
        await supabase
          .from('stories')
          .update({ audio_url: cachedAudioUrl })
          .eq('id', storyId)
          .eq('user_id', userId)
      }

      return new Response(
        JSON.stringify({ 
          audioUrl: cachedAudioUrl,
          fromCache: true,
          message: 'Audio retrieved from cache'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Audio non trouvé dans le cache, génération via ElevenLabs...')

    // Get voice ID from database
    const { data: voiceData, error: voiceError } = await supabase
      .from('audio_voices')
      .select('elevenlabs_id')
      .eq('voice_id', voice)
      .eq('is_active', true)
      .single()

    let voiceId: string
    
    if (voiceError || !voiceData) {
      console.error('Voice not found:', voice, voiceError)
      // Fallback to default voice (charlie)
      const { data: defaultVoice } = await supabase
        .from('audio_voices')
        .select('elevenlabs_id')
        .eq('voice_id', 'charlie')
        .eq('is_active', true)
        .single()
      
      voiceId = defaultVoice?.elevenlabs_id || 'IKne3meq5aSn9XLyUdCD'
    } else {
      voiceId = voiceData.elevenlabs_id
    }

    // Use ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY'),
      },
      body: JSON.stringify({
        text: text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
          speed: 0.8
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', errorText)
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    // Store audio file in Supabase Storage avec le nom incluant le hash
    const arrayBuffer = await response.arrayBuffer()
    console.log(`Stockage de l'audio généré dans: ${audioPath}`)
    
    const { error: uploadError } = await supabase.storage
      .from('story-audio')
      .upload(audioPath, arrayBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('Failed to upload audio file')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('story-audio')
      .getPublicUrl(audioPath)

    const audioUrl = urlData.publicUrl

    // Update story with audio URL in database
    const { error: updateError } = await supabase
      .from('stories')
      .update({ audio_url: audioUrl })
      .eq('id', storyId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating story with audio URL:', updateError)
      throw new Error('Failed to update story with audio URL')
    }

    console.log('Audio generated and story updated successfully:', audioUrl)

    return new Response(
      JSON.stringify({ 
        audioUrl,
        fromCache: false,
        message: 'Audio generated and uploaded successfully'
      }),
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