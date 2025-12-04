import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Utilisateur } from '../utilisateur';
import { UtilisateurService } from '../utilisateur.service';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError,throwError } from 'rxjs';


@Component({
  selector: 'app-update-utilisateur',
  imports: [FormsModule, CommonModule],
  templateUrl: './update-utilisateur.html',
  styleUrl: './update-utilisateur.css'
})
export class UpdateUtilisateur implements OnInit {
  errorMessage: string = '';
  
  utilisateur: Utilisateur = new Utilisateur();
  matricule: number = 0;
  
  constructor(
    private utilisateurService: UtilisateurService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    //  Récupération du matricule depuis l'URL
    this.matricule = this.route.snapshot.params['matricule'];
    console.log("Matricule récupéré:", this.matricule);
    
    if (this.matricule) {
      this.getUtilisateurByMatricule();
    }
  }
  
  //  Méthode pour récupérer l'utilisateur par matricule
  getUtilisateurByMatricule() {
    this.utilisateurService.getUtilisateurByMatricule(this.matricule).subscribe({
      next: (data) => {
        this.utilisateur = data;
        console.log("Utilisateur récupéré :", this.utilisateur);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération de l'utilisateur :", err);
      }
    });
  }
  
  //  Navigation vers la liste des utilisateurs
  goToUtilisateurList() {
    this.router.navigate(['/utilisateurs']);
  }
  
  //  Méthode appelée lors de la soumission du formulaire
  onSubmit() {
    this.errorMessage = '';

    if (this.utilisateur.email === 'admin@gmail.com') {
      this.errorMessage = "L'email 'admin@gmail.com' est réservé.";
      return;
    }

    console.log("Utilisateur à modifier :", this.utilisateur);
    console.log("Direction sélectionnée :", this.utilisateur.direction);

    // Vérifier si email déjà pris par un autre utilisateur
    this.utilisateurService.checkEmailForUpdate(this.utilisateur.email, this.utilisateur.matricule)
      .subscribe({
        next: (exists) => {
          if (exists) {
            this.errorMessage = "Cet email est déjà utilisé par un autre utilisateur.";
          } else {
            // Email autorisé → mise à jour
            this.utilisateurService.updateUtilisateur(this.utilisateur.matricule, this.utilisateur)
              .subscribe({
                next: (data) => {
                  console.log("Mise à jour réussie :", data);
                  alert('Utilisateur modifié avec succès !');
                  this.goToUtilisateurList();
                },
                error: (error) => {
                  console.error("Erreur lors de la mise à jour :", error);
                  this.errorMessage = "Erreur lors de la modification.";
                }
              });
          }
        },
        error: (error) => {
          console.error("Erreur lors de la vérification de l'email :", error);
          this.errorMessage = "Erreur lors de la vérification de l'email.";
        }
      });
  }
  annuler() {
  this.router.navigate(['/utilisateurs']);
}
}