import { Component, OnInit } from '@angular/core';
import { DemandeService } from '../demande.service';
import { Router } from '@angular/router';
import { throwError,catchError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-gestion-demandes',
  imports: [FormsModule,CommonModule],
  templateUrl: './gestion-demandes.html',
  styleUrl: './gestion-demandes.css'
})

export class GestionDemandesComponent implements OnInit {
  demandes: any[] = [];
  showModal = false;
  currentDemande: any = null;
  rejectReason = '';
  userData: any = {}; // Déclaration et initialisation correcte

  constructor(
    private demandeService: DemandeService,
     private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
     this.loadUserData(); 
    this.loadDemandes();
  }
   //méthode pour charger les données utilisateur
  loadUserData(): void {
    const userDataStr = sessionStorage.getItem('currentUser');
    if (userDataStr) {
      this.userData = JSON.parse(userDataStr);
    }
  }

 loadDemandes(): void {
  if (this.isManagerOrHigher()) {
    this.demandeService.getDemandesEnAttente().subscribe({
      next: (data) =>{ this.demandes = data;
          console.log('Demandes en attente:', this.demandes);},
      error: (err) => console.error(err)
    });
  }
}

isManagerOrHigher(): boolean {
  const statut = this.userData?.statut?.toLowerCase();
  return statut === 'chef de service' || 
         statut === 'chef de division' || 
         statut === 'directeur' ||
         statut === 'rh';
}

  openModal(demande: any): void {
    this.currentDemande = demande;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.rejectReason = '';
  }

  // Exécuter l'acceptation
  executeAcceptDemande(): void {
    const demandeId = Number(this.currentDemande.id);
    this.demandeService.acceptDemande(this.currentDemande.id).subscribe({
      next: () => {
        alert('✅ Demande acceptée avec succès !');
        this.loadDemandes();
        this.closeModal();
      },
      error: (err) =>{
        console.error('Erreur lors de l\'acceptation:', err);
        alert('❌ Erreur lors de l\'acceptation de la demande');
      }});
  }  // Exécuter le refus
  executeRejectDemande(): void {
    // Motif par défaut si aucun motif n'est fourni
    const motif = this.rejectReason || 'Demande refusée par le responsable';

    this.demandeService.rejectDemande(this.currentDemande.id, motif).subscribe({
      next: () => {
        alert('✅ Demande refusée avec succès !');
        this.loadDemandes();
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        alert('❌ Erreur lors du refus de la demande');
      }
    });
  }
}