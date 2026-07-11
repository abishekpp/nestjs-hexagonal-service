# Hexagonal Architecture In This NestJS Service

## Document Control

| Field | Value |
| --- | --- |
| Document title | Hexagonal Architecture In This NestJS Service |
| Project | `nestjs-hexagonal-service` |
| Version | 0.1.0 |
| Status | Draft reference document |
| Last updated | 2026-07-11 |
| Owner | To be assigned by the engineering lead |
| Review cycle | Review before each production adoption and at least once per major project milestone |
| Intended audience | Backend developers, technical leads, maintainers, reviewers, auditors, onboarding engineers |
| Classification | Internal engineering reference |
| Related codebase areas | `src/modules`, `src/infrastructure`, `src/common`, `src/config`, `src/shared` |

### Change History

| Version | Date | Author | Summary |
| --- | --- | --- | --- |
| 0.1.0 | 2026-07-11 | Codex assisted draft | Initial architecture reference for the NestJS hexagonal POC service |

### Document Status Notice

This document is written in an ISO-friendly documentation style, but it does not claim formal ISO compliance or certification. It is intended to support maintainability, reviewability, onboarding, traceability, and future audit preparation. Any project using this document for an ISO-controlled environment must apply the organization's approved document control, review, approval, retention, and evidence processes.

## Executive Summary

This service is a sample, boilerplate, and proof-of-concept implementation of Hexagonal Architecture in NestJS. Hexagonal Architecture is also commonly called Ports and Adapters Architecture.

The project demonstrates how to structure a NestJS backend so that business logic is not tightly coupled to NestJS controllers, Prisma, Kafka, gRPC, or other infrastructure details. The business use cases depend on ports, and infrastructure adapters implement those ports.

This repository should be used as a reference and starter point, not as a final production template to copy without review. The modules, names, business rules, and implementations are examples. The architectural ideas are reusable; the exact implementation must be reviewed, cleaned up, hardened, and adapted before production use.

This document focuses on services and microservices. A gateway may exist in the wider system, but the gateway should be treated as an external caller, routing layer, authentication layer, authorization layer, or request enrichment layer. The gateway should not own service business rules. In this architecture, business behavior belongs inside the service modules.

### What Can Be Reused

- The dependency direction.
- The folder layout pattern.
- The separation between domain, application, ports, adapters, and infrastructure.
- The use of NestJS dependency injection to bind ports to adapters.
- The idea of keeping Prisma and Kafka outside the core business logic.
- The testing approach of mocking ports for use-case tests.
- The documentation and review checklists.

### What Must Not Be Reused Blindly

- Business rules in `transmittals` and `workflows`.
- Entity fields and naming.
- Kafka topic structure.
- Prisma schema design.
- Error codes and exception types.
- Base repository design without evaluating project needs.
- `@Global()` module usage without reviewing lifecycle and dependency impact.
- Any POC shortcut that has not passed production readiness review.

## Goals And Non-Goals

### Goals

| Goal | Description |
| --- | --- |
| Maintainability | Make business rules easier to locate, understand, test, and change. |
| Testability | Allow domain and use-case logic to be tested without running NestJS, Prisma, Kafka, or gRPC. |
| Dependency inversion | Make the application core depend on abstractions instead of concrete infrastructure. |
| Clear module boundaries | Keep each business capability grouped under `src/modules/<module-name>`. |
| Infrastructure replaceability | Keep Prisma, Kafka, and transport-specific code at the edge of the system. |
| Developer onboarding | Give developers a repeatable pattern for adding new modules and features. |
| Reference boilerplate | Provide a starter structure that can be cleaned and hardened for future projects. |
| Audit readiness | Keep architecture decisions, responsibilities, and review expectations explicit. |

### Non-Goals

| Non-goal | Explanation |
| --- | --- |
| Final production design | This POC is not automatically production-ready. |
| Universal shared business package | The modules are examples, not reusable domain packages. |
| Removing all NestJS concepts | NestJS is still used for module composition, DI, controllers, lifecycle, and runtime wiring. |
| Maximum abstraction | Ports should be used where they protect meaningful boundaries, not everywhere by default. |
| Framework independence at all costs | The goal is practical separation, not theoretical purity. |
| ISO certification | This document supports controlled engineering practice but does not certify compliance. |

## Prerequisites For Developers

Before working with this architecture, developers should understand these topics.

| Topic | Why It Matters |
| --- | --- |
| NestJS modules | Modules bind controllers, providers, ports, and adapters together. |
| NestJS dependency injection | Ports are wired to concrete adapters through providers. |
| TypeScript interfaces and types | Ports are commonly represented as interfaces or type contracts. |
| TypeScript classes | Entities, use cases, and adapters are implemented as classes. |
| Basic OOP | Encapsulation and responsibility assignment are central to the design. |
| SOLID principles | Especially Single Responsibility and Dependency Inversion. |
| DTOs vs domain entities | External input/output shapes should not be treated as core domain models. |
| Persistence mapping | Prisma records must be mapped to domain entities and back. |
| Testing with mocks | Use cases should be tested by mocking outbound ports. |
| Runtime configuration | Infrastructure adapters require environment-specific configuration. |

### For Developers Coming From Default NestJS Structure

In a typical NestJS starter project, a module may contain:

```text
users/
  users.controller.ts
  users.service.ts
  users.module.ts
```

That structure is easy to start with, but it can become difficult to maintain when the service grows. Business rules often end up mixed with HTTP/gRPC controllers, Prisma calls, messaging calls, and validation code.

In this POC, the module is split by responsibility:

```text
modules/transmittals/
  domain/
  application/
  ports/
  adapters/
  transmittals.module.ts
```

The main mindset shift is this:

> The NestJS service class is not automatically the business layer. The use case is the application layer, ports define boundaries, and adapters handle external technology.

## Core Philosophy

Hexagonal Architecture places the business behavior at the center of the system. External tools communicate with the application through ports and adapters.

### Core Terms

| Term | Meaning In This Project |
| --- | --- |
| Domain | Business objects, invariants, and domain exceptions. |
| Application | Use cases that coordinate domain behavior and ports. |
| Port | An interface or token-defined contract used at a boundary. |
| Inbound port | A contract for calling into the application. |
| Outbound port | A contract for something the application needs from outside, such as persistence or messaging. |
| Adapter | A concrete implementation that connects a port to a technology or delivery mechanism. |
| Infrastructure | Database, messaging, cache, config, lifecycle, and external service details. |

### The Dependency Rule

Dependencies should point inward.

```text
External world
  -> inbound adapters
    -> application use cases
      -> domain
    -> outbound ports
  <- outbound adapters
Infrastructure details stay outside the core.
```

The application core may know about a port. It should not know about Prisma, Kafka, Redis, HTTP, gRPC, or framework-specific persistence details.

### Runtime Call Flow vs Compile-Time Dependency Flow

Runtime calls often move from outside to inside and back out:

