// validation-rh.component.ts
import { Component, OnInit } from '@angular/core';
import { DemandeService } from '../demande.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-validation-rh',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './validation-rh.html',
  styleUrls: ['./validation-rh.css']
})
export class ValidationRhComponent implements OnInit {
  demandesValidees: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private demandeService: DemandeService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.chargerDemandesValidees();
  }

  chargerDemandesValidees(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.demandeService.getDemandesValidees().subscribe({
      next: (data) => {
        this.demandesValidees = data || [];
        // Trier les demandes par date de demande décroissante (plus récente en premier)
        this.demandesValidees.sort((a, b) => {
          const dateA = new Date(a.dateDemande);
          const dateB = new Date(b.dateDemande);
          return dateB.getTime() - dateA.getTime();
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des demandes validées:', error);
        this.demandesValidees = [];
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement des demandes validées';
      }
    });
  }

  get demandesFiltrees(): any[] {
    let demandesFiltrees = this.demandesValidees;
    
    if (this.searchTerm) {
      demandesFiltrees = this.demandesValidees.filter(demande =>
        demande.nomDemandeur.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        demande.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        demande.motif.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    // Maintenir le tri par date de demande décroissante (plus récente en premier)
    return demandesFiltrees.sort((a, b) => {
      const dateA = new Date(a.dateDemande);
      const dateB = new Date(b.dateDemande);
      return dateB.getTime() - dateA.getTime();
    });
  }

  //  Export PDF avec jsPDF
  exporterPDF(demande: any): void {
    const doc = new jsPDF();
    
    // Charger l'image et générer le PDF
    this.loadImageAndGeneratePDF(doc, demande);
  }

  // Nouvelle méthode pour charger l'image et générer le PDF
  private loadImageAndGeneratePDF(doc: any, demande: any): void {
    const img = new Image();
    
    img.onload = () => {
      console.log('Image chargée avec succès !');
      // L'image est chargée, on peut maintenant générer le PDF
      this.generatePDFWithImage(doc, demande, img);
    };
    
    img.onerror = () => {
      console.log('Impossible de charger logoada.png, essai avec ada.jpg...');
      // Essayer avec ada.jpg si logoada.png ne fonctionne pas
      const imgJpg = new Image();
      imgJpg.onload = () => {
        console.log('Image ada.jpg chargée avec succès !');
        this.generatePDFWithImage(doc, demande, imgJpg);
      };
      imgJpg.onerror = () => {
        console.log('Impossible de charger les images, génération du PDF sans image');
        this.generatePDFWithImage(doc, demande, null);
      };
      // Corriger le chemin pour Angular
      imgJpg.src = './assets/ada.jpg';
    };
    
    // Essayer d'abord avec logoada.png - Corriger le chemin pour Angular
    img.src = './assets/logoada.png';
  }

  // Méthode pour générer le PDF avec ou sans image
  private generatePDFWithImage(doc: any, demande: any, img: HTMLImageElement | null): void {
    // Ajout de l'en-tête avec l'image
    this.addLogoToPDFWithImage(doc, img);
    
    // Date en haut à droite - Style amélioré
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    const dateDoc = this.formatDate(new Date());
    doc.text(dateDoc, 180, 95, { align: 'right' });
    
    // Objet - Style amélioré
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('Objet : Approbation de votre demande de congé', 20, 110);
    
    // Corps du texte avec style amélioré
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    
    // Soit madamme soit monsieur
    const civilite = demande.sexe === 'F' ? 'madame' : 'monsieur';
    let yPosition = 130; // Position ajustée pour laisser place à l'en-tête complet
    
    // Corps de la lettre
    const paragraphe = [
      `Bonjour ${civilite} ${demande.nomDemandeur},`,
      '',
      `Nous vous informons que votre demande de congé déposée le ${this.formatDate(demande.dateDemande)}`,
      `pour la période du ${this.formatDate(demande.dateDebut)} au ${this.formatDate(demande.dateFin)} a été approuvée.`,
      '',
      'Nous vous souhaitons de passer un bon congé et restons à votre disposition pour toute information',
      'complémentaire. Merci de vous assurer que toutes les passations de consigne ont été effectué dans',
      ' les regles de l\'art avant votre départ.',
      '',
      'Bien cordialement,',
      '',
      '',
      'Service RH',
      'ADA'
    ];
    
    // Ajout du paragraphe
    paragraphe.forEach((ligne, index) => {
      if (ligne) {
        // Style spécial pour "Service RH" et "ADA"
        if (ligne === 'Service RH' || ligne === 'ADA') {
          doc.setFont('times', 'bold');
          doc.setFontSize(11);
        } else {
          doc.setFont('times', 'normal');
          doc.setFontSize(11);
        }
        doc.text(ligne, 20, yPosition + (index * 8)); // Espacement légèrement augmenté
      }
    });
    
    // Téléchargement du fichier
    doc.save(`approbation-conge-${demande.nomDemandeur.replace(/\s+/g, '_')}.pdf`);
  }

  // Méthode pour ajouter le logo et l'en-tête au PDF avec image
  private addLogoToPDFWithImage(doc: any, img: HTMLImageElement | null): void {
    // Définir la couleur verte
    doc.setTextColor(34, 139, 34); // Couleur verte (RGB)
    
    // Texte en français (côté gauche) en vert - Style amélioré avec Times New Roman
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('ROYAUME DU MAROC', 20, 18);
    
    doc.setFont('times', 'normal');
    doc.setFontSize(9); // Taille réduite pour éviter le chevauchement
    doc.text('MINISTÈRE DE L\'AGRICULTURE, DE LA PÊCHE MARITIME,', 20, 26);
    doc.text('DU DÉVELOPPEMENT RURAL ET DES EAUX ET FORÊTS', 20, 32);

    // Texte en arabe (côté droit) en vert - Translitération élégante
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('AL MAMLAKA AL MAGHRIBIYA', 185, 18, { align: 'right' });
    
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    // Texte en translitération arabe élégante
    doc.text('WIZARAT AL FILAHA WA AS-SAYD AL BAHRI', 185, 26, { align: 'right' });
    doc.text('WA AT-TANMIYA AL QARAWIYA WA AL MIYAH WA AL GHABAT', 185, 32, { align: 'right' });

    // Remettre la couleur noire pour le reste du document
    doc.setTextColor(0, 0, 0);

    // Ajout de l'image EN DESSOUS des textes, au centre, avec ses dimensions originales
    if (img) {
      try {
        // Conversion en canvas pour obtenir les données base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png', 1.0);
          
          // Calculer les dimensions proportionnelles (garder le ratio original)
          const originalWidth = img.width;
          const originalHeight = img.height;
          const maxWidth = 60; // Largeur maximum
          const maxHeight = 30; // Hauteur maximum
          
          let finalWidth = originalWidth;
          let finalHeight = originalHeight;
          
          // Réduire proportionnellement si trop grand
          if (originalWidth > maxWidth) {
            const ratio = maxWidth / originalWidth;
            finalWidth = maxWidth;
            finalHeight = originalHeight * ratio;
          }
          
          if (finalHeight > maxHeight) {
            const ratio = maxHeight / finalHeight;
            finalHeight = maxHeight;
            finalWidth = finalWidth * ratio;
          }
          
          // Position: centré horizontalement, en dessous des textes
          const xPosition = (210 - finalWidth) / 2; // Centré sur la page (largeur A4 = 210mm)
          const yPosition = 40; // En dessous des textes français/arabe (ajusté)
          
          doc.addImage(dataURL, 'PNG', xPosition, yPosition, finalWidth, finalHeight);
          console.log('Image ajoutée au PDF avec succès !');
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'image:', error);
        // Fallback : afficher un placeholder
        this.addLogoPlaceholder(doc);
      }
    } else {
      // Pas d'image, afficher un placeholder
      this.addLogoPlaceholder(doc);
    }

    // Texte de l'agence en dessous de l'image - Style amélioré
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.text('AGENCE POUR LE DÉVELOPPEMENT AGRICOLE', 105, 75, { align: 'center' });

    // Ligne de séparation - Style amélioré
    doc.setLineWidth(1);
    doc.setDrawColor(34, 139, 34); // Ligne verte
    doc.line(20, 85, 190, 85);
    
    // Remettre la couleur de trait en noir pour le reste
    doc.setDrawColor(0, 0, 0);
  }

  // Méthode pour ajouter un placeholder si l'image ne charge pas
  private addLogoPlaceholder(doc: any): void {
    doc.setFillColor(240, 240, 240);
    doc.rect(75, 40, 60, 30, 'F'); // Position ajustée
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('LOGO ADA', 105, 57, { align: 'center' });
  }

  //  formater la période
  private formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }

  // Méthode pour retourner au dashboard
  retourDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  // Méthode pour se déconnecter
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}