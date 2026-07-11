# Prompt: Service Hexagon Blueprint Reference Document

You are a senior software architect, senior NestJS engineer, technical writer, and ISO-friendly documentation reviewer. Create a detailed, developer-friendly, maintainable architecture document for a sample/boilerplate/proof-of-concept NestJS service that demonstrates Hexagonal Architecture, also known as Ports and Adapters Architecture.

Use the POC/reference name **Service Hexagon Blueprint**. Avoid generic titles such as "NestJS Hexagonal Architecture Reference Document" unless used only as a descriptive subtitle.

## Project Context

The project is a sample NestJS service named `nestjs-hexagonal-service`. It is not intended for direct copy-paste reuse of every module, business rule, naming choice, or implementation detail. It is a reference project and starter boilerplate. Future teams may use the architecture idea, folder structure, dependency direction, and patterns as a starting point for production systems after project-specific cleanup, hardening, review, and refactoring.

The codebase includes examples such as:

- `src/modules/transmittals`
- `src/modules/workflows`
- `src/infrastructure/database/prisma`
- `src/infrastructure/messaging`
- `src/common`
- `src/config`
- `src/shared`

Important example files include:

- Domain entity: `src/modules/transmittals/domain/entities/transmittal.entity.ts`
- Use case: `src/modules/transmittals/application/use-cases/create-transmittal.use-case.ts`
- Inbound port: `src/modules/transmittals/ports/in/create-transmittal.port.ts`
- Outbound port: `src/modules/transmittals/ports/out/transmittal.repository.port.ts`
- Prisma adapter: `src/modules/transmittals/adapters/out/persistence/prisma-transmittal.repository.adapter.ts`
- Base repository port: `src/common/ports/base-repository.port.ts`
- Base Prisma repository: `src/infrastructure/database/prisma/repositories/base-prisma.repository.ts`
- Kafka publisher port: `src/infrastructure/messaging/ports/email-message-publisher.port.ts`
- Kafka/noop messaging adapters under `src/infrastructure/messaging/adapters`
- Nest module composition in `src/app.module.ts`, `src/modules/transmittals/transmittals.module.ts`, and `src/modules/workflows/workflows.module.ts`

The service uses NestJS, TypeScript, Prisma, Kafka messaging, gRPC controllers, Jest, Biome, Docker, and environment/config validation.

The target architecture focus is the service/microservice layer. A gateway may call a microservice through gRPC, but the gateway is treated as an external caller and routing/auth boundary only. Do not design the gateway as a business-logic layer in this document. The document should focus on how each service owns its business rules, use cases, ports, and adapters.

When discussing infrastructure, do not make the architecture sound limited to only framework, database, and messaging. Treat infrastructure broadly: framework/runtime, transport, persistence, messaging, cache such as Redis, file/object storage, search indexes, external APIs, remote microservice clients, observability, configuration, secrets, schedulers, queues, and any other technical mechanism outside the application core. Prisma, Kafka, Redis, and gRPC are examples, not the complete list.

## Required Output

Write a complete Markdown document that can be converted cleanly to PDF or DOCX. Use professional, audit-friendly language. The document must be detailed enough that a developer with NestJS default-folder-structure experience, but little or no prior experience with Hexagonal Architecture, Clean Architecture, OOP design, or dependency inversion, can understand and implement a similar architecture without needing additional assistance.

The document must be suitable for future maintenance reference and ISO-style documentation review. Do not claim formal ISO certification. Instead, use ISO-friendly documentation discipline: document control, scope, purpose, assumptions, responsibilities, traceability, review checklist, change-control guidance, risk notes, maintainability rules, testing expectations, and operational considerations.

## Tone And Style

- Clear, precise, practical, and developer-friendly.
- Avoid buzzword-only explanations.
- Explain why each rule exists, not only what the rule is.
- Use examples from the project where helpful.
- Include both correct and incorrect examples.
- Be honest that this is a POC/starter and requires production cleanup.
- Use stable headings, tables, checklists, and code blocks.
- Keep code snippets short and focused.
- Use Markdown only.

## Document Structure

Create the document with at least these sections:

1. Document Control
   - Title
   - Version
   - Status
   - Owner placeholder
   - Review cycle
   - Last updated placeholder
   - Intended audience
   - Related repositories/documents
   - Change history table

