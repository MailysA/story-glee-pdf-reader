-- Créer une table pour gérer les histoires favorites par enfant
CREATE TABLE public.story_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id, child_name)
);

-- Activer RLS
ALTER TABLE public.story_favorites ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Users can view their own favorites" 
ON public.story_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.story_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.story_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Index pour optimiser les requêtes
CREATE INDEX idx_story_favorites_user_child ON public.story_favorites(user_id, child_name);
CREATE INDEX idx_story_favorites_story ON public.story_favorites(story_id);