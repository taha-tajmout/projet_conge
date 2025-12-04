import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { UtilisateurService } from '../utilisateur.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DemandeService } from '../demande.service';
import { catchError,throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
      

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  // PropriÃ©tÃ©s
demandesEnAttente: any[] = []; // Initialisez le tableau
showModal = false;
congesPris: number = 0;
demandesEnAttenteCount: number = 0;
showRejectReason = false;
rejectReason = '';
currentDemande: any = null; // Stocker la demande sÃ©lectionnÃ©e
  userData: any;
  conges: any[] = []; // Vous devrez crÃ©er un service pour les congÃ©s plus tard
  nouvelleDemande:any=null;
  // Nouvelles propriÃ©tÃ©s pour la gestion du compte
  showAccountModal: boolean = false;
  utilisateurModifie: any = {};
   // Nouvelle propriÃ©tÃ© pour le message de succÃ¨s
  showSuccessMessage: boolean = false;
  showPassword: boolean=false;

  constructor(
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
     private demandeService: DemandeService,
    private router: Router
  ) {    // RÃ©cupÃ©ration des donnÃ©es de navigation
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.nouvelleDemande = navigation.extras.state['nouvelleDemande'];
       console.log('Nouvelle demande reÃ§ue:', this.nouvelleDemande);
     // if (this.nouvelleDemande) {
       // this.conges.unshift(this.nouvelleDemande); // Ajoute en dÃ©but de tableau
      //}
    }
    
    // Écouter l'événement personnalisé pour ouvrir la modal du compte
    window.addEventListener('openAccountModal', () => {
      this.ouvrirModalCompte();
    });
  }
  // Nouvelles mÃ©thodes pour la gestion du compte
 // Remplacez cette mÃ©thode dans votre dashboard.ts

// Nouvelles mÃ©thodes pour la gestion du compte
ouvrirModalCompte(): void {
  if (this.isAdmin()) {
    // Pour les admins, préparer les données depuis sessionStorage
    const adminData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    this.utilisateurModifie = {
      email: adminData.email || '',
      motDePasse: '' // Le mot de passe sera saisi par l'admin
    };
  } else {
    // Pour les utilisateurs normaux
    this.utilisateurModifie = {...this.userData};
  }
  this.showAccountModal = true;
}

  fermerModalCompte(): void {
    this.showAccountModal = false;
    this.utilisateurModifie = {};
  }

  mettreAJourCompte(): void {
  // Pour les admins, utilisez un service différent ou adaptez la logique
  if (this.isAdmin()) {
    // Vous pouvez créer une méthode spéciale pour les admins
    // ou utiliser la même méthode avec des paramètres différents
    this.utilisateurService.mettreAJourAdmin(this.utilisateurModifie).subscribe({
      next: (data) => {
        // Mettre à jour les données admin dans la session
        sessionStorage.setItem('currentUser', JSON.stringify(data));
        this.userData = data;
        this.showSuccessMessage = true;
        this.fermerModalCompte();
        
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 5000);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour admin', err);
        alert('Une erreur est survenue lors de la mise à jour');
      }
    });
  } else {
    // Code existant pour les utilisateurs normaux
    this.utilisateurService.mettreAJourUtilisateur(this.utilisateurModifie).subscribe({
      next: (data) => {
        sessionStorage.setItem('currentUser', JSON.stringify(data));
        this.userData = data;
        this.showSuccessMessage = true;
        this.fermerModalCompte();
        
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 5000);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour', err);
        alert('Une erreur est survenue lors de la mise à jour');
      }
    });
  }
}

//Ajoutez cette méthode dans votre classe Dashboard dans dashboard.ts

  
  


  // Ajoutez cette mÃ©thode
