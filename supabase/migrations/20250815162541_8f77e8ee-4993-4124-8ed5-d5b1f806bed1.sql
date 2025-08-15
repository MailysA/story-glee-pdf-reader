-- Permettre l'accès public aux histoires publiques pour les edge functions
CREATE POLICY "Allow public access to public stories for edge functions" 
ON public.stories 
FOR SELECT 
USING (is_public = true);

-- Corriger les fonctions avec search_path mutable
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_usage_updated_at() SET search_path = public;

-- Politique pour permettre l'upload d'audio dans le bucket story-audio
CREATE POLICY "Users can upload audio for their own stories" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'story-audio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view audio for their own stories" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'story-audio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public access to audio for public stories" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'story-audio' 
  AND name IN (
    SELECT CONCAT(s.user_id::text, '/', s.id::text, '.mp3')
    FROM stories s 
    WHERE s.is_public = true
  )
);