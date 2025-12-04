import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App  {
  title = 'Gestion de Congé';

  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  gererCompte(): void {
    // Naviguer vers le dashboard et déclencher l'ouverture de la modal
    if (this.router.url !== '/dashboard') {
      this.router.navigate(['/dashboard']);
    }
    // Émettre un événement pour ouvrir la modal de gestion du compte
    window.dispatchEvent(new CustomEvent('openAccountModal'));
  }
}