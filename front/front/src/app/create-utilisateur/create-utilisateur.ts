import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Utilisateur } from '../utilisateur';
import { UtilisateurService } from '../utilisateur.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { subscribeOn } from 'rxjs';
import { AuthService } from '../auth.service';
import { AuthGuard } from '../auth.guard';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-create-utilisateur',
  imports: [FormsModule, CommonModule],
  templateUrl: './create-utilisateur.html',
  styleUrl: './create-utilisateur.css'
})
export class CreateUtilisateur implements OnInit {
  errorMessage: string = '';
  utilisateur: Utilisateur = new Utilisateur();
  
  constructor(
    private utilisateurService: UtilisateurService, 
    private router: Router
  ) { };

  ngOnInit(): void { }

  // Méthode simplifiée pour la soumission du formulaire
  onSubmit() {
    this.checkEmailAndMatriculeAndCreate();
    // ❌ SUPPRIMÉ : this.goToUtilisateurList(); - Ne pas naviguer ici !
  }

  // Méthode corrigée pour vérifier et créer l'utilisateur
  checkEmailAndMatriculeAndCreate(): void {
    this.errorMessage = '';

    // Vérification de l'email réservé
    if (this.utilisateur.email === 'admin@gmail.com') {
      this.errorMessage = "L'email 'admin@gmail.com' est réservé.";
      return;
    }

    // Vérification de l'unicité de l'email et matricule
    this.utilisateurService.checkEmailAndMatricule(this.utilisateur.email, this.utilisateur.matricule)
      .subscribe({
        next: (result) => {
          if (result.emailExists || result.matriculeExists) {
            // Construire le message d'erreur
            this.errorMessage = '';
            if (result.emailExists) {
              this.errorMessage += "Cet email existe déjà. ";
            }
            if (result.matriculeExists) {
              this.errorMessage += "Ce matricule existe déjà.";
            }
          } else {
            // ✅ Si tout est OK, créer l'utilisateur
            this.createUtilisateur();
          }
        },
        error: (error) => {
          console.error('Erreur lors de la vérification:', error);
          this.errorMessage = "Erreur lors de la vérification des données.";
        }
      });
  }

  // ✅ Nouvelle méthode séparée pour la création
  private createUtilisateur(): void {
    this.utilisateurService.createUtilisateur(this.utilisateur)
      .subscribe({
        next: (response) => {
          console.log('Utilisateur créé avec succès:', response);
          // ✅ Navigation uniquement en cas de succès
          this.goToUtilisateurList();
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.errorMessage = "Erreur lors de la création de l'utilisateur.";
          // ❌ Pas de navigation en cas d'erreur
        }
      });
  }

  // Méthode pour annuler
  annuler() {
    this.router.navigate(['/utilisateurs']);
  }

  // Méthode pour naviguer vers la liste
  goToUtilisateurList() {
    this.router.navigate(['/utilisateurs']);
  }

  // ❌ SUPPRIMÉ : saveUtilisateur() - méthode non utilisée et redondante
}