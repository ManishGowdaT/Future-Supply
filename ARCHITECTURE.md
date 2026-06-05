# Architecture Documentation & Architectural Decision Records (ADRs)

## Architectural Design Principles

### 1. Separation of Domain Logic from Frameworks
All calculation engines (`matchingEngine`, `riskEngine`, `replacementEngine`, `yieldPredictor`, `freshnessCalculator`, `reliabilityEngine`) are pure TypeScript modules with zero React or DOM dependencies. They receive pure immutable domain entities and return structured outputs with mathematical reasoning.

### 2. Repository Pattern & Backend Decoupling
The UI and application services interface strictly with repository abstractions:
- `ISupplyRepository`
- `IDemandRepository`
- `ICommitmentRepository`
- `IQCRepository`
- `IRiskEventRepository`
- `IAuditRepository`

In this MVP, these are implemented via a reactive `InMemoryRepository` with event emission. When transitioning to a production backend, this layer is replaced by HTTP clients (`Axios/Fetch` -> `NestJS/Spring Boot` -> `PostgreSQL + PostGIS`) without touching domain engine logic.

### 3. Separation of Simulation from Real Business Logic
Simulated external systems (Weather events, Escrow bank transitions, Logistics GPS dispatch) live strictly under `src/simulation/`.

---

## Architectural Decision Records (ADRs)

### ADR-001: Probabilistic Harvest Windows over Exact Dates
- **Status**: Accepted
- **Context**: Agricultural yields and harvest timings are inherently stochastic due to weather, micro-climates, and soil variations.
- **Decision**: Represent harvest windows using $P10$ (pessimistic), $P50$ (median), and $P90$ (optimistic) dates and yield tonnages along with an explicit confidence rating ($0-100\%$).
- **Consequence**: Overcommitment checks strictly bind commitments against the conservative $P10$ safe yield.

### ADR-002: 7-Factor Weighted Transparent Matching
- **Status**: Accepted
- **Context**: Buyers need predictability and cannot rely on single-dimension price sorting.
- **Decision**: Weight fulfillment probability (30%), harvest timing (20%), geographic proximity (15%), quality probability (15%), price (10%), farmer reliability (5%), and logistics cost (5%).
- **Consequence**: Buyers can view a transparent "Why this match?" score breakdown for every recommendation.

### ADR-003: Audit Events for Operational State Transitions
- **Status**: Accepted
- **Context**: Disintermediation, fraud, and disputes require tamper-proof operational auditability.
- **Decision**: Every commitment transition, shortfall alert, QC grading, and weather shock is intended to record an `AuditEvent` with timestamp, actor, and previous/new state. The MVP stores events in memory; durable append-only storage and tamper-evidence remain future work.
