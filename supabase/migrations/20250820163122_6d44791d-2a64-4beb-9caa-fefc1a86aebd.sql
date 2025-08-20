-- Create theme_categories table
CREATE TABLE public.theme_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create themes table  
CREATE TABLE public.themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.theme_categories(id) ON DELETE CASCADE,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  video TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.theme_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (themes are public content)
CREATE POLICY "Theme categories are viewable by everyone" 
ON public.theme_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Themes are viewable by everyone" 
ON public.themes 
FOR SELECT 
USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_theme_categories_updated_at
BEFORE UPDATE ON public.theme_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_themes_updated_at
BEFORE UPDATE ON public.themes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert theme categories
INSERT INTO public.theme_categories (name, icon) VALUES
('Contes et Magie', '✨'),
('Aventures', '🗺️'),
('Animaux', '🦁'),
('Histoire et Époques', '🏰'),
('Science et Futur', '🚀'),
('Émotions et Valeurs', '❤️');

-- Insert themes with their categories
WITH category_ids AS (
  SELECT id, name FROM public.theme_categories
)
INSERT INTO public.themes (category_id, value, label, description, video) VALUES
-- Contes et Magie
((SELECT id FROM category_ids WHERE name = 'Contes et Magie'), 'conte-de-fees', '✨ Conte de Fées', 'Histoires magiques avec fées, sorts et enchantements', '/videos/farytail.mp4'),
((SELECT id FROM category_ids WHERE name = 'Contes et Magie'), 'magie', '🪄 Magie', 'Aventures pleines de sortilèges et de pouvoirs magiques', '/videos/magic-house.mp4'),
((SELECT id FROM category_ids WHERE name = 'Contes et Magie'), 'foret-magique', '🌲 Forêt Magique', 'Explorations dans des forêts enchantées', '/videos/magic-forest.mp4'),
((SELECT id FROM category_ids WHERE name = 'Contes et Magie'), 'sorciere', '🧙‍♀️ Sorcière', 'Histoires avec des sorcières bienveillantes ou mystérieuses', '/videos/witch.mp4'),
((SELECT id FROM category_ids WHERE name = 'Contes et Magie'), 'fantome', '👻 Fantôme', 'Aventures avec des fantômes amicaux', '/videos/ghost.mp4'),

-- Aventures
((SELECT id FROM category_ids WHERE name = 'Aventures'), 'aventure', '🗺️ Aventure', 'Grandes explorations et découvertes', '/videos/adventure1.mp4'),
((SELECT id FROM category_ids WHERE name = 'Aventures'), 'pirate', '🏴‍☠️ Pirates', 'Aventures en mer avec des pirates sympathiques', '/videos/pirate.mp4'),
((SELECT id FROM category_ids WHERE name = 'Aventures'), 'princesse', '👑 Princesse', 'Histoires de princesses courageuses et indépendantes', '/videos/princess.mp4'),
((SELECT id FROM category_ids WHERE name = 'Aventures'), 'ocean', '🌊 Océan', 'Explorations des fonds marins et créatures aquatiques', '/videos/ocean.mp4'),
((SELECT id FROM category_ids WHERE name = 'Aventures'), 'banquise', '🐧 Banquise', 'Aventures dans les régions polaires', '/videos/banquise.mp4'),

-- Animaux
((SELECT id FROM category_ids WHERE name = 'Animaux'), 'dinosaures', '🦕 Dinosaures', 'Rencontres avec des dinosaures dans des mondes préhistoriques', '/videos/dinosaures.mp4'),
((SELECT id FROM category_ids WHERE name = 'Animaux'), 'foret', '🌳 Forêt', 'Aventures avec les animaux de la forêt', '/videos/forest1.mp4'),
((SELECT id FROM category_ids WHERE name = 'Animaux'), 'cirque', '🎪 Cirque', 'Spectacles et aventures dans le monde du cirque', '/videos/circus.mp4'),

-- Histoire et Époques
((SELECT id FROM category_ids WHERE name = 'Histoire et Époques'), 'egypte', '🏺 Égypte', 'Découvertes dans l''Égypte ancienne avec pharaons et pyramides', '/videos/egypte.mp4'),
((SELECT id FROM category_ids WHERE name = 'Histoire et Époques'), 'moyen-age', '⚔️ Moyen Âge', 'Aventures de chevaliers et châteaux médiévaux', '/videos/moyen-age.mp4'),
((SELECT id FROM category_ids WHERE name = 'Histoire et Époques'), 'renaissance', '🎨 Renaissance', 'Époque des grands artistes et inventeurs', '/videos/renaissance.mp4'),
((SELECT id FROM category_ids WHERE name = 'Histoire et Époques'), 'revolution', '🎺 Révolution', 'Périodes de grands changements historiques', '/videos/revolution.mp4'),

-- Science et Futur
((SELECT id FROM category_ids WHERE name = 'Science et Futur'), 'robots', '🤖 Robots', 'Aventures avec des robots amicaux dans le futur', '/videos/robots.mp4'),
((SELECT id FROM category_ids WHERE name = 'Science et Futur'), 'alien', '👽 Aliens', 'Rencontres avec des extraterrestres bienveillants', '/videos/alien.mp4'),
((SELECT id FROM category_ids WHERE name = 'Science et Futur'), 'industriel', '🏭 Industriel', 'Découvertes du monde industriel et des machines', '/videos/industriel.mp4'),

-- Émotions et Valeurs
((SELECT id FROM category_ids WHERE name = 'Émotions et Valeurs'), 'emotions', '😊 Émotions', 'Histoires pour comprendre et exprimer ses émotions', '/videos/emotions.mp4'),
((SELECT id FROM category_ids WHERE name = 'Émotions et Valeurs'), 'respect', '🤝 Respect', 'Apprentissage du respect et de la tolérance', '/videos/respect.mp4'),
((SELECT id FROM category_ids WHERE name = 'Émotions et Valeurs'), 'bonnes-manieres', '🎩 Bonnes Manières', 'Apprentissage de la politesse et du savoir-vivre', '/videos/goodmaners.mp4'),
((SELECT id FROM category_ids WHERE name = 'Émotions et Valeurs'), 'environnement', '🌱 Environnement', 'Sensibilisation à la protection de la nature', '/videos/environment.mp4'),
((SELECT id FROM category_ids WHERE name = 'Émotions et Valeurs'), 'recyclage', '♻️ Recyclage', 'Importance du recyclage et de l''écologie', '/videos/recycling.mp4'),

-- Thèmes éducatifs supplémentaires
((SELECT id FROM category_ids WHERE name = 'Émotions et Valeurs'), 'alphabet', '🔤 Alphabet', 'Apprentissage ludique des lettres', '/videos/alphabet.mp4'),
((SELECT id FROM category_ids WHERE name = 'Émotions et Valeurs'), 'nombres', '🔢 Nombres', 'Découverte des chiffres et du calcul', '/videos/numbers.mp4'),
((SELECT id FROM category_ids WHERE name = 'Émotions et Valeurs'), 'logique', '🧩 Logique', 'Développement de la pensée logique', '/videos/logic.mp4'),
((SELECT id FROM category_ids WHERE name = 'Aventures'), 'livre', '📚 Livre', 'L''amour de la lecture et des histoires', '/videos/book.mp4'),
((SELECT id FROM category_ids WHERE name = 'Contes et Magie'), 'bonbons', '🍭 Bonbons', 'Aventures sucrées dans un monde de confiseries', '/videos/candys.mp4');