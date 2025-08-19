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
            <li class="nav-item dropdown" *ngIf="authService.isLoggedIn()">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                <i class="fas fa-user me-1"></i>
                {{ authService.getUsername() }}
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" (click)="$event.preventDefault()">
                  <i class="fas fa-user-circle me-2"></i>Profil
                </a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" (click)="authService.logout(); $event.preventDefault()">
                  <i class="fas fa-sign-out-alt me-2"></i>Se déconnecter
                </a></li>
              </ul>
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
}