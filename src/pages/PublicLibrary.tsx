import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Pause, Home, Clock, User, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StoryReader } from "@/components/StoryReader";

// Histoires pré-générées les plus longues
const publicStories = [
  {
    id: "story-1",
    title: "Emma et le Château des Dinosaures Magiques",
    theme: "dinosaures",
    child_name: "Emma",
    child_age: 6,
    story_content: `Il était une fois une petite fille courageuse nommée Emma, âgée de 6 ans, qui découvrit un jour un portail secret dans son jardin.

En traversant ce portail scintillant, Emma se retrouva dans un monde extraordinaire où les dinosaures n'avaient jamais disparu ! Mais ces dinosaures étaient spéciaux : ils parlaient et possédaient des pouvoirs magiques.

Le premier dinosaure qu'Emma rencontra était Tricéra, un tricératops rose avec des cornes dorées qui brillaient au soleil. "Bonjour Emma !" dit Tricéra d'une voix douce. "Nous t'attendions ! Tu es la Gardienne choisie pour sauver notre château magique."

Emma apprit que le Grand Château des Dinosaures était menacé par les Ombres Grises, des créatures qui voulaient voler toute la couleur et la magie du monde des dinosaures. Seule une enfant au cœur pur pourrait les arrêter.

Accompagnée de ses nouveaux amis - Vélocita la raptor violette qui courait plus vite que le vent, Diplodo le diplodocus bleu qui pouvait s'étirer jusqu'aux nuages, et Stégo le stégosaure orange dont les épines brillaient comme des étoiles - Emma entreprit un voyage épique.

Leur première aventure les mena à travers la Forêt des Fougères Géantes, où chaque feuille était plus grande qu'Emma. Les arbres murmuraient des indices pour trouver la première Gemme de Couleur. Emma utilisa sa bravoure et son intelligence pour résoudre l'énigme des arbres : "Celui qui donne sans attendre de retour trouvera ce qu'il cherche."

Emma partagea ses bonbons avec un petit compsmajurus triste et affamé. Aussitôt, l'arbre le plus grand s'illumina et révéla la Gemme Rouge du Courage, cachée dans ses racines.

La deuxième quête les emmena aux Montagnes Cristallines, où vivait le sage Brachio le brachiosaure. Pour obtenir la Gemme Bleue de la Sagesse, Emma dut répondre à trois devinettes très difficiles. Grâce à tout ce qu'elle avait appris à l'école et à sa curiosité naturelle, elle réussit brillamment.

La dernière épreuve était la plus dangereuse : affronter les Ombres Grises dans leur repaire sombre. Mais Emma avait maintenant confiance en elle et en ses amis dinosaures. Ensemble, ils utilisèrent la puissance des Gemmes de Couleur pour ramener la lumière et la joie dans tout le royaume.

Le château retrouva ses couleurs arc-en-ciel, et tous les dinosaures organisèrent une grande fête en l'honneur d'Emma. Avant de repartir chez elle, Tricéra lui offrit un collier magique : "Si tu as besoin de nous, ce collier brillera et tu pourras revenir nous voir."

Emma retourna dans son jardin, le cœur rempli de souvenirs merveilleux et l'esprit plein de nouvelles aventures. Elle savait que ses amis dinosaures l'attendraient toujours dans leur monde magique.

Et depuis ce jour, chaque fois qu'Emma regardait les étoiles, elle voyait briller les épines de Stégo qui lui faisait un clin d'œil depuis son château arc-en-ciel.`,
    created_at: "2024-01-15T10:00:00Z",
    audio_url: null
  },
  {
    id: "story-2", 
    title: "Lucas et l'Expédition dans la Forêt Enchantée",
    theme: "foret-enchantee",
    child_name: "Lucas",
    child_age: 8,
    story_content: `Lucas était un petit garçon de 8 ans passionné par la nature et les mystères de la forêt. Un matin brumeux, en se promenant près de chez lui, il découvrit un sentier qu'il n'avait jamais vu auparavant, bordé de champignons lumineux qui clignotaient doucement.

Curieux et aventurier, Lucas suivit ce chemin magique qui le mena au cœur de la Forêt Enchantée, un lieu où la magie était partout : les arbres avaient des visages bienveillants, les fleurs chantaient des mélodies douces, et les ruisseaux murmuraient des secrets anciens.

Sa première rencontre fut avec Sylvie l'écureuil, qui portait un petit chapeau violet et parlait d'une voix cristalline. "Bienvenue Lucas ! Nous avons besoin de ton aide. La Reine des Fées a perdu ses pouvoirs magiques et sans elle, notre forêt va perdre toute sa magie."

Sylvie expliqua que pour aider la Reine, Lucas devait collecter trois Cristaux de Nature : le Cristal Vert de la Terre, le Cristal Bleu de l'Eau, et le Cristal Doré du Soleil. Chaque cristal était gardé par un gardien de la forêt qui ne le donnerait qu'à quelqu'un de pur de cœur.

La première étape conduisit Lucas au Chêne Millénaire, l'arbre le plus ancien de la forêt. Son gardien était Barbe-Mousse, un vieil homme-arbre à la barbe faite de mousse et aux yeux verts comme les feuilles. "Pour mériter le Cristal Vert," dit-il de sa voix profonde comme le bois, "tu dois prouver que tu respectes la nature."

Lucas passa toute une journée à aider la forêt : il replanta des jeunes pousses, nettoya un ruisseau pollué par des déchets laissés par d'anciens visiteurs, et soigna un jeune cerf blessé. Impressionné par sa générosité et son respect pour tous les êtres vivants, Barbe-Mousse lui remit le Cristal Vert qui brillait comme une émeraude.

Pour le deuxième cristal, Lucas dut se rendre à la Cascade Argentée, où vivait Ondine, une fée des eaux aux cheveux bleus comme les vagues. Elle défia Lucas de résoudre le mystère de la rivière qui avait cessé de chanter. En observant attentivement, Lucas découvrit qu'un énorme rocher bloquait le cours d'eau. Avec l'aide de ses nouveaux amis - une famille de castors magiques - ils réussirent à déplacer l'obstacle.

L'eau se remit à couler joyeusement en chantant sa mélodie aquatique, et Ondine, émue par l'intelligence et la persévérance de Lucas, lui offrit le Cristal Bleu qui scintillait comme l'océan.

Le dernier défi était le plus périlleux. Le Cristal Doré était gardé par Phénix, l'oiseau de feu qui vivait au sommet de la Montagne de Lumière. Pour l'atteindre, Lucas dut escalader des parois escarpées, traverser des ponts de nuages, et surmonter sa peur des hauteurs.

Quand il atteignit enfin le nid de Phénix, l'oiseau majestueux aux plumes dorées et flamboyantes lui dit : "Le courage ne signifie pas ne pas avoir peur, mais agir malgré sa peur. Tu as prouvé que tu possèdes ce vrai courage." Phénix lui remit le Cristal Doré qui rayonnait comme un petit soleil.

De retour au Palais de Cristal où résidait la Reine des Fées, Lucas plaça les trois cristaux dans un autel magique. Une lumière éblouissante emplit la salle, et la Reine retrouva tous ses pouvoirs. Reconnaissante, elle nomma Lucas "Protecteur Honoraire de la Forêt Enchantée" et lui offrit une cape tissée de rayons de lune qui le protégerait toujours.

Avant de rentrer chez lui, tous les habitants de la forêt organisèrent une grande célébration. Les fées dansaient dans les airs, les animaux chantaient en chœur, et même les arbres balançaient leurs branches en rythme.

Lucas retourna chez lui par le sentier magique, mais il savait qu'il pourrait revenir quand il le souhaiterait. Et effectivement, chaque fois qu'il avait besoin de réconfort ou d'aventure, les champignons lumineux réapparaissaient pour le guider vers ses amis de la Forêt Enchantée.

Depuis ce jour, Lucas devint le meilleur défenseur de la nature de son village, inspirant tous ses amis à protéger et respecter l'environnement.`,
    created_at: "2024-01-20T14:30:00Z", 
    audio_url: null
  },
  {
    id: "story-3",
    title: "Chloé et le Mystère du Cirque Magique",
    theme: "cirque",
    child_name: "Chloé", 
    child_age: 7,
    story_content: `Chloé, une petite fille de 7 ans aux yeux pétillants de curiosité, adorait tout ce qui brillait et scintillait. Un soir, en regardant par sa fenêtre, elle aperçut des lumières colorées qui dansaient au loin, accompagnées d'une musique joyeuse qui semblait l'appeler.

Sans hésiter, Chloé suivit les sons et les lumières qui la menèrent à une clairière où s'était installé le plus extraordinaire des cirques : le Cirque Magique de la Lune d'Argent ! Les chapiteaux étaient faits de tissus qui changeaient de couleur selon l'humeur, et des étoiles filantes servaient de projecteurs.

À l'entrée, Chloé rencontra Monsieur Mystère, le directeur du cirque. C'était un homme élégant avec un haut-de-forme étoilé et une cape qui scintillait comme la voie lactée. "Bonsoir Chloé !" dit-il avec un sourire chaleureux. "Nous t'attendions ! Tu es celle qui peut nous aider à résoudre le grand mystère de notre cirque."

Monsieur Mystère expliqua que depuis quelques jours, la magie du cirque s'affaiblissait. Les numéros perdaient leur éclat, les animaux magiques devenaient tristes, et même les rires du public commençaient à s'estomper. "La source de notre magie, l'Étoile du Spectacle, a mystérieusement disparu. Sans elle, notre cirque va bientôt perdre tous ses pouvoirs."

Chloé accepta aussitôt de les aider. Sa première rencontre fut avec Pirouette, une acrobate-fée aux ailes multicolores qui voltigeait gracieusement entre les cordes. "L'Étoile était gardée dans la Tente des Merveilles," expliqua Pirouette en tourbillonnant. "Mais la nuit dernière, nous avons entendu des bruits étranges, et au matin, l'Étoile avait disparu !"

Chloé commença son enquête comme une vraie détective. Dans la Tente des Merveilles, elle découvrit des indices intrigants : des traces de pas minuscules, des paillettes dorées éparpillées, et une plume irisée qui brillait faiblement. "Ces traces sont trop petites pour être celles d'un humain," observa Chloé intelligemment.

Sa deuxième rencontre fut avec Coco le clown, qui n'arrivait plus à faire rire personne depuis la disparition de l'Étoile. Ses blagues tombaient à plat, ses tours de magie échouaient, et même ses ballons se dégonflaient tristement. "Je me sens si inutile sans ma magie du rire," soupira Coco, ses larmes faisant des petites flaques colorées.

Chloé le réconforta et lui promit qu'ils retrouveraient l'Étoile ensemble. En observant attentivement, elle remarqua que les paillettes dorées formaient un chemin qui menait vers la Caravane des Animaux Extraordinaires.

Là, elle rencontra Léo, un lion qui parlait et qui était très inquiet. "Ma meilleure amie Plume, le petit dragon domestique du cirque, a disparu en même temps que l'Étoile," avoua-t-il. "Mais je ne pense pas qu'elle l'ait volée. Plume est la créature la plus gentille et la plus loyale du cirque."

Chloé eut alors une idée brillante. Et si Plume n'avait pas volé l'Étoile, mais essayait plutôt de la protéger ? Suivant les paillettes et sa intuition, Chloé découvrit une grotte secrète derrière le chapiteau principal.

À l'intérieur, elle trouva Plume, un adorable petit dragon aux écailles irisées, qui couvait précieusement l'Étoile du Spectacle. Mais quelque chose n'allait pas : l'Étoile était fendue et sa lumière faiblissait dangereusement.

"Plume !" s'exclama Chloé doucement. "Tu essayais de protéger l'Étoile !" Le petit dragon hocha tristement la tête et expliqua dans sa langue musicale que des corbeaux maléfiques avaient tenté de voler l'Étoile pour en absorber la magie. Dans la bataille, l'Étoile s'était fissurée.

Chloé comprit qu'il fallait réparer l'Étoile, mais comment ? Elle se souvint alors des paroles de sa grand-mère : "La vraie magie vient du cœur et se partage avec amour."

Chloé eut une idée géniale. Elle rassembla tous les artistes du cirque autour de l'Étoile brisée. "Si nous mettons tous ensemble notre amour du spectacle et notre joie de faire rêver les gens, peut-être que nous pourrons la réparer !"

Pirouette dansa autour de l'Étoile en répandant de la poussière de rêve, Coco raconta ses meilleures blagues pour faire revenir le rire, Léo rugit une chanson courageuse, et même Plume souffla de petites flammes colorées qui sentaient la barbe à papa.

Chloé, au centre du cercle, ferma les yeux et souhaita de tout son cœur que la magie revienne pour que tous puissent continuer à faire rêver les enfants du monde entier.

Soudain, l'Étoile du Spectacle se recomposa dans un éclat lumineux magnifique, plus brillante qu'jamais ! La magie du cirque fut non seulement restaurée, mais renforcée par l'amour et l'amitié de tous.

Pour remercier Chloé, Monsieur Mystère lui offrit une place d'honneur comme "Détective Officielle du Cirque" et lui remit une petite étoile magique qui lui permettrait de revenir au cirque quand elle le souhaiterait.

La représentation de ce soir-là fut la plus extraordinaire de l'histoire du Cirque Magique. Chloé eut même le droit de participer en tant qu'assistante de Coco le clown, faisant rire tout le public avec ses grimaces adorables.

Quand vint l'heure de rentrer chez elle, tous les artistes formèrent une haie d'honneur scintillante pour dire au revoir à leur petite héroïne. Chloé repartit avec des étoiles plein les yeux et la certitude qu'elle avait vécu la plus belle aventure de sa vie.

Et maintenant, chaque fois qu'elle entend une musique joyeuse dans le vent, Chloé sait que ses amis du Cirque Magique pensent à elle et l'invitent à de nouvelles aventures extraordinaires.`,
    created_at: "2024-01-25T16:45:00Z",
    audio_url: null
  }
];

