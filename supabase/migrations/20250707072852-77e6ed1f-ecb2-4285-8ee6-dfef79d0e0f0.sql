-- Créer une table pour stocker les illustrations des pages d'histoires
CREATE TABLE public.story_page_illustrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  page_content_hash TEXT NOT NULL, -- hash du contenu pour vérifier si le contenu a changé
  illustration_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, page_number)
);

-- Activer RLS
ALTER TABLE public.story_page_illustrations ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Users can view illustrations for their own stories" 
ON public.story_page_illustrations 
FOR SELECT 
USING (story_id IN (SELECT id FROM public.stories WHERE user_id = auth.uid()));

CREATE POLICY "Users can create illustrations for their own stories" 
ON public.story_page_illustrations 
FOR INSERT 
WITH CHECK (story_id IN (SELECT id FROM public.stories WHERE user_id = auth.uid()));

CREATE POLICY "Users can update illustrations for their own stories" 
ON public.story_page_illustrations 
FOR UPDATE 
USING (story_id IN (SELECT id FROM public.stories WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete illustrations for their own stories" 
ON public.story_page_illustrations 
FOR DELETE 
USING (story_id IN (SELECT id FROM public.stories WHERE user_id = auth.uid()));

-- Index pour optimiser les requêtes
CREATE INDEX idx_story_page_illustrations_story_id ON public.story_page_illustrations(story_id);
CREATE INDEX idx_story_page_illustrations_story_page ON public.story_page_illustrations(story_id, page_number);