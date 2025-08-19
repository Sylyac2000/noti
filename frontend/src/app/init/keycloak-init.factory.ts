import { KeycloakService } from 'keycloak-angular';
import keycloakConfig from '../config/keycloak.config';

export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () =>
    keycloak.init({
      config: keycloakConfig,
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        checkLoginIframe: false,
        enableLogging: true
      },
      loadUserProfileAtStartUp: true
    });
}