```text
gRPC controller
  -> CreateTransmittalUseCase
    -> Transmittal entity
    -> TransmittalRepositoryPort
      -> PrismaTransmittalRepositoryAdapter
    -> EmailMessagePublisherPort
      -> KafkaEmailMessagePublisherAdapter
```

Compile-time dependencies should remain controlled:

```text
Use case imports:
  - domain entity
  - input/output DTOs
  - port contracts

Use case should not import:
  - PrismaService
  - ClientKafka
  - gRPC generated details
  - controller classes
```

## Architecture Overview

### High-Level View

```text
                 Inbound Side
  Gateway / gRPC / HTTP / CLI / Jobs / Events
                       |
                       v
              adapters/in/*
                       |
                       v
                ports/in/*
                       |
                       v
              application/use-cases
                       |
                       v
                  domain/*
                       |
                       v
                ports/out/*
                       |
                       v
              adapters/out/*
                       |
                       v
      Prisma / Kafka / Redis / External APIs / Files
                 Outbound Side
```

### Example From This Service

The `CreateTransmittalUseCase` demonstrates the application layer. It:

- Validates application-level business rules.
- Creates a `Transmittal` domain entity.
- Persists the transmittal through `TransmittalRepositoryPort`.
- Publishes email events through `EmailMessagePublisherPort`.
- Returns `CreateTransmittalOutput`.

The use case does not directly create Prisma queries and does not directly use Kafka client APIs.

### Gateway Boundary Note

In a wider system, an API gateway can call this service through gRPC. That does not make the gateway part of the service's hexagonal architecture.

Gateway responsibilities may include:

- Routing external requests to the correct service.
- Authentication and authorization checks.
- Request enrichment, such as adding user identity metadata.
- Response aggregation when required by client experience.
- Rate limiting, logging, and edge security.

Gateway responsibilities should not include:

- Transmittal business rules.
- Workflow business rules.
- Direct database access for service-owned data.
- Kafka publishing for service-owned business events.
- Calling another service's repository or domain classes.

The gateway is an inbound caller. The service's gRPC controller remains the inbound adapter, and the service use case remains the business entry point.

## Communication Scenarios

This POC focuses on service-level architecture. The following scenarios explain how service boundaries should be handled.

### Scenario 1: Gateway To Microservice Over gRPC

This is the normal external request flow when a gateway exists.

```text
Client
  -> Gateway
    -> gRPC call
      -> Microservice gRPC controller
        -> Use case
          -> Domain entity
          -> Outbound ports
            -> Database / broker / external systems
```

Responsibilities:

| Component | Responsibility |
| --- | --- |
| Client | Sends external request. |
| Gateway | Authenticates, authorizes, routes, and forwards request. |
| gRPC controller | Acts as inbound adapter for the microservice. |
| Use case | Owns application workflow and business orchestration. |
| Domain entity | Protects domain invariants. |
| Outbound adapter | Talks to database, broker, or external system through a port. |

Good service-side example:

```ts
@Controller()
export class TransmittalsGrpcController {
  constructor(private readonly createTransmittal: CreateTransmittalUseCase) {}

  @GrpcMethod('TransmittalsService', 'CreateTransmittal')
  create(request: CreateTransmittalGrpcRequestDto) {
    return this.createTransmittal.execute(request);
  }
}
```

Bad gateway-side pattern:

```ts
// Do not put service business rules in the gateway.
if (request.documentIds.length > 50) {
  throw new Error('A transmittal cannot contain more than 50 documents');
}
```

Why this is bad:

- The rule belongs to the service that owns transmittals.
- Other callers may bypass the gateway and miss the rule.
- The rule becomes duplicated across gateway and service.
- Maintenance becomes harder because business ownership is unclear.

Gateway validation can reject malformed requests, but service-owned business rules must stay in the service.

### Scenario 2: Inter-Module Communication Inside One Microservice

This project already demonstrates this idea: the `workflows` module can call behavior exposed by the `transmittals` module.

Recommended flow:

```text
Workflows use case
  -> WorkflowTransmittalPort
    -> TransmittalModuleAdapter
      -> CREATE_TRANSMITTAL_PORT
        -> CreateTransmittalUseCase
```

Why use a port:

- `workflows` does not need to know the internals of `transmittals`.
- `transmittals` can expose a stable application capability.
- Tests can mock the dependency.
- Module boundaries stay explicit.

Good pattern:

```ts
@Injectable()
export class TransmittalModuleAdapter implements WorkflowTransmittalPort {
  constructor(
    @Inject(CREATE_TRANSMITTAL_PORT)
    private readonly createTransmittal: CreateTransmittalPort,
  ) {}

  create(input: CreateWorkflowTransmittalInput): Promise<WorkflowTransmittalOutput> {
    return this.createTransmittal.execute(input);
  }
}
```

Bad pattern:

```ts
// Avoid reaching into another module's repository directly.
constructor(private readonly transmittalRepository: PrismaTransmittalRepositoryAdapter) {}
```

Why this is bad:

- It bypasses the `transmittals` use case.
- It can skip transmittal-specific rules.
- It couples `workflows` to transmittal persistence.
- It increases circular dependency risk.

Use inter-module calls only when the called module owns a real business capability. Do not use another module as a shared utility bag.

### Scenario 3: Microservice-To-Microservice Communication Without Gateway

Sometimes one microservice must call another microservice directly. For example, a workflow service may need data from a document service, or a notification service may need to call a user service.

The calling service should still preserve its own hexagonal boundary.

Recommended flow:

```text
Calling service use case
  -> Outbound port
    -> gRPC client adapter
      -> Remote service gRPC endpoint
        -> Remote service inbound adapter
          -> Remote service use case
```

The calling use case should not inject raw `ClientGrpc`.

Good calling-service pattern:

```ts
export const DOCUMENT_SERVICE_PORT = Symbol('DOCUMENT_SERVICE_PORT');

export interface DocumentServicePort {
  getDocumentById(id: string): Promise<DocumentSummary>;
}
```

```ts
@Injectable()
export class CreateWorkflowUseCase {
  constructor(
    @Inject(DOCUMENT_SERVICE_PORT)
    private readonly documentService: DocumentServicePort,
  ) {}
}
```

Good outbound adapter pattern:

```ts
@Injectable()
export class GrpcDocumentServiceAdapter implements DocumentServicePort {
  constructor(@Inject(DOCUMENT_GRPC_CLIENT) private readonly client: ClientGrpc) {}

  async getDocumentById(id: string): Promise<DocumentSummary> {
    const service = this.client.getService<DocumentGrpcClient>('DocumentsService');
    return firstValueFrom(service.getDocumentById({ id }));
  }
}
```

Bad pattern:

```ts
@Injectable()
export class CreateWorkflowUseCase {
  constructor(@Inject(DOCUMENT_GRPC_CLIENT) private readonly client: ClientGrpc) {}
}
```

Why this is bad:

