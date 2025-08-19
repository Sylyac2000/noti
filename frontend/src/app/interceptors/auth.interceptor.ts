import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakService);

  // Ne pas intercepter les requêtes vers Keycloak
  if (req.url.includes('/realms/')) {
    return next(req);
  }

  // Ajouter le token pour les requêtes vers l'API backend
  if (req.url.includes('/api/') && keycloakService.isLoggedIn()) {
    return from(keycloakService.getToken()).pipe(
      switchMap(token => {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(authReq);
      })
    );
  }

  return next(req);
};