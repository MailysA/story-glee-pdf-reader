import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function Legal() {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Header avec boutons de navigation */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Accueil
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Mentions légales & Politique de confidentialité</h1>
      <h2 className="text-xl font-semibold mt-8 mb-2">Éditeur de l'application</h2>
      <p>Nom de l’éditeur : <b>Maïlys Airouche</b><br/>Adresse : <b>70 rue dupaty</b><br/>Contact : <b>sandboxmailys@gmail.com</b></p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Hébergement</h2>
      <p>Supabase (hébergement des données)</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Données personnelles</h2>
      <p>Les données collectées (email, prénom de l’enfant, etc.) sont utilisées uniquement pour le fonctionnement de l’application. Conformément au RGPD, vous pouvez demander la suppression de vos données à tout moment via l’interface ou en contactant l’éditeur.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Cookies</h2>
      <p>Cette application n’utilise pas de cookies de suivi tiers. Si cela change, une bannière de consentement sera ajoutée.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Conditions d’utilisation</h2>
      <p>L’utilisation de l’application est soumise à l’acceptation des présentes mentions légales. L’éditeur se réserve le droit de modifier l’application à tout moment.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Contact</h2>
      <p>Pour toute question ou demande concernant vos données personnelles, contactez-nous à l’adresse indiquée ci-dessus.</p>
    </div>
  );
} 