import { Injectable } from '@angular/core';
import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from './utilisateur';
import { catchError,throwError } from 'rxjs';
import { of } from 'rxjs';
import { map } from 'rxjs';

import { CreateUtilisateur } from './create-utilisateur/create-utilisateur';
import { Interimaire } from './interimaire';

@Injectable({
  providedIn: 'root'
})

export class UtilisateurService {

  private baseUrl = 'http://localhost:8080/api/v1/utilisateurs'; // URL réelle

  constructor(private httpClient: HttpClient) { }

  getAllUtilisateurList(): Observable<Utilisateur[]> {
    return this.httpClient.get<Utilisateur[]>(this.baseUrl, {
      responseType: 'json' as const
    });
  }
  createUtilisateur(utilisateur: Utilisateur): Observable<any> { return this.httpClient.post<any>(this.baseUrl, utilisateur); }

  getUtilisateurByMatricule(matricule: number): Observable<Utilisateur> {
    return this.httpClient.get<Utilisateur>(`${this.baseUrl}/${matricule}`);
  }
  updateUtilisateur(matricule: number, utilisateur: Utilisateur): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/${matricule}`, utilisateur);
  }
  deleteUtilisateur(matricule: number):Observable<Object>
  {
    return this.httpClient.delete(`${this.baseUrl}/${matricule}`)
    //observe: 'response' // Pour voir la réponse complète
  }
  // Ajoutez cette méthode à votre service
getUtilisateurByEmail(email: string): Observable<Utilisateur> {
    const encodedEmail = encodeURIComponent(email);
    return this.httpClient.get<Utilisateur>(
        `${this.baseUrl}/by-email/${encodedEmail}`
    ).pipe(
        catchError(error => {
            console.error('Erreur lors de la récupération par email', error);
            return throwError(() => new Error('Utilisateur non trouvé'));
        })
    );
}
 // ✅ Ajouté
  checkEmailAndMatricule(email: string, matricule: number): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/check`, {
      params: {
        email: email,
        matricule: matricule
      }
    });
  }
  checkEmailForUpdate(email: string, currentMatricule: number): Observable<boolean> {
  return this.httpClient.get<boolean>(`${this.baseUrl}/check-email`, {
    params: {
      email: email,
      currentMatricule: currentMatricule
    }
  });
}
// Ajouter cette méthode
// Modifier la méthode getInterimaires comme suit:
getInterimaires(): Observable<Interimaire[]> {
  return this.httpClient.get<any[]>(`http://localhost:8080/api/v1/interimaires`).pipe(
    map(response => {
      console.log('Réponse brute du serveur:', response); // Debug
      return response.map(item => ({
        matricule: item.matricule,
        nomComplet: item.nomComplet,
        statut:item.statut
      }));
    }),
    catchError(error => {
      console.error('Erreur lors de la récupération des intérimaires:', error);
      return of([]); // Retourne un tableau vide en cas d'erreur
    })
  );
}
// Dans utilisateur.service.ts
mettreAJourUtilisateur(utilisateur: any): Observable<any> {
  return this.httpClient.put(`${this.baseUrl}/${utilisateur.matricule}`, utilisateur);
}

// Nouvelle méthode pour mettre à jour l'admin
mettreAJourAdmin(admin: any): Observable<any> {
  return this.httpClient.put('http://localhost:8080/api/v1/auth/admin', admin);
}

// Alias pour compatibilité
updateAdmin(admin: any): Observable<any> {
  return this.mettreAJourAdmin(admin);
}





   


}