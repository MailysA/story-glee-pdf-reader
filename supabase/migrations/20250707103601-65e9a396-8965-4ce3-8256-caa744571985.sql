-- Ajouter le compteur audio à la table user_usage
ALTER TABLE public.user_usage ADD COLUMN audio_generations_count integer NOT NULL DEFAULT 0;