// demande.service.ts - Version avec debug amélioré
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { throwError, catchError } from 'rxjs';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private baseUrl = 'http://localhost:8080/api/demande';

  constructor(private http: HttpClient) { }

  createDemande(demande: any): Observable<any> {
    return this.http.post(this.baseUrl, demande);
  }

  getDemandesByMatricule(matricule: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/utilisateur/${matricule}`);
  }

  getAllDemandes(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getDemandesEnAttente(): Observable<any[]> {
    const userRole = sessionStorage.getItem('userRole') || 'user';
    const userDirection = sessionStorage.getItem('userDirection') || '';
    
    console.log('🔍 Récupération des demandes pour le rôle:', userRole, '| Direction:', userDirection);
    
    if (!userDirection) {
      console.error('❌ Direction utilisateur manquante dans sessionStorage');
      return of([]);
    }
    
    const params = new HttpParams()
      .set('userRole', userRole)
      .set('userDirection', userDirection);
    
    return this.http.get<any[]>(`${this.baseUrl}/en-attente`, { params }).pipe(
      tap(demandes => {
        console.log('✅ Demandes récupérées pour direction "' + userDirection + '":', demandes.length);
        demandes.forEach(d => {
          console.log(`- Demande ${d.id}: niveau=${d.niveauValidation}, direction=${d.direction}, demandeur=${d.nomDemandeur}`);
        });
      })
    );
  }

  acceptDemande(demandeId: number): Observable<any> {
    const userRole = sessionStorage.getItem('userRole') || 'user';
    
    console.log(' Acceptation demande', demandeId, 'par rôle:', userRole);
    
    const params = new HttpParams().set('userRole', userRole);
    
    return this.http.put(`${this.baseUrl}/${demandeId}/accept`, {}, { params }).pipe(
      tap(response => {
        console.log(' Réponse acceptation:', response);
      })
    );
  }

  rejectDemande(demandeId: number, motif: string): Observable<any> {
    console.log(' Rejet demande', demandeId, 'motif:', motif);
    return this.http.put(`${this.baseUrl}/${demandeId}/reject`, { motif: motif });
  }

  updateStatut(demandeId: number, statut: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${demandeId}/statut`, { statut: statut });
  }

  getInterimaires(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/interimaires`);
  }

  //  CORRECTION MAJEURE: Méthode getDemandesValidees améliorée avec debug complet
 getDemandesValidees(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/validees`).pipe(
    map(data => {
     
      return data.map(d => ({
        id: d.id,
        duree: d.duree,
        dateDebut: d.dateDebut,
        dateFin: d.dateFin,
        matricule: d.matricule,
        typeDemande: d.typeDemande,
        interime: d.interime,
        statut: d.statut,
        nomDemandeur: d.nomDemandeur,
        niveauValidation: d.niveauValidation,
        dateDemande: d.dateDemande,
        sexe:d.sexe 
      }));
    }),
    catchError(err => {
      console.error('Erreur:', err);
      return of([]);
    })
  );
}
}