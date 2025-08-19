import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Volume2, VolumeOff, SkipBack, SkipForward, Headphones, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  story: {
    id: string;
    title: string;
    content: string;
    audio_url?: string;
  };
  currentPage: number;
}

interface Voice {
  voice_id: string;
  name: string;
  description: string;
  elevenlabs_id: string;
}

interface SoundEffect {
  effect_id: string;
  name: string;
  file_url: string;
}

export const AudioPlayer = ({ story, currentPage }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("charlie");
  const [backgroundSound, setBackgroundSound] = useState("none");
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.75); // narration plus lente par défaut
  const [audioError, setAudioError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [soundEffects, setSoundEffects] = useState<SoundEffect[]>([]);
  const { isPremium, subscriptionTier, loading: subscriptionLoading } = useSubscription();
  const { incrementAudioGenerations, canGenerateAudio } = useUsageLimits();

  const audioRef = useRef<HTMLAudioElement>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement>(null);

  // Précharger l'audio existant au montage
  useEffect(() => {
    if (story.audio_url && audioRef.current) {
      console.log("Préchargement de l'audio existant:", story.audio_url);
      audioRef.current.src = story.audio_url;
      audioRef.current.preload = "metadata";
      audioRef.current.load();
    }
  }, [story.audio_url]);

  // Charger les voix et effets sonores depuis la base de données (en arrière-plan)
  useEffect(() => {
    const loadAudioData = async () => {
      try {
        // Utiliser des voix par défaut pendant le chargement
        const defaultVoices = [
          { voice_id: "charlie", name: "Charlie", description: "Voix douce", elevenlabs_id: "IKne3meq5aSn9XLyUdCD" },
          { voice_id: "sarah", name: "Sarah", description: "Voix claire", elevenlabs_id: "EXAVITQu4vr4xnSDxMaL" },
          { voice_id: "aria", name: "Aria", description: "Voix expressive", elevenlabs_id: "9BWtsMINqrJLrRacOk9x" }
        ];
        setAvailableVoices(defaultVoices);

        // Charger les vraies données en arrière-plan
        const [voicesResponse, effectsResponse] = await Promise.all([
          supabase.from('audio_voices').select('*').eq('is_active', true).order('name'),
          supabase.from('audio_effects').select('*').eq('is_active', true).order('name')
        ]);

        if (voicesResponse.data) setAvailableVoices(voicesResponse.data);
        if (effectsResponse.data) setSoundEffects(effectsResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données audio:', error);
        // Garder les voix par défaut en cas d'erreur
      }
    };

    loadAudioData();
  }, []);

  const generateAudio = async (text: string, voice: string) => {
    // Vérifier les limites avant de générer seulement si pas d'audio existant
    if (!story.audio_url && !isPremium && !canGenerateAudio) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez atteint la limite de générations audio gratuites (1). Passez au premium pour plus !",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAudioError(null);
    
    try {
      console.log("Génération audio avec voix:", voice);
      
      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: { 
          text,
          voice,
          model: 'eleven_multilingual_v2',
          storyId: story.id,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) {
        console.error("Erreur Supabase:", error);
        throw new Error(`Erreur serveur: ${error.message}`);
      }

      if (data?.audioUrl) {
        // Utiliser l'URL stockée dans Supabase Storage
        if (audioRef.current) {
          audioRef.current.src = data.audioUrl;
          audioRef.current.load();
        }
        
        // Incrémenter le compteur de générations audio uniquement si pas de cache
        if (!isPremium && !data?.fromCache) {
          await incrementAudioGenerations();
        }
        
        const message = data.fromCache 
          ? "Audio récupéré depuis le cache - aucun coût !"
          : "Audio généré avec succès et mis en cache";
          
        toast({
          title: data.fromCache ? "Cache utilisé" : "Audio généré",
          description: message,
        });
        
        console.log(message, data.audioUrl);
      } else {
        throw new Error("Aucune URL audio reçue du serveur");
      }
    } catch (error: any) {
      console.error("Erreur génération audio:", error);
      
      let errorMessage = "Impossible de générer l'audio.";
      
      if (error.message.includes("ELEVENLABS_API_KEY")) {
        errorMessage = error.message;
        setAudioError("API_KEY_MISSING");
      } else if (error.message.includes("401") || error.message.includes("unauthorized")) {
        errorMessage = "Clé API ElevenLabs invalide. Vérifiez votre configuration.";
        setAudioError("API_KEY_INVALID");
      } else if (error.message.includes("quota") || error.message.includes("limit")) {
        errorMessage = "Quota ElevenLabs dépassé. Vérifiez votre abonnement.";
        setAudioError("QUOTA_EXCEEDED");
      } else {
        setAudioError("GENERATION_ERROR");
      }
      
      toast({
        title: "Erreur audio",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = async () => {
    // Si l'histoire a déjà un audio_url, l'utiliser directement (lecture illimitée)
    if (story.audio_url && audioRef.current && !audioRef.current.src) {
      console.log("Chargement de l'audio existant:", story.audio_url);
      audioRef.current.src = story.audio_url;
      audioRef.current.load();
      
      // Attendre un court instant pour que l'audio soit prêt
      setTimeout(() => {
        if (audioRef.current && audioRef.current.readyState >= 1) {
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      }, 100);
      return;
    }
    
    // Sinon, générer l'audio si pas encore fait
    if (!audioRef.current?.src && !story.audio_url && !isLoading && !audioError) {
      await generateAudio(story.content, selectedVoice);
      return;
    }

    if (audioRef.current && audioRef.current.src) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          backgroundAudioRef.current?.pause();
        } else {
          await audioRef.current.play();
          if (backgroundSound !== "none") {
            backgroundAudioRef.current?.play().catch(console.error);
          }
        }
        setIsPlaying(!isPlaying);
      } catch (playError) {
        console.error("Erreur lecture:", playError);
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire l'audio. Essayez de régénérer.",
          variant: "destructive",
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100;
    }
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.volume = (value[0] / 100) * 0.3;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.muted = !isMuted;
    }
  };

  const changeVoice = async (voiceId: string) => {
    // Vérifier si l'utilisateur a un abonnement premium
    if (!isPremium) {
      toast({
        title: "Fonctionnalité Premium",
        description: "Le changement de voix nécessite un abonnement Premium.",
        variant: "destructive",
      });
      return;
    }

    const wasPlaying = isPlaying;
    const savedTime = currentTime;
    
    // Mettre en pause et sauvegarder la position
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      backgroundAudioRef.current?.pause();
      setIsPlaying(false);
    }
    
    setSelectedVoice(voiceId);
    setAudioError(null);
    
    try {
      // Générer le nouvel audio avec la nouvelle voix
      await generateAudio(story.content, voiceId);
      
      // Attendre que l'audio soit prêt et restaurer la position
      if (audioRef.current) {
        // Attendre que les métadonnées soient chargées
        if (audioRef.current.readyState >= 1) {
          // Les métadonnées sont déjà chargées
          audioRef.current.currentTime = savedTime;
          setCurrentTime(savedTime);
        } else {
          // Attendre le chargement des métadonnées
          await new Promise((resolve) => {
            const onLoadedMetadata = () => {
              if (audioRef.current) {
                audioRef.current.currentTime = savedTime;
                setCurrentTime(savedTime);
              }
              audioRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata);
              resolve(null);
            };
            audioRef.current?.addEventListener('loadedmetadata', onLoadedMetadata);
          });
        }
        
        // Reprendre la lecture si elle était en cours
        if (wasPlaying) {
          await audioRef.current.play();
          setIsPlaying(true);
          
          // Reprendre l'ambiance sonore si nécessaire
          if (backgroundSound !== "none" && backgroundAudioRef.current) {
            backgroundAudioRef.current.play().catch(console.error);
          }
        }
      }
      
      toast({
        title: "Voix changée",
        description: `Narration avec ${availableVoices.find(v => v.voice_id === voiceId)?.name} activée`,
      });
      
    } catch (error) {
      console.error("Erreur changement de voix:", error);
      toast({
        title: "Erreur",
        description: "Impossible de changer la voix. Réessayez.",
        variant: "destructive",
      });
    }
  };

  const handleBackgroundSoundChange = (soundId: string) => {
    // Vérifier si l'utilisateur a un abonnement premium
    if (!isPremium && soundId !== "none") {
      toast({
        title: "Fonctionnalité Premium",
        description: "Les effets sonores nécessitent un abonnement Premium.",
        variant: "destructive",
      });
      return;
    }

    setBackgroundSound(soundId);
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
    }
    
    if (soundId !== "none") {
      const sound = soundEffects.find(s => s.effect_id === soundId);
      if (sound && backgroundAudioRef.current) {
        backgroundAudioRef.current.src = sound.file_url;
        backgroundAudioRef.current.loop = true;
        backgroundAudioRef.current.onerror = () => {
          console.log(`Fichier audio ${sound.name} non trouvé`);
        };
        if (isPlaying) {
          backgroundAudioRef.current.play().catch(() => {
            console.log("Impossible de lire l'ambiance sonore");
          });
        }
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', () => setIsPlaying(false));
      
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Headphones className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Lecteur Audio Magique</h3>
          {audioError && (
            <div className="ml-auto flex items-center gap-1 text-orange-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">Configuration requise</span>
            </div>
          )}
        </div>

        {/* Audio Elements */}
        <audio ref={audioRef} preload="metadata" />
        <audio ref={backgroundAudioRef} preload="metadata" />

        {/* Error Message */}
        {audioError && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {audioError === "API_KEY_MISSING" && "Clé API ElevenLabs manquante"}
                {audioError === "API_KEY_INVALID" && "Clé API ElevenLabs invalide"}
                {audioError === "QUOTA_EXCEEDED" && "Quota ElevenLabs dépassé"}
                {audioError === "GENERATION_ERROR" && "Erreur de génération audio"}
              </span>
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Configurez votre clé API ElevenLabs dans les paramètres Supabase pour activer la narration audio.
            </p>
          </div>
        )}

        {/* Main Controls */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            size="lg"
            onClick={togglePlay}
            disabled={isLoading}
            className="w-12 h-12 rounded-full"
          >
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>

          <div className="flex-1">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeOff className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <div className="w-20">
              <Slider
                value={volume}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>

        {/* Advanced Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Voice Selection */}
          <div className={cn(!isPremium && "opacity-50 pointer-events-none")}>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              Voix du narrateur
              {!isPremium && (
                <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full font-bold">
                  PREMIUM
                </span>
              )}
              {isLoading && (
                <span className="ml-2 text-xs text-primary animate-pulse">
                  (changement en cours...)
                </span>
              )}
            </label>
            <Select 
              value={selectedVoice} 
              onValueChange={changeVoice} 
              disabled={isLoading || subscriptionLoading || !isPremium}
            >
              <SelectTrigger className={cn(
                isLoading ? "opacity-50" : "",
                !isPremium ? "opacity-70 cursor-not-allowed" : ""
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableVoices.map((voice) => (
                  <SelectItem key={voice.voice_id} value={voice.voice_id}>
                    <div>
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-xs text-muted-foreground">{voice.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Background Sound Selection */}
          <div className={cn(!isPremium && "opacity-50 pointer-events-none")}>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              Ambiance sonore
              {!isPremium && (
                <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full font-bold">
                  PREMIUM
                </span>
              )}
            </label>
            <Select 
              value={backgroundSound} 
              onValueChange={handleBackgroundSoundChange}
              disabled={subscriptionLoading || !isPremium}
            >
              <SelectTrigger className={!isPremium ? "opacity-70 cursor-not-allowed" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {soundEffects.map((sound) => (
                  <SelectItem key={sound.effect_id} value={sound.effect_id}>
                    {sound.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Playback Speed */}
          <div className={cn(!isPremium && "opacity-50 pointer-events-none")}>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              Vitesse de lecture
              {!isPremium && (
                <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full font-bold">
                  PREMIUM
                </span>
              )}
            </label>
            <Select 
              value={playbackRate.toString()} 
              onValueChange={isPremium ? (value) => setPlaybackRate(parseFloat(value)) : undefined}
              disabled={!isPremium || subscriptionLoading}
            >
              <SelectTrigger className={!isPremium ? "opacity-70 cursor-not-allowed" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.75">Lent (0.75x)</SelectItem>
                <SelectItem value="1">Normal (1x)</SelectItem>
                <SelectItem value="1.25">Rapide (1.25x)</SelectItem>
                <SelectItem value="1.5">Très rapide (1.5x)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Audio Reading Progress Bar */}
        {duration > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Progression de la lecture</span>
            </div>
            <Progress value={(currentTime / duration) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Écouté: {formatTime(currentTime)}</span>
              <span>Restant: {formatTime(duration - currentTime)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
