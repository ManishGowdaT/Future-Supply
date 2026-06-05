# FutureSupply — Predictive Fresh Produce Procurement Network

> **A role-based predictive B2B procurement prototype connecting forward farmer supply positions with commercial buyer demand requirements.**

---

## 🌾 Core Product Value
Unlike classifieds or spot marketplaces, **FutureSupply** solves the structural volatility of fresh produce by enabling:
1. **Predictive Harvest Intelligence**: Probabilistic yield intervals ($P10, P50, P90$) and confidence scoring before harvest.
2. **Transparent 7-Factor Matching**: Multi-farm combinatorial allocation optimizing fulfillment probability, harvest timing, proximity, quality, price, reliability, and logistics cost.
3. **Continuous Fulfillment Risk Engine**: Deterministic monitoring of agricultural, farmer, commercial, and logistics risks.
4. **1-Click Automated Replacement Sourcing**: Live shortfall detection that instantly recommends and locks in nearby verified backup supply when risk rises.
5. **Traceable Quality & Freshness Assurance**: Standardized QC grading (Grade A, B, Processing), `ProduceBatch` traceability, and commodity-specific shelf-life decay calculations.
6. **Commercial Commitments & Simulated Escrow**: State-machine governed forward orders with simulated payment stage milestones (not a live payment or compliance integration).

---

## 🏛️ System Architecture

```text
UI (Farmer, Buyer, QC/Logistics, Platform Admin)
                      ↓
              Application Layer
                      ↓
 Domain Business Engines (Pure TypeScript / Framework Independent)
   - matchingEngine.ts
   - riskEngine.ts
   - replacementEngine.ts
   - yieldPredictor.ts
   - freshnessCalculator.ts
   - reliabilityEngine.ts
                      ↓
            Repository Interfaces
   - ISupplyPositionRepository
   - IDemandPositionRepository
   - IForwardCommitmentRepository
   - IAuditEventRepository
                      ↓
       In-Memory / Persistence Store (Future: REST API -> PostgreSQL)
```

---

## Prototype limitations

The application uses seeded data and an in-memory repository. Role switching is a demonstration, not authentication or authorization. Yield, risk, quality and escrow outputs are simulated and are not validated commercial guarantees. Reloading the application resets in-memory business data.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run Vitest test suite
npm test

# Production build
npm run build
```

---

## 👥 Role Personas Supported
- **Farmer / FPO Grower**: Future crop registration, crop stage tracker, reliability scorecard, prediction intervals.
- **Buyer Procurement Control Center**: Store-level demand planner, Bengaluru supply coverage calendar, matching & auto-replacement drawer.
- **QC Inspector & Logistics Hub**: Collection center inspection terminal, batch labeling, aggregation route planner.
- **Platform Administrator**: Network North Star metrics, overcommitment prevention guardrails, weather shock simulation injector.