- The use case now depends on gRPC.
- Unit testing becomes transport-aware.
- A future transport change affects business code.
- Timeout, retry, metadata, and mapping logic leak into the use case.

For service-to-service calls, the remote service should still protect its own business rules. The caller should not assume it can bypass the remote service's use cases or write directly to the remote service's database.

## Folder Structure

Current high-level structure:

```text
src/
  app.module.ts
  main.ts
  common/
  config/
  infrastructure/
  modules/
    health/
    transmittals/
    workflows/
  shared/
```

### Module Structure

Recommended module structure:

```text
src/modules/<module-name>/
  <module-name>.module.ts
  domain/
    entities/
    exceptions/
    value-objects/
  application/
    dto/
      inputs/
      outputs/
    use-cases/
  ports/
    in/
    out/
  adapters/
    in/
      grpc/
      http/
      events/
    out/
      persistence/
      messaging/
      external-services/
```

### Directory Responsibilities

| Directory | Responsibility |
| --- | --- |
| `domain/entities` | Business entities and invariants. |
| `domain/exceptions` | Domain-specific errors. |
| `application/use-cases` | Application workflows and orchestration. |
| `application/dto/inputs` | Input shapes accepted by use cases. |
| `application/dto/outputs` | Output shapes returned by use cases. |
| `ports/in` | Contracts for calling application behavior. |
| `ports/out` | Contracts for persistence, messaging, and external systems. |
| `adapters/in` | Controllers, event handlers, scheduled jobs, or other entry points. |
| `adapters/out` | Concrete persistence, messaging, and integration implementations. |
| `infrastructure` | Shared technical implementations such as Prisma, Kafka, cache, Vault, lifecycle. |
| `common` | Cross-cutting base contracts, filters, exceptions, middleware, guards. |
| `shared` | Shared simple types, constants, enums, and utilities. |
| `config` | Environment validation, Vault, Kafka, gRPC, lifecycle config. |

### Path Aliases

This project uses readable TypeScript path aliases.

| Alias | Points To | Example |
| --- | --- | --- |
| `@modules/*` | `src/modules/*` | `@modules/transmittals/domain/entities/transmittal.entity` |
| `@infra/*` | `src/infrastructure/*` | `@infra/database/prisma/prisma.service` |
| `@common/*` | `src/common/*` | `@common/exceptions/application.exception` |
| `@shared/*` | `src/shared/*` | `@shared/enums/exception-type.enum` |
| `@config/*` | `src/config/*` | `@config/kafka/kafka.config` |

Use aliases when crossing major boundaries. Relative imports are still acceptable for very local files such as DTOs in the same folder group.

## Naming Conventions

Naming must make ownership and layer responsibility obvious. A developer should be able to look at a file name or class name and understand whether it is a domain object, use case, port, adapter, DTO, controller, or infrastructure component.

### Directory Names

| Item | Convention | Example |
| --- | --- | --- |
| Business module folder | Plural, kebab-case | `transmittals`, `workflows`, `approval-requests` |
| Layer folders | Lowercase, stable names | `domain`, `application`, `ports`, `adapters` |
| Adapter direction folders | Lowercase | `in`, `out` |
| Adapter technology folders | Lowercase/kebab-case | `grpc`, `http`, `persistence`, `external-services` |
| DTO folders | Plural lowercase | `inputs`, `outputs`, `requests`, `responses` |

Good:

```text
src/modules/transmittals/application/use-cases/create-transmittal.use-case.ts
```

Avoid:

```text
src/modules/transmittals/services/create.ts
src/modules/transmittals/business/TransmittalLogic.ts
```

### File Names

Use kebab-case file names with a suffix that identifies responsibility.

| Responsibility | File Pattern | Example |
| --- | --- | --- |
| Nest module | `<module>.module.ts` | `transmittals.module.ts` |
| Domain entity | `<entity>.entity.ts` | `transmittal.entity.ts` |
| Domain exception | `<entity>-domain.exception.ts` | `transmittal-domain.exception.ts` |
| Use case | `<action>-<entity>.use-case.ts` | `create-transmittal.use-case.ts` |
| Inbound port | `<action>-<entity>.port.ts` | `create-transmittal.port.ts` |
| Outbound port | `<resource>.repository.port.ts` or `<capability>.port.ts` | `transmittal.repository.port.ts`, `email-message-publisher.port.ts` |
| Adapter | `<technology>-<capability>.adapter.ts` or `<technology>-<entity>.repository.adapter.ts` | `kafka-email-message-publisher.adapter.ts`, `prisma-transmittal.repository.adapter.ts` |
| Controller | `<module>-<transport>.controller.ts` | `transmittals-grpc.controller.ts` |
| Input DTO | `<action>-<entity>.input.ts` | `create-transmittal.input.ts` |
| Output DTO | `<entity>.output.ts` or `<action>-<entity>.output.ts` | `transmittal.output.ts`, `create-transmittal.output.ts` |
| gRPC request DTO | `<action>-<entity>-grpc.request.ts` | `create-transmittal-grpc.request.ts` |
| Test file | Same subject plus `.spec.ts` | `update-workflow-status.use-case.spec.ts` |

### Class And Interface Names

| Type | Convention | Example |
| --- | --- | --- |
| Domain entity class | PascalCase noun | `Transmittal`, `Workflow` |
| Use case class | PascalCase action + `UseCase` | `CreateTransmittalUseCase` |
| Inbound port interface | PascalCase action + `Port` | `CreateTransmittalPort` |
| Outbound repository port interface | PascalCase resource + `RepositoryPort` | `TransmittalRepositoryPort` |
| Other outbound port interface | PascalCase capability + `Port` | `EmailMessagePublisherPort` |
| Adapter class | PascalCase technology + capability + `Adapter` | `KafkaEmailMessagePublisherAdapter` |
| Repository adapter class | PascalCase technology + entity + `RepositoryAdapter` | `PrismaTransmittalRepositoryAdapter` |
| Controller class | PascalCase module + transport + `Controller` | `TransmittalsGrpcController` |
| Exception class | PascalCase context + `Exception` | `TransmittalDomainException` |
| Input type/class | PascalCase action + `Input` | `CreateTransmittalInput` |
| Output type/class | PascalCase action/entity + `Output` | `CreateTransmittalOutput`, `WorkflowOutput` |

### Injection Token Names

Use uppercase snake case for symbol tokens.

Good:

```ts
export const TRANSMITTAL_REPOSITORY_PORT = Symbol('TRANSMITTAL_REPOSITORY_PORT');
export const EMAIL_MESSAGE_PUBLISHER_PORT = Symbol('EMAIL_MESSAGE_PUBLISHER_PORT');
```

Avoid:

```ts
export const transmittalRepo = 'repo';
export const EmailPublisher = 'EmailPublisher';
```

Why uppercase symbol tokens are preferred:

- They are easy to identify in constructors.
- They reduce accidental string token collisions.
- They align with the idea that tokens represent architectural boundaries.