loadDemandesEnAttente(): void {
  if (this.isManagerOrHigher()) {
    this.demandeService.getDemandesEnAttente().subscribe({
      next: (demandes) => {
        this.demandesEnAttente = demandes;
      },
      error: (err) => console.error(err)
    });
  }
}
  
  loadUserData(): void {
    const userData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
     if (userData.role === 'admin' || userData.statut === 'admin') {
    this.userData = userData;
    // Les admins n'ont pas d'historique de demandes, donc on ne charge pas loadHistoriqueDemandes()
    return;
  }
  
    if (userData.matricule) {
      this.userData = userData;
      this.loadHistoriqueDemandes();
    } else {
      this.router.navigate(['/login']);
    }
  }

 // Remplacez votre mÃ©thode ngOnInit() dans dashboard.ts par celle-ci :

// Remplacez votre méthode ngOnInit() dans dashboard.ts par celle-ci :

ngOnInit(): void {
  console.log('=== DEBUT ngOnInit ===');
  
  // D'abord, récupérer les données de session pour initialiser userData
  const userData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  console.log('Données sessionStorage:', userData);
  
  // Initialiser userData immédiatement pour que le template puisse l'utiliser
  if (userData && Object.keys(userData).length > 0) {
    this.userData = userData;
    console.log('userData initialisé avec sessionStorage:', this.userData);
  }
  
  const userEmail = this.authService.getCurrentUserEmail();
  console.log('Email utilisateur:', userEmail);
  
  const isAdminCheck = userData.role === 'admin' || userData.statut === 'admin';
  console.log('Test isAdmin:', isAdminCheck);
  
  if (isAdminCheck) {
    console.log('=== ADMIN DÉTECTÉ ===');
    // userData est déjà initialisé plus haut
    this.loadDemandesEnAttente();
    console.log('=== FIN TRAITEMENT ADMIN ===');
    return;
  }
  
  // Pour les utilisateurs normaux, rafraîchir les données depuis l'API
  if (userEmail && !isAdminCheck) {
    console.log('=== UTILISATEUR NORMAL ===');
    this.utilisateurService.getUtilisateurByEmail(userEmail).subscribe({
      next: (data) => {
        console.log('Données utilisateur récupérées:', data);
        this.userData = data; // Mettre à jour avec les données fraîches
        this.loadHistoriqueDemandes();
        this.loadDemandesEnAttente();
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        // Garder les données de session même en cas d'erreur
        if (!this.userData) {
          this.router.navigate(['/login']);
        }
      }
    });
  } else if (!userEmail && !isAdminCheck) {
    console.log('=== PAS D\'EMAIL - REDIRECTION LOGIN ===');
    this.router.navigate(['/login']);
  }
  
  // Récupération des données de navigation
  const navigation = this.router.getCurrentNavigation();
  if (navigation?.extras.state) {
    this.nouvelleDemande = navigation.extras.state['nouvelleDemande'];
  }
  
  console.log('=== FIN ngOnInit ===');
}

// Ajoutez aussi du debug dans isAdmin()

isAdmin(): boolean {
  try {
    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const userRole = sessionStorage.getItem('userRole');
    
    console.log('isAdmin() - user:', user);
    console.log('isAdmin() - userRole:', userRole);
    
    // Vérifier plusieurs sources possibles
    const result = user.role === 'admin' || 
                   user.statut === 'admin' || 
                   userRole === 'admin';
    
    console.log('isAdmin() - result:', result);
    return result;
  } catch (error) {
    console.error('Erreur dans isAdmin():', error);
    return false;
  }
}

