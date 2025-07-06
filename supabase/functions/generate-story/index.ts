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
    const { childName, childAge, theme, customDetails } = await req.json();

    if (!childName || !childAge || !theme) {
      throw new Error('Informations manquantes');
    }

    const openAIApiKey = Deno.env.get('OPEN_AI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Clé API OpenAI non configurée');
    }

    // Créer un prompt personnalisé selon le thème
    const themePrompts = {
      aventure: "une aventure épique pleine de découvertes et d'exploration",
      magie: "un monde magique rempli de sortilèges et de créatures fantastiques",
      animaux: "une histoire touchante avec des animaux parlants",
      espace: "un voyage intergalactique passionnant",
      ocean: "une aventure sous-marine mystérieuse",
      foret: "une aventure dans une forêt enchantée",
      princesse: "une histoire de château avec des princesses courageuses",
      dinosaures: "une aventure préhistorique avec des dinosaures"
    };

    const ageContext = parseInt(childAge) < 6 ? 
      "Utilise un langage simple et des phrases courtes. L'histoire doit être douce et rassurante." :
      parseInt(childAge) < 9 ?
      "Utilise un vocabulaire adapté aux enfants d'école primaire avec un peu plus d'aventure." :
      "Tu peux utiliser un vocabulaire un peu plus riche et des situations plus complexes.";

    const prompt = `Écris une belle histoire pour enfant de ${childAge} ans qui s'appelle ${childName}. 
    
Le thème de l'histoire est : ${themePrompts[theme] || theme}

Détails personnalisés : ${customDetails || "Aucun"}

Instructions importantes :
- ${ageContext}
- L'histoire doit faire environ 400-600 mots
- Divise l'histoire en plusieurs paragraphes courts
- ${childName} doit être le héros/l'héroïne de l'histoire
- L'histoire doit avoir une morale positive
- Utilise des descriptions vivantes et colorées
- L'histoire doit être adaptée pour être lue à voix haute
- Commence par "Il était une fois" ou une formule similaire
- Termine par une fin heureuse et positive

Écris une histoire captivante et adaptée à l'âge de l'enfant !`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un conteur professionnel spécialisé dans les histoires pour enfants. Tu écris des histoires magiques, éducatives et adaptées à chaque âge.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erreur OpenAI: ${error.error?.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    const story = data.choices[0].message.content;

    return new Response(
      JSON.stringify({
        story: story,
        title: `L'aventure magique de ${childName}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});