### Use Case Names

Use case names should describe business intent, not technical implementation.

Good:

```text
CreateTransmittalUseCase
UpdateWorkflowStatusUseCase
ListWorkflowsUseCase
```

Avoid:

```text
InsertTransmittalIntoDatabaseService
CallKafkaAndSaveWorkflowService
```

### Adapter Names

Adapter names should reveal both the technology and the port/capability being implemented.

Good:

```text
PrismaTransmittalRepositoryAdapter
KafkaEmailMessagePublisherAdapter
NoopEmailMessagePublisherAdapter
GrpcDocumentServiceAdapter
```

Avoid:

```text
TransmittalService
DatabaseService
KafkaHelper
ExternalCaller
```

### Proto And gRPC Names

Use stable service and RPC names because they become contracts between processes.

| Item | Convention | Example |
| --- | --- | --- |
| Proto file | Singular business area or module name | `transmittal.proto`, `workflow.proto` |
| Proto package | Lowercase module name | `transmittal`, `workflow` |
| gRPC service | PascalCase plural + `Service` | `TransmittalsService`, `WorkflowsService` |
| RPC method | PascalCase action | `CreateTransmittal`, `GetTransmittalById` |
| TypeScript method proxy | lowerCamelCase | `createTransmittal`, `getTransmittalById` |

### Naming Review Checklist

- [ ] Does the name reveal the architectural layer?
- [ ] Does the name reveal the business capability?
- [ ] Does the adapter name reveal the technology?
- [ ] Does the port name avoid technology-specific wording unless the business capability is technology-specific?
- [ ] Is the token uppercase and unique?
- [ ] Is the use case named by business action?
- [ ] Are DTO names specific to input/output/request/response responsibility?

## Component Responsibilities

### Domain Entity

Example: `src/modules/transmittals/domain/entities/transmittal.entity.ts`

Domain entities should:

- Represent business concepts.
- Protect invariants.
- Avoid framework decorators.
- Avoid Prisma types.
- Avoid transport DTOs.
- Avoid direct IO.

Good example:

```ts
export class Transmittal {
  static create(params: CreateParams): Transmittal {
    if (!params.projectId?.trim()) {
      throw new TransmittalDomainException('Project id is required', 'PROJECT_ID_REQUIRED');
    }

    return new Transmittal(/* fields */);
  }
}
```

Bad example:

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma/prisma.service';

@Injectable()
export class Transmittal {
  constructor(private readonly prisma: PrismaService) {}
}
```

Why this is bad:

- The domain entity now depends on NestJS and Prisma.
- It cannot be tested as a pure business object.
- Persistence concerns have leaked into the business model.

### Use Case

Example: `src/modules/transmittals/application/use-cases/create-transmittal.use-case.ts`

Use cases should:

- Coordinate one application operation.
- Use domain entities for business behavior.
- Depend on outbound ports for side effects.
- Return application output DTOs.
- Remain independent from controllers and concrete infrastructure.

Good example:

```ts
@Injectable()
export class CreateTransmittalUseCase {
  constructor(
    @Inject(TRANSMITTAL_REPOSITORY_PORT)
    private readonly transmittalRepository: TransmittalRepositoryPort,
  ) {}

  async execute(input: CreateTransmittalInput): Promise<CreateTransmittalOutput> {
    const transmittal = Transmittal.create(input);
    const created = await this.transmittalRepository.create(transmittal);

    return {
      id: created.id,
      transmittalNumber: created.transmittalNumber,
      status: created.status,
      createdAt: created.createdAt.toISOString(),
    };
  }
}
```

Bad example:

```ts
@Injectable()
export class CreateTransmittalUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateTransmittalInput) {
    return this.prisma.transmittal.create({ data: input });
  }
}
```

Why this is bad:

- The use case is tied to Prisma.
- Business rules may become persistence-driven.
- Unit tests need database knowledge.
- Replacing persistence becomes expensive.

### Inbound Port

Inbound ports define how the application can be called. They are useful when another module needs to call a use case without knowing its concrete implementation.

Example:

```ts
export interface CreateTransmittalPort {
  execute(input: CreateTransmittalInput): Promise<CreateTransmittalOutput>;
}
```

### Outbound Port

Outbound ports define what the use case needs from outside the application core.

Example:

```ts
export const TRANSMITTAL_REPOSITORY_PORT = Symbol('TRANSMITTAL_REPOSITORY_PORT');

export interface TransmittalRepositoryPort {
  create(entity: Transmittal): Promise<Transmittal>;
  existByProjectAndSubject(projectId: string, subject: string): Promise<boolean>;
}
```

### Inbound Adapter

Inbound adapters receive external input and call application use cases. Examples:

- gRPC controller.
- HTTP controller.
- Message consumer.
- Scheduled job.
- CLI command.

Inbound adapters should:

- Parse transport input.
- Apply transport-level decorators.
- Call use cases.
- Map use-case output to transport response if needed.
- Avoid business rules.
- Avoid direct database calls.

### Outbound Adapter

Outbound adapters implement outbound ports.

Example:

```ts
@Injectable()
export class PrismaTransmittalRepositoryAdapter implements TransmittalRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: Transmittal): Promise<Transmittal> {
    const row = await this.prisma.transmittal.create({
      data: this.toPersistence(entity),
    });

    return this.toDomain(row);
  }
}
```

Outbound adapters should contain technical mapping logic. They should not decide high-level business workflows.

### Nest Module

Nest modules are the composition layer. They bind ports to implementations.

Example:

```ts
@Module({
  imports: [PrismaModule],
  controllers: [TransmittalsGrpcController],
  providers: [
    CreateTransmittalUseCase,
    {
      provide: TRANSMITTAL_REPOSITORY_PORT,
      useClass: PrismaTransmittalRepositoryAdapter,
    },
    {
      provide: CREATE_TRANSMITTAL_PORT,
      useExisting: CreateTransmittalUseCase,
    },
  ],
  exports: [CREATE_TRANSMITTAL_PORT],
})
export class TransmittalsModule {}
```

The module answers the question:

> At runtime, which concrete adapter should satisfy this port?

## Dependency Inversion In This Project

Dependency inversion means high-level business logic does not depend on low-level technical details. Both depend on abstractions.

In this service:

- Use cases depend on repository and messaging ports.
- Prisma repository adapters implement repository ports.
- Kafka/noop messaging adapters implement messaging ports.
- Nest modules bind the ports to adapters.

### Correct Direction

```text
CreateTransmittalUseCase
  -> TransmittalRepositoryPort
  <- PrismaTransmittalRepositoryAdapter
```

The use case knows the port. The adapter knows the port. The use case does not know the adapter.

### Incorrect Direction

```text
CreateTransmittalUseCase
  -> PrismaTransmittalRepositoryAdapter
  -> PrismaService
