import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/keycloak.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">
          <i class="fas fa-sticky-note me-2"></i>
          Noti
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <i class="fas fa-home me-1"></i>
                Accueil
              </a>
            </li>
            <li class="nav-item" *ngIf="authService.isLoggedIn()">
              <a class="nav-link" routerLink="/notes" routerLinkActive="active">
                <i class="fas fa-list me-1"></i>
                Mes Notes
              </a>
            </li>
            <li class="nav-item" *ngIf="authService.isLoggedIn()">
              <a class="nav-link" routerLink="/notes/new" routerLinkActive="active">
                <i class="fas fa-plus me-1"></i>
                Nouvelle Note
              </a>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item" *ngIf="!authService.isLoggedIn()">
              <button class="btn btn-outline-light" (click)="authService.login()">
                <i class="fas fa-sign-in-alt me-1"></i>
                Se connecter
              </button>
            </li>
            <li class="nav-item d-flex align-items-center" *ngIf="authService.isLoggedIn()">
              <span class="navbar-text me-3">
                <i class="fas fa-user me-1"></i>
                Bonjour, {{ authService.getUsername() }}
              </span>
              <button class="btn btn-outline-light btn-sm" (click)="logout()" title="Se déconnecter">
                <i class="fas fa-sign-out-alt me-1"></i>
                Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
  }
}