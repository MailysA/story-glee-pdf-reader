-- Fusionner les tables subscribers et profiles en une seule table user_profiles
-- Étape 1: Créer la nouvelle table user_profiles avec toutes les colonnes nécessaires
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Informations du profil (anciennes colonnes profiles)
  child_age INTEGER,
  child_name TEXT,
  parent_email TEXT,
  favorite_themes TEXT[],
  
  -- Informations d'abonnement (anciennes colonnes subscribers)
  email TEXT NOT NULL,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Étape 2: Migrer les données existantes
-- D'abord, insérer les données des subscribers avec leurs emails
INSERT INTO public.user_profiles (
  user_id, email, subscribed, subscription_tier, subscription_end, stripe_customer_id, created_at, updated_at
)
SELECT 
  user_id, email, subscribed, subscription_tier, subscription_end, stripe_customer_id, created_at, updated_at
FROM public.subscribers
WHERE user_id IS NOT NULL;

-- Ensuite, mettre à jour avec les données des profiles (en cas de conflit, garder les données profiles pour parent_email)
UPDATE public.user_profiles 
SET 
  child_age = p.child_age,
  child_name = p.child_name,
  parent_email = COALESCE(p.parent_email, user_profiles.email),
  favorite_themes = p.favorite_themes,
  updated_at = GREATEST(user_profiles.updated_at, p.updated_at)
FROM public.profiles p
WHERE user_profiles.user_id = p.user_id;

-- Insérer les profils qui n'ont pas de subscriber correspondant
INSERT INTO public.user_profiles (
  user_id, email, child_age, child_name, parent_email, favorite_themes, created_at, updated_at
)
SELECT 
  p.user_id,
  COALESCE(p.parent_email, ''), -- Utiliser parent_email comme email par défaut
  p.child_age,
  p.child_name,
  p.parent_email,
  p.favorite_themes,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.user_id = p.user_id
);

-- Étape 3: Activer RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Étape 4: Créer les politiques RLS
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Politique spéciale pour les mises à jour d'abonnement (pour Stripe webhooks)
CREATE POLICY "Allow subscription updates by email" 
ON public.user_profiles 
FOR UPDATE 
USING (true); -- Sera utilisé avec les service role keys

-- Étape 5: Créer le trigger pour updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Étape 6: Supprimer les anciennes tables (une fois que le code est mis à jour)
-- DROP TABLE public.subscribers;
-- DROP TABLE public.profiles;