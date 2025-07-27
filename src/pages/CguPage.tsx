// components/CGU.tsx
import { X } from 'lucide-react';

interface CGUProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CGUPage = ({ isOpen, onClose }: CGUProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Conditions d'Utilisation</h2>
          <button onClick={onClose} className="p-1">
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 flex-1">
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold">1. SERVICE</h3>
              <p>Histoire Magique propose des histoires personnalisées générées par IA pour enfants de 3 à 8 ans.</p>
            </div>
            
            <div>
              <h3 className="font-semibold">2. TARIFICATION</h3>
              <p>• Prix de l'histoire : 2,99€</p>
              <p>• Paiement via App Store / Google Play</p>
              <p>• Pas de remboursement après téléchargement de l'histoire</p>
            </div>
            
            <div>
              <h3 className="font-semibold">3. DONNÉES COLLECTÉES</h3>
              <p>• Prénom de l'enfant</p>
              <p>• Âge et centres d'intérêt</p>
              <p>• Utilisation : génération d'histoires sur mesure uniquement</p>
              <p>• Pas de transfert de données à des tiers</p>
            </div>
            
            <div>
              <h3 className="font-semibold">4. PROPRIÉTÉ INTELLECTUELLE</h3>
              <p>Les histoires générées vous appartiennent. Le service utilise l'IA OpenAI.</p>
            </div>
            
            <div>
              <h3 className="font-semibold">5. ÉDITEUR ET MENTIONS LÉGALES</h3>
              <p>• Éditeur : Mailys Airouche</p>
              <p>• Statut : Auto-entrepreneur</p>
              <p>• SIRET : 94319355700015</p>
              <p>• Adresse : 70 rue dupaty, Bordeaux 33000 FRANCE</p>
              <p>• Email : mailys.airouche@gmail.com</p>
              <p>• Hébergement : Apple App Store / Google Play Store</p>
            </div>
            
            <div>
              <h3 className="font-semibold">6. DONNÉES PERSONNELLES (RGPD)</h3>
              <p>• Responsable de traitement : Mailys Airouche</p>
              <p>• Finalités : génération d'histoires personnalisées</p>
              <p>• Durée de conservation : jusqu'à suppression du compte</p>
              <p>• Droits : accès, rectification, suppression (contact email)</p>
              <p>• Pas de transfert de données à des tiers</p>
            </div>
            
            <div>
              <h3 className="font-semibold">7. RESPONSABILITÉS</h3>
              <p>• Le contenu est généré automatiquement par IA</p>
              <p>• Nous ne garantissons pas l'exactitude pédagogique</p>
              <p>• Supervision parentale recommandée</p>
              <p>• Pas de remboursement après téléchargement de l'histoire</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t">
          <button 
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            J'ai lu et j'accepte
          </button>
        </div>
      </div>
    </div>
  );
};