```

This makes the use case infrastructure-aware.

### Symbol Tokens

TypeScript interfaces do not exist at runtime, so Nest cannot inject an interface directly. This project uses symbols as runtime injection tokens.

Example:

```ts
export const EMAIL_MESSAGE_PUBLISHER_PORT = Symbol('EMAIL_MESSAGE_PUBLISHER_PORT');
```

Then a use case injects the token:

```ts
constructor(
  @Inject(EMAIL_MESSAGE_PUBLISHER_PORT)
  private readonly emailMessagePublisher: EmailMessagePublisherPort,
) {}
```

And a module/provider binds the token to an implementation.

## Step-By-Step Guide: Adding A New Feature Module

Use this process when adding a new business capability.

### 1. Identify The Business Capability

Ask:

- What business action is being performed?
- What aggregate or entity owns the rules?
- What input is needed?
- What output should be returned?
- What external systems are needed?
- What should happen if an external system fails?

Example capability:

```text
Create approval request
```

Potential module:

```text
src/modules/approvals
```

### 2. Create The Module Skeleton

```text
src/modules/approvals/
  approvals.module.ts
  domain/
    entities/
    exceptions/
  application/
    dto/
      inputs/
      outputs/
    use-cases/
  ports/
    in/
    out/
  adapters/
    in/
    out/
```

### 3. Create The Domain Entity

Put rules that are always true for the business concept inside the entity.

```ts
export class ApprovalRequest {
  static create(params: CreateApprovalParams): ApprovalRequest {
    if (!params.requestedBy?.trim()) {
      throw new ApprovalDomainException('Requester is required', 'REQUESTER_REQUIRED');
    }

    return new ApprovalRequest(/* fields */);
  }
}
```

Avoid:

- Prisma calls.
- NestJS decorators.
- HTTP/gRPC request DTOs.
- Kafka publishing.

### 4. Create Inbound Port

```ts
export const CREATE_APPROVAL_PORT = Symbol('CREATE_APPROVAL_PORT');

export interface CreateApprovalPort {
  execute(input: CreateApprovalInput): Promise<CreateApprovalOutput>;
}
```

Use inbound ports when:

- Another module needs to call this use case.
- You want to hide the concrete use-case class.
- You need a stable internal contract.

### 5. Create Outbound Ports

Example repository port:

```ts
export const APPROVAL_REPOSITORY_PORT = Symbol('APPROVAL_REPOSITORY_PORT');

export interface ApprovalRepositoryPort {
  create(entity: ApprovalRequest): Promise<ApprovalRequest>;
  findById(id: string): Promise<ApprovalRequest | null>;
}
```

Create a port when the application needs something external:

- Database.
- Message broker.
- Email service.
- File storage.
- External API.
- Clock or ID generator when deterministic testing is required.

### 6. Create Input And Output DTOs

Input DTOs should represent use-case input, not necessarily transport request shapes.

```ts
export type CreateApprovalInput = {
  projectId: string;
  requestedBy: string;
  approverIds: string[];
};
```

Output DTOs should be stable and intentional.

```ts
export type CreateApprovalOutput = {
  id: string;
  status: string;
  createdAt: string;
};
```

### 7. Implement The Use Case

```ts
@Injectable()
export class CreateApprovalUseCase implements CreateApprovalPort {
  constructor(
    @Inject(APPROVAL_REPOSITORY_PORT)
    private readonly approvalRepository: ApprovalRepositoryPort,
  ) {}

  async execute(input: CreateApprovalInput): Promise<CreateApprovalOutput> {
    const approval = ApprovalRequest.create(input);
    const created = await this.approvalRepository.create(approval);

    return {
      id: created.id,
      status: created.status,
      createdAt: created.createdAt.toISOString(),
    };
  }
}
```

### 8. Implement Inbound Adapter

For gRPC:

```ts
@Controller()
export class ApprovalsGrpcController {
  constructor(private readonly createApproval: CreateApprovalUseCase) {}

  @GrpcMethod('ApprovalsService', 'CreateApproval')
  create(request: CreateApprovalGrpcRequestDto) {
    return this.createApproval.execute(request);
  }
}
```

Keep controller logic thin. If mapping becomes complex, create a mapper.

### 9. Implement Outbound Adapter

```ts
@Injectable()
export class PrismaApprovalRepositoryAdapter implements ApprovalRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: ApprovalRequest): Promise<ApprovalRequest> {
    const row = await this.prisma.approval.create({
      data: this.toPersistence(entity),
    });

    return this.toDomain(row);
  }

  private toDomain(row: ApprovalPersistence): ApprovalRequest {
    return new ApprovalRequest(/* mapped fields */);
  }

  private toPersistence(entity: ApprovalRequest): Record<string, unknown> {
    return { /* mapped fields */ };
  }
}
```

### 10. Bind Providers In The Module

```ts
@Module({
  imports: [PrismaModule],
  controllers: [ApprovalsGrpcController],
  providers: [
    CreateApprovalUseCase,
    {
      provide: APPROVAL_REPOSITORY_PORT,
      useClass: PrismaApprovalRepositoryAdapter,
    },
    {
      provide: CREATE_APPROVAL_PORT,
      useExisting: CreateApprovalUseCase,
    },
  ],
  exports: [CREATE_APPROVAL_PORT],
})
export class ApprovalsModule {}
```

### 11. Add Tests

Recommended minimum:

- Domain entity tests for invariants.
- Use-case tests with mocked repository/messaging ports.
- Adapter tests for persistence mapping.
- Controller/e2e tests for transport behavior.

### 12. Review Before Merge

Use the checklist in the appendix before merging.

## Best Practices

### Keep Domain Pure

Domain code should not import from:

- `@nestjs/*`
- `@infra/*`
- Prisma generated client
- Kafka client
- HTTP/gRPC transport DTOs

### Keep Use Cases Focused

Use cases should orchestrate:

- Validation that belongs to the application workflow.
- Domain entity creation or mutation.
- Port calls.
- Output mapping.

Use cases should not:

- Contain raw Prisma queries.
- Know Kafka client details.
- Return database rows directly.
- Accept controller-specific DTOs if the transport model is unstable.

### Keep Controllers Thin

Controllers should:

- Receive transport input.
- Call use cases.
- Return mapped output.

Controllers should not:

- Execute business rules.
- Call Prisma directly.
- Publish messages directly.
- Contain transaction orchestration unless there is a very specific transport reason.

### Map Between Persistence And Domain

Persistence records and domain entities are not the same thing.

Good:

```ts
private toDomain(row: TransmittalPersistence): Transmittal {
  return new Transmittal(
    row.id,
    row.transmittalNumber,
    row.projectId,
    row.subject,
    this.toStringArray(row.documentIds),
    this.toStringArray(row.recipientIds),
    row.status as TransmittalStatus,
    row.dueDate,
    row.remarks,
    row.createdBy,
    row.createdAt,
  );
}
```

Bad:

```ts
return row as unknown as Transmittal;
```

### Use Ports For Meaningful Boundaries

Create a port when:

- The dependency is external.
- The dependency is likely to change.
- You need to mock it in tests.
- It represents a boundary between modules.
- It protects the core from infrastructure.

Avoid creating ports for every tiny helper function. Too many abstractions can make the code harder to read.

### Use Path Aliases Responsibly

Good:

```ts
import { PrismaService } from '@infra/database/prisma/prisma.service';
import { Transmittal } from '@modules/transmittals/domain/entities/transmittal.entity';
```

Also acceptable for local files:

```ts
import { CreateTransmittalInput } from '../dto/inputs/create-transmittal.input';
```

Avoid:

```ts
import { PrismaService } from '../../../../../../infrastructure/database/prisma/prisma.service';
```

## Bad Practices And Anti-Patterns

### Anti-Pattern: Controller Talks Directly To Prisma

Bad:

```ts
@Controller()
export class TransmittalsController {
  constructor(private readonly prisma: PrismaService) {}

  create(request: CreateTransmittalRequest) {
    return this.prisma.transmittal.create({ data: request });
  }
}
```

Better:

```ts
@Controller()
export class TransmittalsController {
  constructor(private readonly createTransmittal: CreateTransmittalUseCase) {}

  create(request: CreateTransmittalRequest) {
    return this.createTransmittal.execute(request);
  }
}
```

### Anti-Pattern: Domain Imports Infrastructure

Bad:

```ts
import { ClientKafka } from '@nestjs/microservices';

export class Transmittal {
  publish(client: ClientKafka) {
    client.emit('email.send', this);
  }
}
```

Better:

```ts
export class Transmittal {
  markIssued(): Transmittal {
    return new Transmittal(/* changed state */);
  }
}
```

Then the use case decides whether to publish through an outbound port.

### Anti-Pattern: Shared Folder Becomes A Dumping Ground

Bad:

```text
shared/
  workflow.service.ts
  transmittal-business-rules.ts
  prisma-transmittal-helper.ts
  email-sender.ts