export default function PublicLibrary() {
  const navigate = useNavigate();
  const [selectedStory, setSelectedStory] = useState<typeof publicStories[0] | null>(null);

  const handleReadStory = (story: typeof publicStories[0]) => {
    setSelectedStory(story);
  };

  const handleBackToLibrary = () => {
    setSelectedStory(null);
  };

  if (selectedStory) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <Button
            onClick={handleBackToLibrary}
            variant="outline"
            className="mb-4"
          >
            ← Retour à la bibliothèque
          </Button>
          <StoryReader story={{
            ...selectedStory,
            content: selectedStory.story_content
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold text-foreground">Bibliothèque Publique</h1>
            <Star className="w-12 h-12 text-yellow-500 animate-bounce" />
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Découvrez notre collection d'histoires magiques disponibles sans connexion. 
            Ces aventures extraordinaires sont sélectionnées parmi nos créations les plus captivantes !
          </p>
          
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Créer mon histoire
            </Button>
          </div>
        </div>

        {/* Notice */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            🌟 Histoires disponibles hors connexion - Aucune inscription requise
          </Badge>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicStories.map((story) => (
            <Card key={story.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold mb-2">
                      {story.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Une aventure pour {story.child_name}, {story.child_age} ans
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {story.theme}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Story Preview */}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {story.story_content.substring(0, 150)}...
                  </p>

                  {/* Story Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.ceil(story.story_content.length / 1000)} min de lecture
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {story.child_age} ans
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReadStory(story)}
                      className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Lire l'histoire
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="text-2xl">
                Envie de créer votre propre histoire ?
              </CardTitle>
              <CardDescription className="text-lg">
                Personnalisez une aventure unique pour votre enfant avec nos outils magiques !
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/dashboard")}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow px-8 py-4 text-lg"
              >
                <BookOpen className="w-6 h-6 mr-3" />
                Créer une histoire personnalisée
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}