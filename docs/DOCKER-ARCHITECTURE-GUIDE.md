# Docker Architecture Guide

This document explains how the Docker files in the Student Management System
work together.

## 1. High-level architecture

Docker Compose runs three services:

```text
Browser
  │ http://localhost:3000
  ▼
Frontend container
React static files served by Nginx
  │ Browser calls http://localhost:8080/api/v1
  ▼
Backend container
Spring Boot REST API
  │ jdbc:postgresql://postgres:5432/student_db
  ▼
PostgreSQL container
```

The main Docker-related files are:

```text
docker-compose.yml       Orchestrates all containers
backend/Dockerfile       Builds the Spring Boot image
backend/.dockerignore    Excludes unnecessary backend files
frontend/Dockerfile      Builds the React image and Nginx runtime
frontend/.dockerignore   Excludes unnecessary frontend files
frontend/nginx.conf      Configures the production web server
.env.example             Documents configurable values
```

## 2. `docker-compose.yml`

`docker-compose.yml` describes how multiple containers run together. A
Dockerfile builds one image; Compose connects the images into an application.

### PostgreSQL service

```yaml
postgres:
  image: postgres:16-alpine
```

This uses the official PostgreSQL image, so this service does not need a local
Dockerfile. Its database settings come from environment variables:

```yaml
POSTGRES_DB: ${POSTGRES_DB:-student_db}
POSTGRES_USER: ${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
```

The `${NAME:-default}` syntax means Compose uses `NAME` when it is defined and
otherwise uses the supplied default.

```yaml
ports:
  - "5432:5432"
```

This maps host port `5432` to the container's PostgreSQL port. A database tool
running on the host can use `localhost:5432`.

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

The named volume keeps database data when the PostgreSQL container is
recreated. The volume is declared at the bottom of the Compose file.

The PostgreSQL health check uses `pg_isready`. The backend waits for this
health check before starting.

### Backend service

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
```

Compose builds the backend image using `backend/Dockerfile`. The backend is
published on:

```text
http://localhost:8080
```

The database URL is:

```text
jdbc:postgresql://postgres:5432/student_db
```

`postgres` is the Compose service name. Docker provides DNS inside the Compose
network, so the backend can resolve `postgres` to the database container.

Inside a container, `localhost` means that same container. Therefore the
backend must use `postgres`, not `localhost`, to reach PostgreSQL.

The backend waits for PostgreSQL to become healthy and then exposes its own
health endpoint:

```text
/actuator/health
```

### Frontend service

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
```

Compose builds the frontend image using `frontend/Dockerfile`.

```yaml
ports:
  - "3000:80"
```

Nginx listens on port `80` inside the container, but users access it through:

```text
http://localhost:3000
```

The frontend API URL is passed as a build argument:

```yaml
args:
  VITE_API_BASE_URL: http://localhost:8080/api/v1
```

This value is compiled into the Vite JavaScript bundle. The React code runs in
the user's browser, so `localhost:8080` is correct: it refers to the backend
port published on the user's computer. The browser cannot use the Docker-only
hostname `backend`.

The frontend health check calls `/healthz`, which is defined in
`frontend/nginx.conf`.

### Network

```yaml
networks:
  sms-network:
    driver: bridge
```

All three services join `sms-network`. Containers can communicate using service
names and internal ports:

```text
postgres:5432
backend:8080
frontend:80
```

The host and browser use published ports such as `localhost:3000` and
`localhost:8080` instead.

## 3. `backend/Dockerfile`

The backend uses a multi-stage build:

```text
Stage 1: Java 21 JDK image compiles the application
Stage 2: Java 21 JRE image runs only the compiled JAR
```

