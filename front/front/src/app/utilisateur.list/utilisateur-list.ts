import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Utilisateur } from '../utilisateur';
import { UtilisateurService } from '../utilisateur.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-utilisateur-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateur-list.html',
  styleUrls: ['./utilisateur-list.css']
})
export class UtilisateurList implements OnInit {
  utilisateurs: Utilisateur[] = [];
  currentUserEmail: string | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  
  // Propriétés pour le modal de gestion de compte
  showAccountModal: boolean = false;
  utilisateurModifie: any = {};
  showPassword: boolean = false;
  showSuccessMessage: boolean = false;

  constructor(
    private utilisateurService: UtilisateurService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserEmail = this.authService.getCurrentUserEmail();
    console.log("Email courant :", this.currentUserEmail); //verification
    
    // Force refresh des données à chaque fois que le composant est initialisé
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.isLoading = true;
    this.utilisateurService.getAllUtilisateurList().subscribe({
      next: (data) => {
        console.log("Données utilisateurs chargées:", data); // Debug pour vérifier les directions
        this.utilisateurs = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  isAdmin(): boolean {
    return this.currentUserEmail === 'admin@gmail.com';
  }
  deconnexion() {
    // Nettoyer la session et l'état d'authentification
    this.authService.logout();
    
    // Forcer le rechargement complet de la page vers le login
    window.location.href = '/login';
  }

  updateUtilisateur(matricule: number): void {
    if (this.isAdmin()) {
      this.router.navigate(['update-utilisateur', matricule]);
    }
  }

  deleteUtilisateur(matricule: number): void {
    console.log("Tentative de suppression de", matricule);
    if (!this.isAdmin()) 
      {
    console.log("Seul l'admin peut supprimer");
    return;
  };

    const confirmation = confirm("Voulez-vous vraiment supprimer cet utilisateur ?");
    if (confirmation) {
      this.isLoading = true;
      this.utilisateurService.deleteUtilisateur(matricule).subscribe({
        next: () => {
          this.loadUtilisateurs();
        },
       error: (error) => {
  this.errorMessage = 'Erreur lors de la suppression';
  this.isLoading = false;
  console.error("Détails de l'erreur:", {
    status: error.status, // Affiche le code HTTP (400)
    message: error.message, // Message d'erreur
    url: error.url, // URL appelée
    body: error.error // Réponse du serveur (si disponible)
  });
}
      });
    }
  }

  createUtilisateur(): void {
    if (this.isAdmin()) {
      this.router.navigate(['create-utilisateur']);
    }
  }

  // Méthodes pour la gestion du compte
  ouvrirModalCompte(): void {
    if (this.isAdmin()) {
      // Pour les admins, préparer les données depuis sessionStorage
      const adminData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
      this.utilisateurModifie = {
        email: adminData.email || '',
        motDePasse: '' // Le mot de passe sera saisi par l'admin
      };
    } else {
      // Pour les utilisateurs normaux, charger leurs données
      this.utilisateurModifie = {};
    }
    this.showAccountModal = true;
  }

  fermerModalCompte(): void {
    this.showAccountModal = false;
    this.utilisateurModifie = {};
    this.showSuccessMessage = false;
    this.showPassword = false;
  }

  mettreAJourCompte(): void {
    if (this.isAdmin()) {
      // Utiliser le service pour mettre à jour l'admin
      this.utilisateurService.updateAdmin(this.utilisateurModifie).subscribe({
        next: (response) => {
          console.log('Mise à jour réussie:', response);
          this.showSuccessMessage = true;
          
          // Cacher le message de succès après 3 secondes
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
          
          // Fermer la modal après 2 secondes pour permettre de voir le message
          setTimeout(() => {
            this.fermerModalCompte();
          }, 2000);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          alert('Erreur lors de la mise à jour du compte');
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}