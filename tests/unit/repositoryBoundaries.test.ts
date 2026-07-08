import { describe, it, expect } from 'vitest';
import { InMemoryRepository } from '../../src/infrastructure/repositories/inMemoryRepository';

describe('Supply repository boundaries', () => {
  it('rejects invalid reservations without changing stored capacity', async () => {
    const repo = new InMemoryRepository();
    const [supply] = await repo.getAll();
    for (const quantity of [-1, 0, NaN, Infinity]) {
      await expect(repo.reserveCapacity(supply.id, quantity)).rejects.toThrow(/Reservation quantity/);
    }
    expect(await repo.getById(supply.id)).toEqual(supply);
  });
  it('rejects invalid releases without changing stored capacity', async () => {
    const repo = new InMemoryRepository();
    const [supply] = await repo.getAll();
    for (const quantity of [-1, NaN, Infinity]) {
      await expect(repo.releaseCapacity(supply.id, quantity)).rejects.toThrow(/Release quantity/);
    }
    expect(await repo.getById(supply.id)).toEqual(supply);
  });
  it('isolates supply list and detail results', async () => {
    const repo = new InMemoryRepository();
    const [supply] = await repo.getAll();
    const original = structuredClone(supply);
    supply.location.region = 'Modified externally';
    const detail = (await repo.getById(supply.id))!;
    expect(detail.location.region).toBe(original.location.region);
    detail.location.region = 'Modified detail';
    expect(await repo.getById(supply.id)).toEqual(original);
  });
});
