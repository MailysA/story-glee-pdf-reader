import React from "react";

export default function Legal() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Mentions légales & Politique de confidentialité</h1>
      <h2 className="text-xl font-semibold mt-8 mb-2">Éditeur de l'application</h2>
      <p>Nom de l’éditeur : <b>[À compléter]</b><br/>Adresse : <b>[À compléter]</b><br/>Contact : <b>[À compléter]</b></p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Hébergement</h2>
      <p>Supabase (hébergement des données)<br/>Vercel/Netlify/autre (hébergement du site) – à compléter selon ton cas</p>
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