2. Executive Summary
   - What this project demonstrates
   - Why this architecture was chosen
   - What can and cannot be reused
   - How this document should be used

3. Goals And Non-Goals
   - Maintainability
   - Testability
   - Infrastructure independence, including framework/runtime, transport, persistence, messaging, cache, external APIs, and remote service clients
   - Clear business boundaries
   - Production starter after cleanup
   - Non-goals such as universal shared business modules, complete enterprise platform, or final production design

4. Prerequisites For Developers
   - NestJS modules/providers/DI
   - TypeScript interfaces/types/classes
   - Basic OOP
   - SOLID principles
   - Dependency inversion
   - DTOs vs domain entities
   - Persistence mapping
   - Testing basics
   - Common mistakes for developers coming from default NestJS folder structure

5. Core Philosophy
   - Hexagon/application core
   - Ports
   - Adapters
   - Inbound vs outbound sides
   - Dependency rule
   - Infrastructure as detail, with framework, persistence, messaging, cache, external APIs, and remote service calls as examples
   - Business rules at the center
   - Explicit mapping between layers

6. Architecture Overview
   - Mermaid diagrams. Do not rely only on plain text arrows.
   - Include visual image-style diagrams similar to architecture documentation figures, not only code blocks. If generating HTML, include inline SVG or image assets for at least:
     - Abstraction dependency: use case depends on abstract port; concrete adapter implements the port.
     - Driving side / driven side hexagon: inbound adapters and ports on the driving side, outbound ports and infrastructure adapters on the driven side.
   - Request flow example
   - Dependency flow
   - Runtime call flow
   - Compile-time dependency flow
   - Include a high-level Mermaid flowchart for the service hexagon
   - Include a Mermaid sequence diagram for at least one request flow
   - Include a Mermaid diagram for dependency inversion
   - Include cache/Redis as one possible infrastructure adapter example, while making clear it is optional and not always needed
   - Clarify that a gateway, when present, is outside the service hexagon and should not hold business logic
   - Clarify that services are the main architectural units being documented

7. Folder Structure
   - Explain `src/modules/<module-name>/domain`
   - Explain `application`
   - Explain `ports/in`
   - Explain `ports/out`
   - Explain `adapters/in`
   - Explain `adapters/out`
   - Explain `infrastructure`
   - Explain `common`
   - Explain `shared`
   - Explain `config`
   - Explain path aliases such as `@modules`, `@infra`, `@common`, `@shared`, `@config`
   - Include a recommended structure for adding a new module

8. Naming Conventions
   - Folder names
   - File names
   - Class names
   - Interface names
   - Symbol injection tokens
   - Use case names
   - Port names
   - Adapter names
   - DTO names
   - Entity names
   - Exception names
   - Test file names
   - gRPC/proto names
   - Module names
   - Path alias usage
   - Include examples from this codebase and recommended names for new modules

9. Component Responsibilities
   - Domain entities
   - Domain exceptions
   - Use cases
   - Input DTOs
   - Output DTOs
   - Inbound ports
   - Outbound ports
   - Controllers
   - Repository adapters
   - Database repository abstraction using:
     - generic `BaseRepositoryPort`
     - module-specific repository ports
     - abstract `BasePrismaRepository`
     - concrete module repository adapters
     - abstract/protected methods such as `toDomain` and `toPersistence`
     - protected shared helper methods such as `existsByWhere`, `findFirstByWhere`, pagination helpers, and soft-delete handling where applicable
   - Messaging adapters
   - Cache adapters, such as Redis, when needed
   - External service adapters
   - Nest modules
   - Prisma service and repositories
   - Configuration and lifecycle services

10. Dependency Inversion In This Project
   - Explain dependency inversion with a Mermaid diagram and why it is important here.
   - Include an image-style abstraction dependency diagram.
   - Explain how use cases depend on interfaces/tokens, not Prisma/Kafka directly
   - Explain that this also applies to Redis/cache, file storage, external APIs, and service-to-service clients
   - Explain Nest provider binding
   - Explain symbol tokens
   - Show a short correct example
   - Show a short incorrect example

