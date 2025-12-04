import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Utilisateur } from '../utilisateur';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  email: string = ''; 
  motDePasse: string = ''; 
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false; // Propriété pour afficher/masquer le mot de passe
  rhUsers: any[] = []; // Liste de tous les utilisateurs RH
  selectedRhUser: any = null; // Utilisateur RH sélectionné
  showRhModal: boolean = false;
  showRhSelection: boolean = false; // Nouveau modal pour la sélection

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // S'assurer que la session est propre au chargement de la page de login
    this.authService.logout();
    
    // Nettoyer les champs du formulaire de manière plus agressive
    this.clearForm();
    
    // Forcer le nettoyage après un court délai pour s'assurer que tout est effacé
    setTimeout(() => {
      this.clearForm();
    }, 100);
    
    // Écouter les événements de visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.clearForm();
      }
    });
    
    // Récupérer tous les utilisateurs RH au chargement de la page
    this.getAllRHUsers();
  }

  // Méthode pour nettoyer les champs du formulaire
  clearForm() {
    this.email = '';
    this.motDePasse = '';
    this.errorMessage = '';
    this.selectedRhUser = null;
    this.showRhModal = false;
    this.showRhSelection = false;
  }


  // Méthode pour récupérer tous les utilisateurs RH
 // Méthode pour récupérer tous les utilisateurs RH
// Dans votre fichier login.ts, remplacez la méthode getAllRHUsers() par celle-ci :

getAllRHUsers() {
  this.http.get<any>('http://localhost:8080/api/rh/email').subscribe({
    next: (response: any) => {
      console.log('Réponse complète API RH:', response);
      
      // Vérifier si la réponse contient rhUsers
      if (response && response.rhUsers && Array.isArray(response.rhUsers)) {
        this.rhUsers = response.rhUsers;
        console.log('Utilisateurs RH récupérés:', this.rhUsers);
      } 
      // Si la réponse est directement un tableau
      else if (Array.isArray(response)) {
        this.rhUsers = response;
        console.log('Utilisateurs RH récupérés (format tableau):', this.rhUsers);
      }
      // Si c'est un objet avec un message d'erreur
      else if (response && response.message) {
        this.rhUsers = [];
        console.warn('Message API:', response.message);
      }
      // Autres cas
      else {
        this.rhUsers = [];
        console.warn('Format de réponse inattendu:', response);
      }
    },
    error: (error) => {
      console.error('Erreur lors de la récupération des utilisateurs RH:', error);
      this.rhUsers = [];
      
      // Afficher un message d'erreur plus informatif
      if (error.status === 404) {
        console.log('Aucun utilisateur RH trouvé (404)');
      } else {
        console.log('Erreur serveur:', error.status, error.message);
      }
    }
  });
}

  // Ouvrir le modal de sélection RH
 // Ouvrir le modal de sélection RH
  contactRH() {
    if (this.rhUsers.length === 0) {
      // Aucun RH trouvé - message d'erreur clair
      alert('Aucun utilisateur RH n\'est configuré dans le système. Veuillez contacter l\'administrateur pour créer un compte RH.');
    } else {
      this.showRhSelection = true;
    }
  }

  // Sélectionner un utilisateur RH
  selectRhUser(rhUser: any) {
    this.selectedRhUser = rhUser;
    this.showRhSelection = false;
    this.showRhModal = true;
  }

  // Fermer le modal de sélection
  closeRhSelection() {
    this.showRhSelection = false;
  }

  // Fermer le modal de contact
  closeRhModal() {
    this.showRhModal = false;
    this.selectedRhUser = null;
  }

  // Copier l'email dans le presse-papiers
  copyEmail() {
    if (!this.selectedRhUser) return;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.selectedRhUser.email).then(() => {
        alert('Email copié dans le presse-papiers !');
      }).catch(() => {
        this.fallbackCopyEmail();
      });
    } else {
      this.fallbackCopyEmail();
    }
  }

  fallbackCopyEmail() {
    if (!this.selectedRhUser) return;
    
    const textArea = document.createElement('textarea');
    textArea.value = this.selectedRhUser.email;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('Email copié dans le presse-papiers !');
    } catch {
      alert('Impossible de copier automatiquement. Veuillez copier manuellement.');
    }
    document.body.removeChild(textArea);
  }

  // Ouvrir Gmail directement
  openEmail() {
    if (!this.selectedRhUser) return;
    
    const subject = 'Demande d\'aide - Système de gestion des congés';
    const body = `Bonjour ${this.selectedRhUser.nom},\n\nJ'ai besoin d'aide concernant le système de gestion des congés.\n\nCordialement,`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${this.selectedRhUser.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(gmailUrl, '_blank');
    this.closeRhModal();
  }

  // Essayer d'ouvrir le client email par défaut
  openMailto() {
    if (!this.selectedRhUser) return;
    
    const subject = 'Demande d\'aide - Système de gestion des congés';
    const body = `Bonjour ${this.selectedRhUser.nom},\n\nJ'ai besoin d'aide concernant le système de gestion des congés.\n\nCordialement,`;
    const mailtoUrl = `mailto:${this.selectedRhUser.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoUrl;
    this.closeRhModal();
  }
  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.email, this.motDePasse).subscribe({
      next: (response) => {
        console.log("Réponse du backend:", response);
        if (response.success) {
          localStorage.setItem('currentUser', JSON.stringify(response.userData));

          if (response.userType === 'admin') {
            this.router.navigate(['/utilisateurs']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.errorMessage = response.message || 'Authentification échouée';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erreur:", error);
        this.errorMessage = error.error?.message || 'Erreur de connexion';
        this.isLoading = false;
      }
    });
  }

  // Méthode pour basculer la visibilité du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}