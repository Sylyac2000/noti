# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Spring Boot 3.2.0 backend application for note management ("noti"), using Java 21 and Maven. The application provides a REST API for CRUD operations on notes with search functionality.

## Architecture

### Core Components
- **Entity Layer**: `Note` entity (src/main/java/com/example/noti/entity/) - JPA entity representing notes with title, content, and timestamps
- **Repository Layer**: `NoteRepository` (src/main/java/com/example/noti/repository/) - JPA repository with custom query methods for search operations
- **Service Layer**: `NoteService` (src/main/java/com/example/noti/service/) - Business logic for note operations
- **Controller Layer**: `NoteController` (src/main/java/com/example/noti/controller/) - REST API endpoints under `/api/notes`

### Database Configuration
- Uses H2 in-memory database for development (jdbc:h2:mem:notedb)
- JPA/Hibernate with `create-drop` schema generation
- H2 Console available at `/h2-console`

### API Documentation
- SpringDoc OpenAPI integration for Swagger UI
- Swagger UI accessible at `/swagger-ui.html`

### Security Configuration
- Keycloak OAuth2 Resource Server integration
- JWT-based authentication
- CORS configuration for frontend integration
- Protected API endpoints under `/api/notes`
- Authentication endpoints under `/api/auth`

## Common Development Commands

### Build and Run
```bash
# Compile and package the application
mvn clean compile

# Run tests
mvn test

# Package application (creates JAR in target/)
mvn package

# Run the application
mvn spring-boot:run

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Docker Environment
```bash
# Start Keycloak and PostgreSQL services
docker-compose up -d

# Start services in simple mode
docker-compose -f docker-compose-simple.yml up -d

# Stop all services
docker-compose down
```

## API Endpoints

- `GET /api/notes` - Get all notes (ordered by modification date)
- `GET /api/notes/{id}` - Get note by ID
- `POST /api/notes` - Create new note
- `PUT /api/notes/{id}` - Update existing note
- `DELETE /api/notes/{id}` - Delete note
- `GET /api/notes/search?keyword=` - Search in title and content
- `GET /api/notes/title?titre=` - Search by title

### Authentication Endpoints
- `GET /api/auth/user-info` - Get current user information (requires authentication)

## Development URLs

- Application: http://localhost:8080
- H2 Console: http://localhost:8080/h2-console
- Swagger UI: http://localhost:8080/swagger-ui.html
- Keycloak (Docker): http://localhost:9090

## Known Issues

### SpringDoc OpenAPI Version Compatibility
If you encounter `java.lang.IllegalStateException: Error processing condition on org.springdoc.webmvc.ui.SwaggerConfig.springWebProvider`, upgrade SpringDoc OpenAPI version in pom.xml:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.2.0</version>
</dependency>
```

## Code Conventions

- French field names in entities (titre, contenu, dateCreation, dateModification)
- Uses standard Spring Boot REST controller patterns
- JPA entity relationships managed through standard annotations
- Constructor-based timestamp initialization with @PreUpdate for modifications