11. Communication Scenarios
    Include detailed examples with flow diagrams, responsibilities, where code should live, and bad-practice warnings for these scenarios:
    - Scenario 1: Gateway to microservice over gRPC normal flow. Treat the gateway as external to this service architecture. The gateway may handle routing, authentication, authorization, request enrichment, or aggregation, but should not own service business rules. The microservice gRPC controller is an inbound adapter that calls a use case.
    - Scenario 2: Inter-module communication inside one microservice. This section must be especially detailed because developers often confuse inbound and outbound ports here. Use the existing example where `workflows` calls the `transmittals` module use case through an exported inbound port. Explain:
      - From the caller module's point of view, another module is outside its core.
      - From the called module's point of view, its use case is an inbound capability.
      - Why `workflows` defines `WORKFLOW_TRANSMITTAL_PORT` as an outbound port.
      - Why `transmittals` defines `CREATE_TRANSMITTAL_PORT` as an inbound port.
      - Why `TransmittalModuleAdapter` lives under `workflows/adapters/out`.
      - How `TransmittalsModule` exports `CREATE_TRANSMITTAL_PORT`.
      - How `WorkflowsModule` imports `TransmittalsModule` and binds `WORKFLOW_TRANSMITTAL_PORT` to `TransmittalModuleAdapter`.
      - Why the workflow use case must not inject `PrismaTransmittalRepositoryAdapter`.
      - Why directly injecting `CreateTransmittalUseCase` is less preferred than using the exported inbound port.
      - Add a simple dependency inversion thinking diagram for the inter-module case:
        - `UpdateWorkflowStatusUseCase` depends on `WorkflowTransmittalPort`.
        - `TransmittalModuleAdapter` implements `WorkflowTransmittalPort`.
        - `TransmittalModuleAdapter` depends on exported `CreateTransmittalPort`.
        - `CreateTransmittalUseCase` implements `CreateTransmittalPort`.
      - Explain that the adapter is the only class that knows both module contracts.
      - Explain that dependency inversion is working if `UpdateWorkflowStatusUseCase` can be unit tested by mocking `WorkflowTransmittalPort`.
      - Include a "thinking rule": Module A defines an outbound port for what it needs, Module B exposes an inbound port for what it safely allows, and Module A owns the adapter that calls Module B's inbound port.
      - Include a table showing each file, module, layer, and reason it lives there.
      - Include code examples for `WorkflowTransmittalPort`, `CreateTransmittalPort`, `TransmittalModuleAdapter`, `TransmittalsModule`, and `WorkflowsModule`.
      - Include a Mermaid diagram showing both module boundaries.
    - Scenario 3: Microservice-to-microservice direct communication without the gateway. Explain how one service should call another service through an outbound port and a gRPC client adapter. The calling service should not inject raw `ClientGrpc` into its use case. The called service still treats the request as an inbound adapter call.

12. Step-By-Step Guide: Adding A New Feature Module
    - Identify business capability
    - Create domain model
    - Create inbound port
    - Create outbound ports
    - Create input/output DTOs
    - Implement use case
    - Implement inbound adapter/controller
    - Implement outbound adapter/repository
    - Bind providers in module
    - Add tests
    - Add docs/config/migrations
    - Review checklist

13. Best Practices
    - Keep domain pure
    - Keep use cases orchestration-focused
    - Keep controllers thin
    - Map persistence models to domain models
    - Use ports for external effects
    - Keep module boundaries explicit
    - Prefer clear names
    - Use path aliases responsibly
    - Avoid leaking NestJS, Prisma, Kafka, Redis, gRPC clients, file storage clients, external API clients, or other infrastructure into domain/application core
    - Keep validation at correct layer
    - Document architectural decisions
    - Naming conventions

14. Bad Practices And Anti-Patterns
    - Controller talking directly to Prisma
    - Use case importing concrete Prisma repository
    - Domain entity importing Nest decorators or Prisma types
    - Shared module becoming a dumping ground
    - Generic base repository hiding business-specific queries
    - DTOs reused as domain entities
    - Global modules overused
    - Circular dependencies
    - Business logic in adapters
    - Excessive abstraction without need
    - Include code examples and corrected alternatives
    - Gateway containing service business rules
    - Microservice-to-microservice calls directly from use cases using raw gRPC clients
    - Use case importing Redis/cache client directly
    - Treating examples such as Prisma/Kafka/Redis as the only possible infrastructure concerns

