import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs';
import { catchError,throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/v1/auth'; // ModifiÃ©
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  private isloggedIn = false;

  constructor(private http: HttpClient) {
    this.checkLoginStatus();
  }

  /*login(email: string, motDePasse: string): Observable<any> {
    const loginData = { email, motDePasse };
    return this.http.post<any>(`${this.baseUrl}/login`, loginData);
  }*/
// Dans votre service d'authentification Angular
// Dans la mÃ©thode login() de auth.service.ts
login(email: string, motDePasse: string): Observable<any> {
  const loginData = { 
    email: email,
    motDePasse: motDePasse
  };
  
  return this.http.post<any>(`${this.baseUrl}/login`, loginData).pipe(
    tap(response => {
      if (response?.success) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', email);
        
        // CORRECTION IMPORTANTE : Stockage correct des données admin
        if (response.userType === 'admin') {
          // Pour les admins
          const adminData = {
            email: response.email,
            role: 'admin',
            statut: 'admin'
          };
          sessionStorage.setItem('currentUser', JSON.stringify(adminData));
          sessionStorage.setItem('userRole', 'admin');
          sessionStorage.setItem('userDirection', 'Administration'); // Direction par défaut pour admin
        } else {
          // Pour les utilisateurs normaux
          const userData = {
            matricule: response.matricule,
            nom: response.nom,
            prenom: response.prenom,
            statut: response.statut,
            email: email,
            soldeConge: response.soldeConge,
            direction: response.direction // AJOUT de la direction
          };
          sessionStorage.setItem('currentUser', JSON.stringify(userData));
          sessionStorage.setItem('userRole', response.statut);
          sessionStorage.setItem('userDirection', response.direction || ''); // AJOUT direction
          
          console.log('🔐 Connexion réussie - Direction stockée:', response.direction);
        }
        
        this.loggedInSubject.next(true);
      }
    }),
    catchError(error => {
      console.error('Login error:', error);
      throw error;
    })
  );
}


// MÃ©thode pour tester si l'admin existe
testAdmin() {
  return this.http.get<any>(`${this.baseUrl}/test-admin`);
}


  setLoggedIn(status: boolean) {
    this.isloggedIn = status;
    this.loggedInSubject.next(status);
    if (status) {
      sessionStorage.setItem('isLoggedIn', 'true');
    } else {
      sessionStorage.removeItem('isLoggedIn');
    }
  }

  isAuthenticated(): boolean {
    //return this.isloggedIn || sessionStorage.getItem('isLoggedIn') === 'true';
    return sessionStorage.getItem('isLoggedIn') === 'true';
  }
//logout(): void {
  //localStorage.removeItem('token');
//}
logout(): void {
  // Nettoyer complètement la session
  sessionStorage.clear();
  localStorage.clear(); // Au cas où des données seraient stockées ici aussi
  
  // Mettre à jour l'état de connexion
  this.setLoggedIn(false);
  
  // Forcer la mise à jour du comportement subject
  this.loggedInSubject.next(false);
}


  private checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    this.setLoggedIn(isLoggedIn);
  }

 // logout() {
   // this.setLoggedIn(false);
  //}
  getCurrentUserEmail(): string | null {
  //const userData = sessionStorage.getItem('userData');
  //return userData ? JSON.parse(userData).email : null;
  return sessionStorage.getItem('userEmail');
}
getUserRole(): string | null {
  return sessionStorage.getItem('userRole');
}
 //  vÃ©rifier si l'utilisateur est admin
  isAdmin(): boolean {
    const userRole = this.getUserRole();
    return userRole === 'admin' ;
  }

  //  vÃ©rifier si l'utilisateur peut accÃ©der aux fonctions admin
  canAccessAdmin(): boolean {
    return this.isAuthenticated() && this.isAdmin();
  }
  //  vÃ©rifier si l'utilisateur peut gÃ©rer les demandes la buotton gerer les demnades est dispo juste pr chef srvc, div,dirctr
canManageRequests(): boolean {
  const role = this.getUserRole();
  if (role) {
    const lowerRole = role.toLowerCase();
    return lowerRole === 'chef de service' || 
           lowerRole === 'chef de division' || 
           lowerRole === 'directeur' ;
           
  }
  return false;
}



}