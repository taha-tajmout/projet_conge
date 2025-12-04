import { Routes } from '@angular/router';
import { UtilisateurList } from './utilisateur.list/utilisateur-list';
import { CreateUtilisateur } from './create-utilisateur/create-utilisateur';
import { UpdateUtilisateur } from './update-utilisateur/update-utilisateur';
import { Dashboard } from './dashboard/dashboard';
import { Login } from './login/login';
import { AuthGuard } from './auth.guard';
import { NouvelleDemandeComponent} from './nouvelle-demande/nouvelle-demande';
import { GestionDemandesComponent } from './gestion-demandes/gestion-demandes';
import { AuthService } from './auth.service';
import { ValidationRhComponent } from './validation-rh/validation-rh';


export const routes: Routes = [

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {path:'dashboard',component:Dashboard,canActivate:[AuthGuard]},
  { path: 'utilisateurs', component: UtilisateurList, canActivate: [AuthGuard] },
  { path: 'create-utilisateur', component: CreateUtilisateur, canActivate: [AuthGuard] },
  { path: 'update-utilisateur/:matricule', component: UpdateUtilisateur, canActivate: [AuthGuard] },
  {path:'nouvelle-demande',component:NouvelleDemandeComponent,canActivate:[AuthGuard]},
  { path: 'gestion-demandes', component: GestionDemandesComponent, canActivate: [AuthGuard] },
  { 
  path: 'validation-rh', 
  component: ValidationRhComponent, 
  canActivate: [AuthGuard],
  data: { role: 'RH' }
}
   
];
  


  