15. Testing Strategy
    - Domain tests
    - Use case tests with mocked ports
    - Adapter integration tests
    - Contract tests for ports
    - E2E tests
    - Test data builders
    - What should not require a database
    - What should require a real or test database
    - Contract tests for service-to-service gRPC clients
    - Tests for inter-module use-case calls

16. Production Readiness Checklist
    - POC cleanup
    - Error handling
    - Observability
    - Secrets
    - Config validation
    - Database migrations
    - Idempotency
    - Transaction boundaries
    - Message publishing reliability
    - Retry strategy
    - Security
    - Performance
    - Documentation
    - Ownership
    - Service-to-service timeout, retry, and idempotency strategy
    - gRPC contract versioning
    - Gateway responsibility boundaries

17. ISO-Friendly Maintenance And Governance
    - Document owner
    - Review cadence
    - Change history
    - Architecture decision records
    - Traceability from requirement to use case to port to adapter to test
    - Review gates
    - Risk register
    - Evidence expectations
    - Audit notes

18. Pros And Cons
    - Benefits
    - Trade-offs
    - When not to use this architecture
    - When to use a simpler NestJS structure

19. FAQ For Developers Coming From Default NestJS
    - Why not put everything in service?
    - Why ports?
    - Why adapters?
    - Where does validation go?
    - Where does Prisma go?
    - Where does Kafka go?
    - Where should a DTO live?
    - How do I avoid overengineering?
    - Should business logic go in the gateway?
    - How should one module call another module?
    - How should one microservice call another microservice?

20. Glossary
    - Hexagon
    - Port
    - Adapter
    - Entity
    - Use case
    - DTO
    - Repository
    - Dependency inversion
    - Boundary
    - Infrastructure

21. External References
    Include a table of external references with links and purpose. At minimum include:
    - Alistair Cockburn's original Hexagonal Architecture article: https://alistair.cockburn.us/hexagonal-architecture
    - NestJS custom providers documentation: https://docs.nestjs.com/fundamentals/custom-providers
    - NestJS dependency injection documentation: https://docs.nestjs.com/fundamentals/dependency-injection
    - NestJS gRPC microservices documentation: https://docs.nestjs.com/microservices/grpc
    - NestJS Prisma recipe: https://docs.nestjs.com/recipes/prisma
    - Prisma documentation: https://www.prisma.io/docs
    - gRPC introduction documentation: https://grpc.io/docs/what-is-grpc/introduction/
    - KafkaJS documentation, if Kafka is discussed: https://kafka.js.org/docs/getting-started
    - Martin Fowler's Dependency Injection / Inversion of Control article: https://martinfowler.com/articles/injection.html
    - ISO/IEC/IEEE 42010 official page for architecture description: https://www.iso.org/standard/74393.html
    - ISO 9000 family / ISO 9001 quality management overview: https://www.iso.org/standards/popular/iso-9000-family
    - Include a note that these are external references only. The document may be ISO-friendly but must not claim ISO conformance or certification.

22. Appendix
    - Example folder tree
    - Example module creation checklist
    - Example pull request checklist
    - Example architecture review checklist
    - Conversion notes for PDF/DOCX
    - If HTML output is generated, include Mermaid script support so Mermaid diagrams render in browsers

## Important Constraints

- Mention clearly that this project is a sample/reference/boilerplate POC.
- Mention clearly that modules and implementation details are not directly reusable without review.
- Explain that architecture ideas and patterns are reusable.
- Avoid claiming the document guarantees ISO compliance.
- Avoid claiming this structure is the only correct approach.
- Include practical examples from the project.
- Include both good and bad examples.
- Include maintainability and auditability guidance.
- Include naming conventions with good and bad examples.
- Include service communication scenarios for gateway-to-service gRPC, inter-module use-case calls, and service-to-service gRPC.
- Use **Service Hexagon Blueprint** as the POC/reference name.
- Generalize infrastructure boundaries. Do not present the architecture as only framework independence, database independence, and messaging independence.
- Mention Redis/cache as an example of an infrastructure adapter, while making clear the pattern applies to all external technical mechanisms.
- Use Mermaid diagrams for architecture, dependency inversion, and communication flows. Do not rely only on plain text arrow diagrams.
- Keep the document focused on service architecture. Do not make the gateway the main design target.
- Make the final document detailed, structured, and usable by a developer without extra assistance.

## Final Output Format

Return only the final Markdown document. Do not include extra commentary outside the document.
