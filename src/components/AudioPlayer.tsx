import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Volume2, VolumeOff, SkipBack, SkipForward, Headphones } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  id: string;
  name: string;
  description: string;
}

const AVAILABLE_VOICES: Voice[] = [
  { id: "sarah", name: "Sarah", description: "Voix douce et maternelle" },
  { id: "laura", name: "Laura", description: "Voix énergique et joyeuse" },
  { id: "charlie", name: "Charlie", description: "Voix grave et apaisante" },
  { id: "aria", name: "Aria", description: "Voix claire et expressive" },
];

const SOUND_EFFECTS = [
  { id: "birds", name: "Oiseaux de la forêt", url: "/sounds/birds.mp3" },
  { id: "rain", name: "Pluie apaisante", url: "/sounds/rain.mp3" },
  { id: "seagull", name: "Mouettes océaniques", url: "/sounds/seagull.mp3" },
  { id: "page-flip", name: "Tournage de pages", url: "/sounds/page-flip.mp3" },
  { id: "laugh", name: "Rires joyeux", url: "/sounds/laught.mp3" },
  { id: "none", name: "Aucun", url: "" },
];

export const AudioPlayer = ({ story, currentPage }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(AVAILABLE_VOICES[0].id);
  const [backgroundSound, setBackgroundSound] = useState("none");
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const audioRef = useRef<HTMLAudioElement>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement>(null);

  const generateAudio = async (text: string, voice: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: { 
          text,
          voice,
          model: 'eleven_multilingual_v2'
        }
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.load();
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur audio",
        description: "Impossible de générer l'audio. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current?.src && !isLoading) {
      // Générer l'audio si pas encore fait
      await generateAudio(story.content, selectedVoice);
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        backgroundAudioRef.current?.pause();
      } else {
        audioRef.current.play();
        if (backgroundSound !== "none") {
          backgroundAudioRef.current?.play();
        }
      }
      setIsPlaying(!isPlaying);
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
      backgroundAudioRef.current.volume = (value[0] / 100) * 0.3; // Background plus faible
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
    setSelectedVoice(voiceId);
    if (audioRef.current?.src) {
      await generateAudio(story.content, voiceId);
    }
  };

  const changeBackgroundSound = (soundId: string) => {
    setBackgroundSound(soundId);
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
    }
    
    if (soundId !== "none") {
      const sound = SOUND_EFFECTS.find(s => s.id === soundId);
      if (sound && backgroundAudioRef.current) {
        backgroundAudioRef.current.src = sound.url;
        backgroundAudioRef.current.loop = true;
        backgroundAudioRef.current.onerror = () => {
          toast({
            title: "Fichier audio manquant",
            description: `Le fichier ${sound.name} n'est pas disponible. Ajoutez un vrai fichier .mp3 dans public/sounds/`,
            variant: "destructive",
          });
        };
        if (isPlaying) {
          backgroundAudioRef.current.play().catch(() => {
            // Ignore si le fichier n'existe pas
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
        </div>

        {/* Audio Elements */}
        <audio ref={audioRef} preload="metadata" />
        <audio ref={backgroundAudioRef} preload="metadata" />

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
          <div>
            <label className="block text-sm font-medium mb-2">Voix du narrateur</label>
            <Select value={selectedVoice} onValueChange={changeVoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div>
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-xs text-muted-foreground">{voice.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Background Sound */}
          <div>
            <label className="block text-sm font-medium mb-2">Ambiance sonore</label>
            <Select value={backgroundSound} onValueChange={changeBackgroundSound}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOUND_EFFECTS.map((sound) => (
                  <SelectItem key={sound.id} value={sound.id}>
                    {sound.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Playback Speed */}
          <div>
            <label className="block text-sm font-medium mb-2">Vitesse de lecture</label>
            <Select value={playbackRate.toString()} onValueChange={(value) => setPlaybackRate(parseFloat(value))}>
              <SelectTrigger>
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
      </CardContent>
    </Card>
  );
};