loadHistoriqueDemandes(): void {
  if (this.userData && this.userData.matricule) {
    this.demandeService.getDemandesByMatricule(this.userData.matricule).subscribe({
      next: (demandes) => {
       // Tri des demandes par date dÃ©croissante (les plus rÃ©centes en premier)
        this.conges = demandes.sort((a, b) => {
          return new Date(b.dateDemande).getTime() - new Date(a.dateDemande).getTime();
        });
        
        console.log('Historique des demandes triÃ©es:', this.conges);
      
      
        //  this.conges = demandes;
        //console.log('Historique des demandes:', this.conges);
        
        // Si il y a une nouvelle demande, l'ajouter en dÃ©but de tableau
       // if (this.nouvelleDemande) {
         // this.conges.unshift(this.nouvelleDemande);
        //}
         this.calculateStats(); // Appelez cette mÃ©thode aprÃ¨s avoir chargÃ© les demandes
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'historique:', err);
        // Si il y a une nouvelle demande mais erreur de chargement, l'afficher quand mÃªme
        if (this.nouvelleDemande) {
          this.conges = [this.nouvelleDemande];
        }
      }
    });
  }
}


  logout(): void {
    this.authService.logout();
    // Forcer le rechargement complet de la page vers le login
    window.location.href = '/login';
  }
   // Ajoutez cette mÃ©thode
  creerDemande(): void {
    this.router.navigate(['/nouvelle-demande']); // Vous devrez crÃ©er cette route
  }
  // Ajouter ces mÃ©thodes Ã  la classe Dashboard
isCadreOrTechnicien(): boolean {
  const statut = this.userData?.statut?.toLowerCase();
  return statut === 'cadre' || statut === 'technicien';
}

// NOUVELLES MÉTHODES pour la hiérarchie stricte
isRH(): boolean {
  const statut = this.userData?.statut?.toLowerCase();
  return statut === 'rh';
}

isChefService(): boolean {
  const statut = this.userData?.statut?.toLowerCase();
  return statut === 'chef de service';
}

isChefDivision(): boolean {
  const statut = this.userData?.statut?.toLowerCase();
  return statut === 'chef de division';
}

isDirecteur(): boolean {
  const statut = this.userData?.statut?.toLowerCase();
  return statut === 'directeur';
}

isManagerOrHigher(): boolean {
  const statut = this.userData?.statut?.toLowerCase();
  return statut === 'chef de service' || 
         statut === 'chef de division' || 
         statut === 'directeur' ||
         statut === 'rh';
}

gererDemandes(): void {
  this.router.navigate(['/gestion-demandes']); // Vous devrez crÃ©er cette route
}

voirDemandesValidees(): void {
  this.router.navigate(['/validation-rh']); // Navigation vers la page RH
}

// MÃ©thodes
openModal(demande: any): void {
  this.currentDemande = demande;
  this.showModal = true;
}

closeModal(): void {
  this.showModal = false;
  this.showRejectReason = false;
  this.rejectReason = '';
}

toggleRejectReason(): void {
  this.showRejectReason = !this.showRejectReason;
}

acceptDemande(): void {
  // ImplÃ©mentez la logique d'acceptation ici
  console.log('Demande acceptÃ©e:', this.currentDemande);
  this.demandeService.acceptDemande(this.currentDemande.id).subscribe({
    next: () => {
      alert('Demande acceptÃ©e avec succÃ¨s');
      this.closeModal();
      this.loadHistoriqueDemandes();
    },
    error: (err) => console.error('Erreur:', err)
  });
}

rejectDemande(): void {
  if (!this.rejectReason) {
    alert('Veuillez saisir un motif de refus');
    return;
  }
  
  // ImplÃ©mentez la logique de refus ici
  console.log('Demande refusÃ©e:', this.currentDemande, 'Motif:', this.rejectReason);
  this.demandeService.rejectDemande(this.currentDemande.id, this.rejectReason).subscribe({
    next: () => {
      alert('Demande refusÃ©e avec succÃ¨s');
      this.closeModal();
      this.loadHistoriqueDemandes();
    },
    error: (err) => console.error('Erreur:', err)
  });
}
// Ajoutez cette mÃ©thode
calculateStats(): void {
  this.congesPris = this.conges
    .filter(c => c.statut === 'ApprouvÃ©')
    .reduce((total, conge) => total + conge.duree, 0);

  this.demandesEnAttenteCount = this.conges
    .filter(c => c.statut === 'En attente').length;
}
// Nouvelle mÃ©thode pour basculer la visibilitÃ© du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  // Ajoutez cette mÃ©thode Ã  la classe Dashboard




}