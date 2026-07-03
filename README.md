# NestJS Boilerplate

Enterprise-ready NestJS backend boilerplate with modern engineering standards, CI/CD, code governance, Docker, Vault integration, and scalable architecture practices.

See [the Clean Architecture guide](docs/clean-architecture.md) for the current
project boundaries, folder structure, file responsibilities, and request flow.

---

# Tech Stack

| Area | Tool |
|---|---|
| Framework | NestJS |
| Language | TypeScript |
| Formatter + Linting | Biome |
| Unit Testing | Jest |
| Runtime Validation | class-validator |
| Static Code Analysis | SonarQube |
| CI/CD | GitHub Actions |
| Containerization | Docker |
| Secrets Management | HashiCorp Vault |
| Logging | NestJS Logger |
| API Documentation | Swagger (planned) |
| Monitoring | Grafana (planned) |

---

# Features

- NestJS modular architecture
- Biome formatter + linting
- Jest testing setup
- SonarQube CI integration
- Docker multi-stage build
- Graceful shutdown support
- Secure CORS configuration
- Helmet security headers
- Compression middleware
- Global validation pipes
- API versioning
- Vault-based environment management
- GitHub Actions CI/CD pipeline
- Enterprise-ready folder structure

---

# Folder Structure

```text
src/
├── common/
│   ├── constants/
│   ├── decorators/
│   ├── dto/
│   ├── enums/
│   ├── exceptions/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── interfaces/
│   ├── middlewares/
│   ├── pipes/
│   ├── types/
│   └── utils/
│
├── config/vault
|
├── lifecycle
│
├── modules/
│   └── example/
│       ├── dto/
│       ├── schemas/
│       ├── example.controller.ts
│       ├── example.service.ts
│       └── example.module.ts
│
├── app.module.ts
└── main.ts
````

---

# Getting Started

## 1. Install Dependencies

```bash
npm install
```

---

# Run Application

## Development

```bash
npm run start:dev
```

## Production

```bash
npm run build
npm run start:prod
```

---

# Biome Commands

## Check

```bash
npm run check
```

## Fix Issues

```bash
npm run check:fix
```

## Format

```bash
npm run format
```

## Lint

```bash
npm run lint
```

---

# Testing

## Run Tests

```bash
npm run test
```

## Coverage

```bash
npm run test:cov
```

## CI Tests

```bash
npm run test:ci
```

---

# Docker

## Build Image

```bash
docker build -t nestjs-boilerplate .
```

## Run Container

```bash
docker run -p 3000:3000 nestjs-boilerplate
```

---

# Environment Variables

Environment variables are loaded from Vault during bootstrap.

Example Vault secrets:

```env
PORT=3000

REQUEST_BODY_LIMIT=10mb

CORS_ORIGINS=http://localhost:3000,http://localhost:3001

VAULT_ADDR=http://vault-host:8200

VAULT_TOKEN=your-token
```

---

# API Standards

## Global Prefix

```text
/api
```

## API Versioning

```text
/api/v1
```

Example:

```text
/api/v1/users
```

---

# Security

The application includes:

* Helmet security headers
* Request body limits
* CORS protection
* Validation pipes
* Non-root Docker execution
* Graceful shutdown handling

---

# Graceful Shutdown

The application supports graceful shutdown using:

* SIGTERM
* SIGINT

This ensures:

* clean resource cleanup
* safe container shutdown
* stable deployments

---

# SonarQube

## Run Analysis Through GitHub Actions

The CI pipeline automatically:

* runs tests
* generates coverage
* scans code using SonarQube

Required GitHub Secrets:

| Secret         | Description     |
| -------------- | --------------- |
| SONAR_HOST_URL | SonarQube URL   |
| SONAR_TOKEN    | SonarQube token |

---

# CI/CD

GitHub Actions pipeline includes:

* dependency installation
* Biome validation
* build validation
* test execution
* SonarQube scan

---

# Recommended Branch Strategy

| Branch  | Purpose            |
| ------- | ------------------ |
| main    | Production         |
| staging | UAT / Staging      |
| develop | Active Development |

---

# Recommended Future Enhancements

* Swagger/OpenAPI
* Rate limiting
* RBAC module
* Structured logging
* Distributed tracing
* Grafana dashboards
* Snyk/Trivy security scans

---

# Engineering Principles

This boilerplate follows:

* clean architecture principles
* modular design
* centralized configuration
* environment isolation
* CI-first validation
* infrastructure-as-code mindset
* production-first engineering practices