### Builder stage

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS builder
```

The JDK is needed for compilation. The Maven wrapper and `pom.xml` are copied
before the source code so Docker can cache dependency installation:

```dockerfile
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
```

The source is then copied and packaged:

```dockerfile
COPY src/ src/
RUN ./mvnw clean package -B
```

This creates a JAR under `target/`.

### Runtime stage

```dockerfile
FROM eclipse-temurin:21-jre-alpine AS runtime
```

The final image contains the JRE rather than the full JDK. It copies only the
compiled JAR from the builder stage:

```dockerfile
COPY --from=builder /build/target/*.jar app.jar
```

The application runs as the non-root `appuser`, which is safer than running
the Java process as root. `wget` is installed so the Docker health check can
call `/actuator/health`.

The container starts with:

```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## 4. `frontend/Dockerfile`

The frontend also uses a multi-stage build:

```text
Stage 1: Node.js compiles the React/Vite application
Stage 2: Nginx serves the generated static files
```

### Builder stage

```dockerfile
FROM node:20-alpine AS builder
```

Package descriptors are copied first so npm dependencies can be cached:

```dockerfile
COPY package.json package-lock.json* bun.lock* ./
RUN npm install
```

The application source is copied next. The `VITE_API_BASE_URL` build argument
is converted into an environment variable and consumed by Vite:

```dockerfile
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build
```

The result is generated in `/app/dist`.

### Nginx runtime stage

```dockerfile
FROM nginx:1.27-alpine AS production
```

The default Nginx content and configuration are removed. The project-specific
configuration and compiled assets are installed:

```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
```

Node.js is not included in the final image because it is only needed to build
the application, not serve the already-built files.

Nginx runs in the foreground:

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

This is required because Docker treats the foreground process as the main
container process.

## 5. `frontend/nginx.conf`

This file controls how Nginx serves the React application.

```nginx
root /usr/share/nginx/html;
```

This matches the directory populated from `/app/dist` in the frontend
Dockerfile.

React is a single-page application, so routes such as `/students/123` may not
exist as physical files. This fallback lets React handle those routes:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Hashed Vite assets under `/assets/` are cached for one year. `index.html` is
not cached so a deployment can immediately provide new asset references.

The health endpoint is deliberately lightweight:

```nginx
location = /healthz {
    return 200 "healthy\n";
}
```

## 6. `.dockerignore` files

`.dockerignore` controls what Docker sends as the build context. It is similar
to `.gitignore`, but applies to image builds.

`backend/.dockerignore` excludes compiled output, IDE metadata, Git files, and
logs. The backend is compiled inside Docker, so an existing local `target/`
directory is unnecessary.

`frontend/.dockerignore` excludes `node_modules`, build output, local
environment files, IDE metadata, logs, and Docker files. In particular,
`node_modules` should be installed inside the Linux container rather than
copied from the host operating system.

## 7. Startup sequence

Run the complete stack with:

```bash
docker compose up --build
```

The sequence is:

1. Build the backend image from `backend/Dockerfile`.
2. Build the frontend image from `frontend/Dockerfile`.
3. Start PostgreSQL and attach the `postgres_data` volume.
4. Wait for PostgreSQL's `pg_isready` health check.
5. Start Spring Boot and connect it to `postgres:5432`.
6. Wait for `/actuator/health`.
7. Start Nginx and serve the frontend on `localhost:3000`.

Useful commands:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose down
```

Do not use `docker compose down -v` unless you intentionally want to remove
the PostgreSQL volume and its data.

## 8. Architect's mental model

```text
Dockerfile
  How one image is built

docker-compose.yml
  How images become a connected application

.dockerignore
  What is excluded from a build context

nginx.conf
  How the compiled frontend is served

Volume
  Persistent database storage

Network
  Private container-to-container communication

Health check
  Whether a service is ready, not merely running

Port mapping
  How the host reaches a container
```

## 9. Production considerations

- Replace default passwords before deployment.
- Store secrets in Docker secrets or an external secret manager.
- Prefer `npm ci` when a committed lock file is available.
- Flyway currently applies the numbered migrations before JPA starts. The MVP
  still uses Hibernate `ddl-auto=update` as a transitional schema creator;
  after a complete initial-schema migration is tested, change it to
  `ddl-auto=validate` so Flyway is the only production schema owner.
- Keep `DataInitializer` limited to development/demo data; it must not be used
  to create database tables or seed real production records.
- Add HTTPS termination through a production reverse proxy or load balancer.
- Consider proxying `/api` through Nginx so the browser uses one public origin
  and CORS configuration is simpler.
