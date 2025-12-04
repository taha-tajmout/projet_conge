import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot,ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import {  RouterStateSnapshot} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

 canActivate(
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot): boolean {
  const requiredRole = next.data['role'];
  const userRole = this.authService.getUserRole(); // méthode ajoutée à AuthService
  
  if (!this.authService.isAuthenticated()) {
    this.router.navigate(['/login']);
    return false;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    this.router.navigate(['/dashboard']); // Redirige vers le dashboard si pas admin
    return false;
  }
  
  return true;
}
}