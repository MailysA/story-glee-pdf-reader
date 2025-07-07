import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CreditCard, LogOut, Trash2 } from "lucide-react";
import { useState } from "react";

interface AccountManagementProps {
  isPremium: boolean;
  onUnsubscribe: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export function AccountManagement({ 
  isPremium, 
  onUnsubscribe, 
  onSignOut, 
  onDeleteAccount 
}: AccountManagementProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (action: () => Promise<void>, actionType: string) => {
    setIsLoading(actionType);
    try {
      await action();
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <>
      {/* Premium subscription management */}
      {isPremium && (
        <div className="border-t pt-4 space-y-2">
          <div className="text-sm font-medium mb-2">Gestion du compte</div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <CreditCard className="w-4 h-4" />
                Se désabonner
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer le désabonnement</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir vous désabonner ? Vous perdrez l'accès aux fonctionnalités premium mais conserverez vos histoires existantes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleAction(onUnsubscribe, 'unsubscribe')} 
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={isLoading === 'unsubscribe'}
                >
                  {isLoading === 'unsubscribe' ? 'Traitement...' : 'Confirmer le désabonnement'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      
      {/* General account actions */}
      <div className="border-t pt-4 space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction(onSignOut, 'signout')}
          disabled={isLoading === 'signout'}
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          {isLoading === 'signout' ? 'Déconnexion...' : 'Déconnexion'}
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer mon compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer définitivement le compte</AlertDialogTitle>
              <AlertDialogDescription>
                ⚠️ Cette action est irréversible. Toutes vos histoires, paramètres et données seront définitivement supprimés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleAction(onDeleteAccount, 'delete')} 
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading === 'delete'}
              >
                {isLoading === 'delete' ? 'Suppression...' : 'Supprimer définitivement'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}