```

Better:

```text
modules/transmittals/
  domain/
  application/
  ports/
  adapters/
```

Use `shared` for simple, low-risk primitives only.

### Anti-Pattern: Reusing DTOs As Domain Entities

Bad:

```ts
export class Transmittal extends CreateTransmittalRequestDto {}
```

Better:

```ts
export type CreateTransmittalInput = {
  projectId: string;
  subject: string;
  documentIds: string[];
  recipientIds: string[];
  createdBy: string;
};

export class Transmittal {
  static create(input: CreateTransmittalInput): Transmittal {
    // domain rules
  }
}
```

### Anti-Pattern: Base Repository Hides Business Queries

A base repository can reduce duplication, but it must not hide important business behavior.

Bad:

```ts
await this.genericRepository.findByDynamicString('project subject active latest');
```

Better:

```ts
await this.transmittalRepository.existByProjectAndSubject(projectId, subject);
```

Business-specific queries should be explicit in module-specific repository ports.

## Testing Strategy

### Domain Tests

Domain tests should not boot NestJS.

Test:

- Required fields.
- State transitions.
- Business invariants.
- Domain exceptions.

Example:

```ts
expect(() =>
  Transmittal.create({
    projectId: '',
    subject: 'Submittal',
    documentIds: ['DOC-1'],
    recipientIds: ['user@example.com'],
    createdBy: 'user-1',
  }),
).toThrow(TransmittalDomainException);
```

### Use Case Tests

Use mocked ports.

Test:

- Application validations.
- Repository calls.
- Messaging calls.
- Error handling.
- Output mapping.

Use-case tests should not require:

- Real database.
- Real Kafka.
- Real gRPC server.
- Real HTTP server.

### Adapter Tests

Adapter tests may use real infrastructure or test containers depending on project maturity.

Test:

- Prisma query behavior.
- Mapping from persistence to domain.
- Mapping from domain to persistence.
- Unique constraints.
- Transaction behavior.
- Messaging serialization.

### E2E Tests

E2E tests should validate:

- Transport wiring.
- Module composition.
- Global filters/pipes.
- Request/response behavior.
- Integration between adapters and use cases.

### Test Ownership Matrix

| Layer | Test Type | Infrastructure Required |
| --- | --- | --- |
| Domain | Unit | No |
| Use case | Unit | No, mock ports |
| Repository adapter | Integration | Usually yes |
| Messaging adapter | Integration/contract | Usually yes or broker mock |
| Controller | E2E or integration | Nest app context |
| Full service | E2E | Database and transport dependencies |

## Production Readiness Checklist

Before using this boilerplate for production, review the following.

### Architecture And Code

- [ ] Remove unused example files.
- [ ] Confirm module boundaries match the real business domain.
- [ ] Review all global modules.
- [ ] Remove POC shortcuts.
- [ ] Confirm ports are meaningful and not excessive.
- [ ] Confirm adapters do not contain business workflows.
- [ ] Confirm domain entities do not depend on infrastructure.
- [ ] Confirm path aliases are configured for build, tests, and IDE.

### Database

- [ ] Review Prisma schema for production naming, indexes, relations, and constraints.
- [ ] Add migration strategy.
- [ ] Define transaction boundaries.
- [ ] Define soft delete policy.
- [ ] Define audit fields.
- [ ] Define retention policy.
- [ ] Review base repository usage.

### Messaging

- [ ] Define topic names and ownership.
- [ ] Define message schema and versioning.
- [ ] Define retry strategy.
- [ ] Define idempotency strategy.
- [ ] Define dead-letter handling.
- [ ] Define observability for published/failed messages.
- [ ] Decide whether message publishing must be transactional with database changes.

### Service Communication

- [ ] Confirm that gateway responsibilities are limited to routing, auth, request enrichment, aggregation, and edge concerns.
- [ ] Confirm that service business rules are implemented inside the owning service.
- [ ] Version gRPC contracts intentionally.
- [ ] Define compatibility rules for `.proto` changes.
- [ ] Define timeout behavior for service-to-service calls.
- [ ] Define retry behavior for safe operations only.
- [ ] Define idempotency behavior for commands.
- [ ] Define metadata propagation rules, such as correlation ID and user identity.
- [ ] Ensure service-to-service clients are hidden behind outbound ports.
- [ ] Add contract tests for important service-to-service calls.

### Security

- [ ] Validate configuration at startup.
- [ ] Keep secrets out of repository.
- [ ] Review Vault integration.
- [ ] Review logging for sensitive data.
- [ ] Add authentication/authorization where required.
- [ ] Review transport security.
- [ ] Review dependency vulnerabilities.

### Observability

- [ ] Add structured logging policy.
- [ ] Add correlation/request IDs.
- [ ] Add metrics for use cases and adapters.
- [ ] Add tracing for external calls.
- [ ] Add health checks for database, broker, and dependent services.

### Reliability

- [ ] Define timeout policy.
- [ ] Define retry policy.
- [ ] Define circuit breaker policy if needed.
- [ ] Define graceful shutdown behavior.
- [ ] Define startup dependency checks.
- [ ] Define backpressure behavior for messaging.

### Documentation

- [ ] Assign document owner.
- [ ] Add architecture decision records.
- [ ] Document module-specific behavior.
- [ ] Document environment variables.
- [ ] Document deployment process.
- [ ] Document rollback process.
- [ ] Keep change history updated.

## ISO-Friendly Maintenance And Governance

This section is intended to support controlled engineering practice. It does not replace the organization's quality management system.

### Document Ownership

Every production project should assign:

- Document owner.
- Technical owner.
- Review approver.
- Maintenance schedule.
- Location of approved document copy.

### Review Cadence

Review this document:

- Before using the boilerplate for a new project.
- Before production release.
- When changing architectural boundaries.
- When changing dependency injection patterns.
- When replacing infrastructure adapters.
- At least once per major release.

### Traceability

For maintainability and audit readiness, each feature should be traceable.

| Trace Item | Example |
| --- | --- |
| Requirement | Create transmittal |
| Use case | `CreateTransmittalUseCase` |
| Inbound adapter | `TransmittalsGrpcController` |
| Inbound port | `CreateTransmittalPort` |
| Outbound port | `TransmittalRepositoryPort` |
| Outbound adapter | `PrismaTransmittalRepositoryAdapter` |
| Domain entity | `Transmittal` |
| Tests | Use-case spec, entity spec, adapter integration test |
| Operational dependency | PostgreSQL, Kafka |

### Architecture Decision Records

Use ADRs for important decisions:

- Why Hexagonal Architecture was selected.
- Why Prisma was selected.
- Why Kafka was selected.
- Why gRPC was selected.
- Why a base repository is or is not used.
- Why a module exports an inbound port.
- Why an adapter is shared or module-specific.

Recommended ADR format:

```text
Title:
Status:
Date:
Context:
Decision:
Consequences:
Alternatives considered:
Links:
```

### Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Overengineering small services | Slower delivery | Use ports only for meaningful boundaries. |
| Business logic leaking into adapters | Harder testing and maintenance | Enforce review checklist. |
| Shared folder grows uncontrolled | Hidden coupling | Keep business logic inside modules. |
| Base repository hides domain-specific behavior | Confusing data access | Keep business queries explicit in ports. |
| Messaging failures after database commit | Lost side effects | Consider outbox pattern or retry strategy. |
| Incorrect DI binding | Runtime failures | Add module wiring tests or smoke tests. |
| POC copied directly to production | Reliability and compliance gaps | Use production readiness checklist. |

### Evidence Expectations

For controlled environments, keep evidence of:

- Architecture review approval.
- Test results.
- Security review.
- Dependency review.
- Environment/config validation.
- Migration review.
- Release approval.
- Production readiness checklist completion.

## Pros And Cons

### Pros

- Business logic is easier to find.
- Use cases are easier to unit test.
- Infrastructure can be replaced with less impact on the core.
- Controllers stay small.
- Database and messaging details are isolated.
- Module boundaries are more explicit.
- Maintenance is easier for larger systems.
- Architecture reviews become more objective.

### Cons

- More files than default NestJS structure.
- More concepts for new developers.
- DI token wiring can feel verbose.
- Over-abstraction is possible.
- Initial feature development may be slower.
- Poor discipline can still produce coupling.
- Small CRUD services may not need the full structure.

### When To Use This Architecture

Use this architecture when:

- Business rules are important.
- The service will grow.
- Multiple external systems are involved.
- You need strong testability.
- You expect persistence or transport changes.
- Multiple developers will maintain the service.
- Auditability and traceability matter.

### When To Use A Simpler NestJS Structure

A simpler structure may be enough when:

- The service is small and mostly CRUD.
- There are few business rules.
- There is one database and one transport.
- The code is short-lived.
- The team does not need strict boundary enforcement.

Even then, the dependency rule is still useful.

## FAQ For Developers Coming From Default NestJS

### Why Not Put Everything In A Service?

NestJS services can become large classes that mix business rules, database calls, messaging, mapping, and transport assumptions. Use cases make application behavior explicit and focused.

### Why Ports?

Ports protect the application core from infrastructure. They also make tests easier because dependencies can be mocked through contracts.

### Why Adapters?

Adapters isolate technology-specific code. Prisma, Kafka, gRPC, Redis, and external APIs can change without forcing business rules to change.

### Where Does Validation Go?

Use multiple levels:

- Transport validation: request shape, required request fields, decorators.
- Application validation: workflow-level rules such as duplicate IDs or limits.
- Domain validation: invariants that must always be true for the entity.
- Persistence validation: database constraints and indexes.

Do not rely on only one layer for all validation.

### Where Does Prisma Go?

Prisma belongs in infrastructure and outbound adapters. Use cases should depend on repository ports, not `PrismaService`.

### Where Does Kafka Go?

Kafka belongs in messaging infrastructure and outbound adapters. Use cases should depend on messaging ports, not `ClientKafka`.

### Where Should DTOs Live?

Use-case input/output DTOs live in `application/dto`. Transport-specific DTOs live under `adapters/in/<transport>/dto`.

### How Do I Avoid Overengineering?

Start with boundaries that protect real business or infrastructure changes. Do not create abstractions without a reason. If the abstraction does not improve testing, replaceability, clarity, or ownership, reconsider it.

### Should Business Logic Go In The Gateway?

No. In this architecture, the gateway is not the business owner. The gateway may authenticate, authorize, route, enrich, aggregate, and apply edge controls. Service-owned business rules must live inside the service that owns the domain.

If the gateway validates that a request is structurally malformed, that is acceptable. If the gateway decides whether a workflow status transition is valid, that is business logic and should move into the workflow service.

### How Should One Module Call Another Module?

Prefer calling an exported inbound port from the owning module. The caller should not reach directly into another module's repository, adapter, or domain internals.

Good:

```text
workflows
  -> WorkflowTransmittalPort
    -> adapter
      -> CREATE_TRANSMITTAL_PORT
        -> CreateTransmittalUseCase
