import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilisateurService } from '../utilisateur.service';
import { Router } from '@angular/router';
import { DemandeService } from '../demande.service';
import { ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Interimaire } from '../interimaire';
import { catchError } from 'rxjs';
import { of } from 'rxjs';

@Component({
  selector: 'app-nouvelle-demande',
  templateUrl: './nouvelle-demande.html',
  styleUrl: './nouvelle-demande.css',
  imports:[ CommonModule, ReactiveFormsModule]
})
export class NouvelleDemandeComponent implements OnInit {
  demandeForm: FormGroup;
  dateError: string | null = null;
  duree: number = 0;
  interimaires: Interimaire[] = [];
  showSousType = false;
  isSubmitting = false;
  
  sousTypes = [
    'Absence Maternité Payée',
    'Circoncision d\'un enfant',
    'Décès d\'un ascendant ou descendant',
    'Décès d\'un conjoint',
    'Décès d\'un frère ou d\'une sœur',
    'Déménagement pour convenance personnelle',
    'Déménagement pour nécessité de service',
    'Hospitalisation conjoint, enfant ou parent',
    'Mariage du salarié',
    'Mariage d\'un enfant',
    'Naissance d\'un enfant',
    'Pèlerinage'
  ];

  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private demandeService: DemandeService,
    private router: Router,
    private httpClient: HttpClient
  ) {
    this.demandeForm = this.fb.group({
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      typeDemande: ['administratif', Validators.required],
      sousType: [''],
      interime: ['', Validators.required],
      duree: [{value: '', disabled: true}]
    });
    
    this.demandeForm.get('dateDebut')?.valueChanges.subscribe(() => this.updateDuree());
    this.demandeForm.get('dateFin')?.valueChanges.subscribe(() => this.updateDuree());
  }

  ngOnInit(): void {
    // VÉRIFICATION : Le directeur ne peut pas faire de demande
    const userData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const userRole = userData.statut?.toLowerCase();
    
    if (userRole === 'directeur') {
      alert('En tant que directeur, vous ne pouvez pas faire de demande de congé.');
      this.router.navigate(['/dashboard']);
      return;
    }
    
    console.log('Début chargement intérimaires...');
    this.utilisateurService.getInterimaires().subscribe({
      next: data => {
        console.log('Intérimaires reçus:', data);
        this.interimaires = data;
        if (this.interimaires.length === 0) {
          console.warn('Aucun intérimaire disponible');
        }
      },
      error: err => {
        console.error('erreur lors du chargement des interimaires:', err);
        this.interimaires = [];
      }
    });

    this.demandeForm.get('typeDemande')?.valueChanges.subscribe(val => {
      this.showSousType = val === 'exceptionnelle';
      if (!this.showSousType) {
        this.demandeForm.get('sousType')?.setValue('');
      }
    });
  }

onSubmit(): void {
  if (this.demandeForm.valid && !this.isSubmitting) {
    this.isSubmitting = true;
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const matricule = user.matricule || (user.userData && user.userData.matricule);
    
    const dateDebut = new Date(this.demandeForm.value.dateDebut);
    const dateFin = new Date(this.demandeForm.value.dateFin);
    
    if (dateFin < dateDebut) {
      alert("La date de fin doit être postérieure à la date de début");
      this.isSubmitting = false;
      return;
    }

    const demande = {
      dateDebut: dateDebut.toISOString(),
      dateFin: dateFin.toISOString(),
      typeDemande: this.demandeForm.value.typeDemande,
      sousType: this.demandeForm.value.sousType || null,
      interime: this.demandeForm.value.interime,
      matricule: parseInt(matricule),
      duree: this.calculateDuree(),
      statut: 'En attente',
      dateDemande: new Date().toISOString()
    };

    this.demandeService.createDemande(demande).subscribe({
      next: (response) => {
        // Recharger les données utilisateur pour mettre à jour le solde
        this.utilisateurService.getUtilisateurByEmail(user.email).subscribe({
          next: (updatedUser) => {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            const navigationExtras: NavigationExtras = {
              state: { nouvelleDemande: response }
            };
            this.router.navigate(['/dashboard'], navigationExtras);
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.error === "Solde de congé insuffisant") {
          alert("Solde de congé insuffisant pour un congé administratif");
        } else {
          alert("Erreur: " + (err.error || 'Erreur serveur'));
        }
      }
    });
  }
}
 
   
   

  updateDuree(): void {
    const dateDebut = this.demandeForm.get('dateDebut')?.value;
    const dateFin = this.demandeForm.get('dateFin')?.value;
    this.dateError = null;

    if (dateDebut && dateFin) {
      try {
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);

        if (fin < debut) {
          this.dateError = "La date de fin doit être postérieure à la date de début";
          this.demandeForm.get('duree')?.setValue('Date invalide');
          return;
        }

        if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
          throw new Error('Format de date invalide');
        }

        const diffTime = Math.abs(fin.getTime() - debut.getTime());
        this.duree = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        this.demandeForm.get('duree')?.setValue(`${this.duree} jour${this.duree > 1 ? 's' : ''}`);
      } catch (e) {
        console.error('Erreur calcul durée:', e);
        this.demandeForm.get('duree')?.setValue('Date invalide');
      }
    } else {
      this.demandeForm.get('duree')?.setValue('');
    }
  }

  calculateDuree(): number {
    return this.duree;
  }

  annuler(): void {
    // Naviguer retour vers le dashboard
    this.router.navigate(['/dashboard']);
  }
}