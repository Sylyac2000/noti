import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/keycloak.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="text-center mb-5">
            <h1 class="display-4 mb-3">
              <i class="fas fa-sticky-note text-primary me-3"></i>
              Bienvenue sur Noti
            </h1>
            <p class="lead text-muted">
              Votre gestionnaire de notes personnel simple et efficace
            </p>
          </div>

          <div class="row g-4 mb-5">
            <div class="col-md-4">
              <div class="card text-center h-100">
                <div class="card-body">
                  <div class="mb-3">
                    <i class="fas fa-plus-circle fa-3x text-primary"></i>
                  </div>
                  <h5 class="card-title">Créer des notes</h5>
                  <p class="card-text">Créez facilement vos notes avec un titre et un contenu personnalisé.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card text-center h-100">
                <div class="card-body">
                  <div class="mb-3">
                    <i class="fas fa-search fa-3x text-success"></i>
                  </div>
                  <h5 class="card-title">Rechercher</h5>
                  <p class="card-text">Trouvez rapidement vos notes grâce à la recherche par titre ou contenu.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card text-center h-100">
                <div class="card-body">
                  <div class="mb-3">
                    <i class="fas fa-edit fa-3x text-warning"></i>
                  </div>
                  <h5 class="card-title">Organiser</h5>
                  <p class="card-text">Modifiez, supprimez et organisez vos notes selon vos besoins.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center">
            <h3 class="mb-3">Commencer maintenant</h3>
            <div *ngIf="authService.isLoggedIn()">
              <div class="mb-3">
                <span class="text-muted">Connecté en tant que : </span>
                <strong>{{ authService.getUsername() }}</strong>
              </div>
              <div class="d-flex gap-3 justify-content-center flex-wrap">
                <a routerLink="/notes/new" class="btn btn-primary btn-lg">
                  <i class="fas fa-plus me-2"></i>
                  Créer ma première note
                </a>
                <a routerLink="/notes" class="btn btn-outline-primary btn-lg">
                  <i class="fas fa-list me-2"></i>
                  Voir mes notes
                </a>
                <button class="btn btn-outline-secondary btn-lg" (click)="logout()">
                  <i class="fas fa-sign-out-alt me-2"></i>
                  Se déconnecter
                </button>
              </div>
            </div>
            <div class="text-center" *ngIf="!authService.isLoggedIn()">
              <button class="btn btn-primary btn-lg" (click)="authService.login()">
                <i class="fas fa-sign-in-alt me-2"></i>
                Se connecter pour commencer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  authService = inject(AuthService);

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
  }
}