```

Avoid:

```text
workflows
  -> PrismaTransmittalRepositoryAdapter
```

### How Should One Microservice Call Another Microservice?

Use an outbound port in the calling service and a gRPC client adapter in `adapters/out`. The use case should depend on the outbound port, not on `ClientGrpc`.

Good:

```text
Calling use case
  -> RemoteServicePort
    -> GrpcRemoteServiceAdapter
      -> remote service gRPC endpoint
```

This keeps transport details outside the use case and makes the caller testable without a real remote service.

## Glossary

| Term | Definition |
| --- | --- |
| Adapter | Concrete implementation that connects the application to a technology or external entry point. |
| Application layer | The layer containing use cases and orchestration logic. |
| Boundary | A line where one part of the system should not know implementation details of another part. |
| Dependency inversion | A design principle where high-level policy depends on abstractions, not low-level details. |
| Domain | The business model, business rules, and invariants. |
| DTO | Data Transfer Object. A data shape used to pass data between layers or across transport boundaries. |
| Entity | A domain object with identity and business behavior. |
| Gateway | External routing/auth boundary. It may call services, but should not own service business rules. |
| gRPC client adapter | Outbound adapter that implements a service port by calling another service through gRPC. |
| Hexagon | A conceptual shape representing the application core with many possible external adapters. |
| Inbound adapter | A controller, handler, or job that calls into the application. |
| Inbound port | A contract for invoking application behavior. |
| Infrastructure | Technical concerns such as database, messaging, cache, secrets, and external APIs. |
| Outbound adapter | A repository, publisher, client, or gateway implementing an outbound port. |
| Outbound port | A contract for something the application needs from outside. |
| Repository | A persistence-facing abstraction for loading and saving domain objects. |
| Service-to-service call | A direct call from one microservice to another, usually implemented through an outbound port and remote adapter. |
| Use case | An application operation that coordinates domain behavior and dependencies. |

## External References

These references provide background for the architecture and technologies used in this POC. They are reference material only; this project's local standards and review process remain authoritative for implementation decisions.

| Reference | Link | Relevance |
| --- | --- | --- |
| Alistair Cockburn, Hexagonal Architecture original article | https://alistair.cockburn.us/hexagonal-architecture | Primary background for ports and adapters architecture. |
| NestJS gRPC microservices documentation | https://docs.nestjs.com/microservices/grpc | Explains NestJS gRPC server/client support and `.proto` based service contracts. |
| NestJS custom providers documentation | https://docs.nestjs.com/fundamentals/custom-providers | Explains provider tokens, custom providers, and DI bindings used for ports. |
| NestJS dependency injection documentation | https://docs.nestjs.com/fundamentals/dependency-injection | Background for NestJS DI behavior. |
| NestJS Prisma recipe | https://docs.nestjs.com/recipes/prisma | Background for using Prisma in NestJS infrastructure. |
| Prisma documentation | https://www.prisma.io/docs | Reference for Prisma schema, client, migrations, and data access. |
| KafkaJS documentation | https://kafka.js.org/docs/getting-started | Reference for Kafka client behavior when using KafkaJS through NestJS microservices. |
| gRPC introduction | https://grpc.io/docs/what-is-grpc/introduction/ | Background for RPC contracts, protocol buffers, and service-to-service communication. |
| Martin Fowler, Inversion of Control Containers and the Dependency Injection Pattern | https://martinfowler.com/articles/injection.html | Background for dependency injection and inversion of control concepts. |
| ISO/IEC/IEEE 42010:2022 architecture description | https://www.iso.org/standard/74393.html | Reference for architecture description discipline. This document is ISO-friendly but does not claim conformance or certification. |
| ISO 9000 family quality management overview | https://www.iso.org/standards/popular/iso-9000-family | Background for quality-management terminology and document discipline. This document does not claim ISO 9001 certification. |

## Appendix A: Example Folder Tree

```text
src/
  modules/
    transmittals/
      transmittals.module.ts
      domain/
        entities/
          transmittal.entity.ts
        exceptions/
          transmittal-domain.exception.ts
      application/
        dto/
          inputs/
          outputs/
        use-cases/
          create-transmittal.use-case.ts
          get-transmittal-by-id.use-case.ts
      ports/
        in/
          create-transmittal.port.ts
        out/
          transmittal.repository.port.ts
      adapters/
        in/
          grpc/
            controllers/
            dto/
            proto/
        out/
          persistence/
            prisma-transmittal.repository.adapter.ts
