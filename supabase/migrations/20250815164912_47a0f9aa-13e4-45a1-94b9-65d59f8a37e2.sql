-- Create tables for audio configuration
CREATE TABLE public.audio_voices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voice_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  elevenlabs_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.audio_effects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  effect_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audio_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_effects ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (these are configuration data)
CREATE POLICY "Audio voices are viewable by everyone" 
ON public.audio_voices 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Audio effects are viewable by everyone" 
ON public.audio_effects 
FOR SELECT 
USING (is_active = true);

-- Create trigger for timestamp updates
CREATE TRIGGER update_audio_voices_updated_at
BEFORE UPDATE ON public.audio_voices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audio_effects_updated_at
BEFORE UPDATE ON public.audio_effects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert voice data
INSERT INTO public.audio_voices (voice_id, name, description, elevenlabs_id) VALUES
('sarah', 'Sarah', 'Voix douce et maternelle', 'EXAVITQu4vr4xnSDxMaL'),
('laura', 'Laura', 'Voix énergique et joyeuse', 'FGY2WhTYpPnrIDTdsKH5'),
('charlie', 'Charlie', 'Voix grave et apaisante', 'IKne3meq5aSn9XLyUdCD'),
('aria', 'Aria', 'Voix claire et expressive', '9BWtsMINqrJLrRacOk9x');

-- Insert sound effects data
INSERT INTO public.audio_effects (effect_id, name, file_url) VALUES
('birds', 'Oiseaux de la forêt', '/sounds/birds.mp3'),
('rain', 'Pluie apaisante', '/sounds/rain.mp3'),
('seagull', 'Mouettes océaniques', '/sounds/seagull.mp3'),
('page-flip', 'Tournage de pages', '/sounds/page-flip.mp3'),
('laugh', 'Rires joyeux', '/sounds/laught.mp3'),
('none', 'Aucun', '');