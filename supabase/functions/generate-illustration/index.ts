
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { theme, childName, storyTitle } = await req.json();

    if (!theme) {
      throw new Error('Thème requis pour générer l\'illustration');
    }

    const openAIApiKey = Deno.env.get('OPEN_AI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Clé API OpenAI non configurée');
    }

    // Créer un prompt pour l'illustration selon le thème
    const illustrationPrompts = {
      aventure: `Une illustration colorée et douce pour enfants montrant ${childName} en explorateur avec une carte au trésor, style livre d'enfants, couleurs vives et rassurantes`,
      magie: `Une illustration magique pour enfants avec ${childName} comme petit magicien entouré d'étoiles scintillantes et de créatures fantastiques, style conte de fées`,
      animaux: `Une illustration adorable pour enfants avec ${childName} entouré d'animaux amicaux dans un paysage coloré, style livre d'enfants`,
      espace: `Une illustration spatiale pour enfants avec ${childName} en petit astronaute flottant parmi les étoiles et planètes colorées, style cartoon mignon`,
      ocean: `Une illustration sous-marine pour enfants avec ${childName} nageant avec des poissons colorés et des créatures marines amicales`,
      foret: `Une illustration de forêt enchantée pour enfants avec ${childName} parmi les arbres magiques et animaux de la forêt`,
      princesse: `Une illustration de château de conte de fées avec ${childName} en prince/princesse dans un décor royal coloré et chaleureux`,
      dinosaures: `Une illustration préhistorique pour enfants avec ${childName} découvrant des dinosaures amicaux dans un paysage verdoyant`
    };

    const prompt = illustrationPrompts[theme] || `Une belle illustration pour enfants montrant ${childName} dans une aventure ${theme}, style livre d'enfants coloré et rassurant`;

    console.log('Génération d\'illustration avec prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        output_format: 'png'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erreur OpenAI Images: ${error.error?.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    return new Response(
      JSON.stringify({
        imageUrl: imageUrl,
        message: 'Illustration générée avec succès'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erreur génération illustration:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