```

## Appendix B: Module Creation Checklist

- [ ] Module name represents a business capability.
- [ ] Folder, file, class, token, port, adapter, and DTO names follow the naming conventions.
- [ ] Domain entity is free from NestJS, Prisma, Kafka, and transport dependencies.
- [ ] Domain exceptions are specific and meaningful.
- [ ] Use case has a single clear responsibility.
- [ ] Use case depends on ports for external effects.
- [ ] Inbound port exists if another module needs stable access.
- [ ] Outbound ports describe business needs, not technology details.
- [ ] Inbound adapter is thin.
- [ ] Outbound adapter maps persistence/external data to domain.
- [ ] Service-to-service calls, if any, are hidden behind outbound ports.
- [ ] Gateway logic, if any, does not duplicate service business rules.
- [ ] Nest module binds tokens to adapters.
- [ ] Tests cover domain and use-case behavior.
- [ ] Adapter behavior is tested where risk requires it.
- [ ] Documentation and ADRs are updated.

## Appendix C: Pull Request Checklist

- [ ] Does this change preserve the dependency rule?
- [ ] Is business logic in domain/use case rather than controller/adapter?
- [ ] Are new infrastructure dependencies hidden behind ports?
- [ ] Are DTOs not being reused as domain entities?
- [ ] Are mappings explicit?
- [ ] Are errors meaningful and consistent?
- [ ] Are tests added at the right level?
- [ ] Are module exports intentional?
- [ ] Are path aliases used consistently?
- [ ] Is the production impact understood?
- [ ] Is documentation updated if architecture changed?

## Appendix D: Architecture Review Checklist

| Review Area | Question |
| --- | --- |
| Domain | Are invariants located in domain entities/value objects? |
| Application | Are use cases focused and technology-independent? |
| Ports | Do ports represent meaningful boundaries? |
| Adapters | Are adapters free from high-level business workflow decisions? |
| Persistence | Is mapping explicit between Prisma records and domain entities? |
| Messaging | Are broker details hidden behind ports? |
| Naming | Do names reveal layer, responsibility, and ownership? |
| Gateway boundary | Is the gateway free from service-owned business rules? |
| Inter-module calls | Are module-to-module calls made through exported use cases or ports? |
| Service-to-service calls | Are remote calls hidden behind outbound ports and adapters? |
| Modules | Are provider bindings clear and intentional? |
| Testing | Can core behavior be tested without infrastructure? |
| Documentation | Are decisions and risks recorded? |
| Production | Are operational concerns reviewed before deployment? |

## Appendix E: Markdown To PDF Or DOCX Conversion

This document is written in Markdown so it can be converted using common tools.

### Using Pandoc

```bash
pandoc docs/hexagonal-architecture-nestjs.md -o docs/hexagonal-architecture-nestjs.pdf
pandoc docs/hexagonal-architecture-nestjs.md -o docs/hexagonal-architecture-nestjs.docx
```

### Using VS Code

Use a Markdown preview/export extension approved by the team. Confirm that:

- Tables render correctly.
- Code blocks remain readable.
- Checklists are preserved.
- Page breaks are acceptable.
- Document control table appears at the beginning.

### Controlled Document Note

For ISO-controlled use, export the approved version through the organization's controlled document process. Do not treat a local PDF export as approved evidence unless it follows that process.
