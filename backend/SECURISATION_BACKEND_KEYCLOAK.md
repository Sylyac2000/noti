# Sécurisation d'un Backend Spring Boot avec Keycloak

Ce guide détaillé explique comment sécuriser un backend Spring Boot en utilisant Keycloak comme serveur d'authentification et d'autorisation OAuth2/OpenID Connect.

## Table des matières

1. [Prérequis](#prérequis)
2. [Architecture de sécurité](#architecture-de-sécurité)
3. [Configuration Keycloak](#configuration-keycloak)
4. [Configuration Spring Boot](#configuration-spring-boot)
5. [Implémentation de la sécurité](#implémentation-de-la-sécurité)
6. [Tests et validation](#tests-et-validation)
7. [Bonnes pratiques](#bonnes-pratiques)
8. [Dépannage](#dépannage)

## Prérequis

- Java 17+
- Spring Boot 3.x
- Maven 3.6+
- Docker (pour Keycloak)
- Keycloak 22.0.1+

## Architecture de sécurité

### Composants principaux

```
Frontend (Angular) → Backend (Spring Boot) → Keycloak
                     ↓
                  Base de données
```

### Flow d'authentification

1. **Utilisateur** → se connecte via le frontend
2. **Frontend** → redirige vers Keycloak
3. **Keycloak** → authentifie et retourne un JWT (Access Token)
4. **Frontend** → utilise le JWT pour appeler les APIs backend
5. **Backend** → valide le JWT avec Keycloak et autorise l'accès

## Configuration Keycloak

### 1. Démarrage de Keycloak

**docker-compose.yml :**
```yaml
version: '3.8'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:23.0.0
    container_name: keycloak-noti
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: h2
      KC_HOSTNAME_URL: http://localhost:9090
      KC_HOSTNAME_ADMIN_URL: http://localhost:9090
      KC_HTTP_ENABLED: true
      KC_HTTP_PORT: 8080
      KC_HOSTNAME_STRICT: false
      KC_HOSTNAME_STRICT_HTTPS: false
    ports:
      - "9090:8080"
    command: ["start-dev"]
    volumes:
      - keycloak_data:/opt/keycloak/data
      - ./keycloak-setup:/opt/keycloak/data/import
    networks:
      - noti-network

volumes:
  keycloak_data:

networks:
  noti-network:
    driver: bridge
```

**Commandes :**
```bash
# Démarrer Keycloak
docker-compose up -d keycloak

# Accéder à la console admin
# URL: http://localhost:9090
# Username: admin
# Password: admin
```

### 2. Configuration du Realm

**Création du realm `noti-realm` :**

1. **Console Admin Keycloak** → `Create Realm`
2. **Realm name** : `noti-realm`
3. **Enabled** : `ON`

**Configuration du realm :**
```json
{
  "realm": "noti-realm",
  "enabled": true,
  "displayName": "Noti Application Realm",
  "accessTokenLifespan": 300,
  "sslRequired": "external",
  "registrationAllowed": true,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": false,
  "editUsernameAllowed": false
}
```

### 3. Configuration des Clients

#### Client Backend (Resource Server)

**Paramètres du client `noti-backend` :**
- **Client ID** : `noti-backend`
- **Client authentication** : `ON`
- **Authorization** : `OFF`
- **Standard flow** : `OFF`
- **Service accounts roles** : `ON`
- **Client secret** : `noti-backend-secret`

#### Client Frontend (Public Client)

**Paramètres du client `noti-frontend` :**
- **Client ID** : `noti-frontend`
- **Client authentication** : `OFF`
- **Standard flow** : `ON`
- **Valid redirect URIs** : `http://localhost:4200/*`
- **Web origins** : `http://localhost:4200`

### 4. Création d'utilisateurs de test

**Utilisateur `balou` :**
- **Username** : `balou`
- **Email** : `balou@balou.com`
- **First name** : `Balou`
- **Last name** : `Louba`
- **Password** : `password123`
- **Email verified** : `ON`
- **Enabled** : `ON`

**Rôles assignés :**
- `default-roles-noti-realm`
- `offline_access`
- `admin`
- `uma_authorization`
- `user`

## Configuration Spring Boot

### 1. Dépendances Maven

**pom.xml :**
```xml
<dependencies>
    <!-- Dépendances existantes -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Dépendances de sécurité -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
    </dependency>
</dependencies>
```

### 2. Configuration des propriétés

**application.properties :**
```properties
# Configuration Keycloak
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:9090/realms/noti-realm

# Configuration CORS
app.cors.allowed-origins=http://localhost:4200

# Configuration serveur
server.port=8080

# Logs de sécurité (pour debugging)
logging.level.org.springframework.security=DEBUG
```

## Implémentation de la sécurité

### 1. Configuration de Spring Security

**SecurityConfig.java :**
```java
package com.example.noti.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Endpoints publics
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                // Endpoints protégés
                .requestMatchers("/api/notes/**").authenticated()
                .requestMatchers("/api/auth/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );

        // Pour permettre l'accès à la console H2 (développement uniquement)
        http.headers(headers -> headers.frameOptions().sameOrigin());

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        
        // Convertisseur personnalisé pour extraire les rôles de realm_access.roles
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess == null) {
                return List.of();
            }
            
            Object roles = realmAccess.get("roles");
            if (roles instanceof List) {
                return ((List<?>) roles).stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .collect(Collectors.toList());
            }
            
            return List.of();
        });
        
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 2. Contrôleur d'authentification

**AuthController.java :**
```java
package com.example.noti.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/user-info")
    public ResponseEntity<Map<String, Object>> getUserInfo(Authentication authentication) {
        Map<String, Object> userInfo = new HashMap<>();
        
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            
            // Informations utilisateur de base
            userInfo.put("sub", jwt.getClaimAsString("sub"));
            userInfo.put("preferred_username", jwt.getClaimAsString("preferred_username"));
            userInfo.put("email", jwt.getClaimAsString("email"));
            userInfo.put("name", jwt.getClaimAsString("name"));
            
            // Récupération des rôles depuis realm_access.roles
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess != null && realmAccess.get("roles") instanceof List) {
                userInfo.put("roles", realmAccess.get("roles"));
            } else {
                userInfo.put("roles", List.of());
            }
            
            // Rôles Spring Security (avec ROLE_ prefix)
            List<String> authorities = authentication.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toList());
            userInfo.put("authorities", authorities);
            
            userInfo.put("authenticated", true);
        } else {
            userInfo.put("authenticated", false);
        }
        
        return ResponseEntity.ok(userInfo);
    }
}
```

### 3. Protection des contrôleurs métier

**NoteController.java (exemple) :**
```java
package com.example.noti.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    // Accessible à tous les utilisateurs authentifiés
    @GetMapping
    public List<Note> getAllNotes() {
        return noteService.findAll();
    }

    // Accessible uniquement aux administrateurs
    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id) {
        noteService.delete(id);
    }

    // Accessible aux utilisateurs avec rôle 'user' ou 'admin'
    @PreAuthorize("hasRole('user') or hasRole('admin')")
    @PostMapping
    public Note createNote(@RequestBody Note note) {
        return noteService.save(note);
    }
}
```

## Tests et validation

### 1. Tests manuels avec HTTP Client

**Test sans authentification (doit retourner 401) :**
```http
GET http://localhost:8080/api/notes

### Réponse attendue: 401 Unauthorized
```

**Test avec token valide :**
```http
GET http://localhost:8080/api/auth/user-info
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...

### Réponse attendue: 200 OK avec informations utilisateur
```

### 2. Obtenir un token d'accès

**Via curl :**
```bash
curl -X POST http://localhost:9090/realms/noti-realm/protocol/openid_connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=noti-frontend" \
  -d "username=balou" \
  -d "password=password123"
```

**Réponse :**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IlJlZnJlc2gifQ...",
  "token_type": "Bearer",
  "expires_in": 300
}
```

### 3. Test des informations utilisateur

**Requête :**
```http
GET http://localhost:8080/api/auth/user-info
Authorization: Bearer [ACCESS_TOKEN]
```

**Réponse attendue :**
```json
{
  "sub": "0fa57ebd-94da-4d0b-9e19-feca47a1bf19",
  "authenticated": true,
  "roles": [
    "default-roles-noti-realm",
    "offline_access",
    "admin",
    "uma_authorization",
    "user"
  ],
  "name": "Balou Louba",
  "preferred_username": "balou",
  "email": "balou@balou.com",
  "authorities": [
    "ROLE_default-roles-noti-realm",
    "ROLE_offline_access",
    "ROLE_admin",
    "ROLE_uma_authorization",
    "ROLE_user"
  ]
}
```

### 4. Tests automatisés

**Exemple de test unitaire :**
```java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class SecurityIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testUnauthenticatedAccess() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            "/api/notes", String.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @WithMockJwt(subject = "user-id", roles = {"user"})
    void testAuthenticatedAccess() {
        ResponseEntity<String> response = restTemplate.getForEntity(
            "/api/notes", String.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
```

## Bonnes pratiques

### 1. Sécurité

- **HTTPS en production** : Toujours utiliser HTTPS en production
- **Secrets sécurisés** : Stocker les secrets dans des variables d'environnement
- **Token expiration** : Configurer des durées d'expiration appropriées
- **CORS restrictif** : Limiter les origines autorisées en production

### 2. Gestion des rôles

```java
// Rôles granulaires
@PreAuthorize("hasRole('NOTES_READ')")
@GetMapping
public List<Note> getNotes() { ... }

@PreAuthorize("hasRole('NOTES_WRITE')")
@PostMapping
public Note createNote(@RequestBody Note note) { ... }

@PreAuthorize("hasRole('NOTES_DELETE') or hasRole('ADMIN')")
@DeleteMapping("/{id}")
public void deleteNote(@PathVariable Long id) { ... }
```

### 3. Logging et monitoring

```properties
# Logs de sécurité
logging.level.org.springframework.security=INFO
logging.level.org.springframework.security.oauth2=DEBUG

# Monitoring des tokens
logging.level.org.springframework.security.oauth2.server.resource=DEBUG
```

### 4. Configuration par environnement

**application-dev.properties :**
```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:9090/realms/noti-realm
app.cors.allowed-origins=http://localhost:4200
logging.level.org.springframework.security=DEBUG
```

**application-prod.properties :**
```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://keycloak.production.com/realms/noti-realm
app.cors.allowed-origins=https://app.production.com
logging.level.org.springframework.security=WARN
```

## Dépannage

### 1. Erreurs courantes

**Erreur : "invalid_token - Another algorithm expected"**
- **Cause** : Problème de validation de signature JWT
- **Solution** : Vérifier que l'`issuer-uri` est correct et accessible

**Erreur : "401 Unauthorized" avec token valide**
- **Cause** : Problème de CORS ou token expiré
- **Solution** : Vérifier la configuration CORS et renouveler le token

**Erreur : "Roles null"**
- **Cause** : Configuration incorrecte du `JwtAuthenticationConverter`
- **Solution** : Vérifier l'extraction des rôles depuis `realm_access.roles`

### 2. Debugging

```bash
# Vérifier la configuration Keycloak
curl http://localhost:9090/realms/noti-realm/.well-known/openid_configuration

# Vérifier les certificats JWT
curl http://localhost:9090/realms/noti-realm/protocol/openid_connect/certs

# Décoder un JWT (jwt.io)
# Copier le token et le décoder sur https://jwt.io pour voir son contenu
```

### 3. Outils utiles

- **jwt.io** : Décoder et inspecter les tokens JWT
- **Postman** : Tester les APIs avec authentification
- **Browser DevTools** : Inspecter les requêtes et tokens côté client

## Conclusion

Cette documentation présente une implémentation complète de la sécurisation d'un backend Spring Boot avec Keycloak. Les points clés sont :

1. **Configuration Keycloak** : Realm, clients, utilisateurs et rôles
2. **Configuration Spring Security** : OAuth2 Resource Server avec JWT
3. **Gestion des rôles** : Extraction et mapping des rôles Keycloak vers Spring Security
4. **Tests et validation** : Vérification du bon fonctionnement de l'authentification
5. **Bonnes pratiques** : Sécurité, logging et configuration par environnement

Cette approche garantit une sécurité robuste et scalable pour votre application Spring Boot.