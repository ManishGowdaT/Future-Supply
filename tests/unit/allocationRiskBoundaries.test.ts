import { describe, it, expect } from 'vitest';
import { optimizeMultiFarmMatchPlan } from '../../src/engines/multiFarmOptimizer';
import { findAutomatedReplacements } from '../../src/engines/replacementEngine';
import { evaluateCommitmentRisk } from '../../src/engines/riskEngine';
import { InMemoryRepository } from '../../src/infrastructure/repositories/inMemoryRepository';

describe('Allocation and risk boundaries', () => {
  it('does not allocate more supply to a fully secured demand', async () => {
    const repo = new InMemoryRepository();
    const [demand] = await repo.getAllDemands();
    const plan = optimizeMultiFarmMatchPlan({ ...demand, securedQuantityKg: demand.requiredQuantityKg }, await repo.getAll());
    expect(plan.allocatedQuantityKg).toBe(0);
    expect(plan.matches).toHaveLength(0);
    expect(plan.optimizationSummary).toContain('already fully secured');
  });
  it('does not recommend a replacement for a zero shortfall', async () => {
    const repo = new InMemoryRepository();
    const [commitment] = await repo.getAllCommitments();
    const plan = findAutomatedReplacements(commitment, 0, await repo.getAll());
    expect(plan.totalReplacementAllocatedKg).toBe(0);
    expect(plan.restoredFulfillmentProb).toBe(commitment.fulfillmentProbability);
  });
  it('rejects invalid replacement quantities', async () => {
    const repo = new InMemoryRepository();
    const [commitment] = await repo.getAllCommitments();
    expect(() => findAutomatedReplacements(commitment, -1, [])).toThrow(/Shortfall quantity/);
  });
  it('preserves a recorded zero previous fulfillment probability', async () => {
    const repo = new InMemoryRepository();
    const [commitment] = await repo.getAllCommitments();
    const result = evaluateCommitmentRisk({ ...commitment, fulfillmentProbability: 0 }, null);
    expect(result.previousFulfillmentProb).toBe(0);
  });
});
