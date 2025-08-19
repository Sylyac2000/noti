import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private keycloak: KeycloakService) { }

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }

  getUsername(): string {
    return this.keycloak.getUsername() || 'Utilisateur';
  }

  getUserRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  hasRole(role: string): boolean {
    return this.keycloak.getUserRoles().includes(role);
  }

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.keycloak.logout(window.location.origin);
  }

  getToken(): Promise<string> {
    return Promise.resolve(this.keycloak.getToken());
  }

  updateToken(): Promise<boolean> {
    return this.keycloak.updateToken();
  }
}