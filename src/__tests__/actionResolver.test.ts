import { RNG, resolveAction } from '../engine/actionResolver';

describe('actionResolver', () => {
  const attacker: any = {
    id: 'att-1',
    name: 'Attacker',
    attributes: {
      dribbling: 80,
      pace: 75,
      agility: 70,
      passing: 60,
      vision: 60,
      ballControl: 70,
      crossing: 65,
      finishing: 85,
      composure: 80,
      positioning: 70
    },
    personality: { confidence: 60, professionalism: 60, teamPlayer: 50 }
  };

  const defender: any = {
    id: 'def-1',
    name: 'Defender',
    attributes: {
      positioning: 70,
      strength: 75,
      concentration: 70,
      pace: 60
    },
    personality: { professionalism: 60 }
  };

  test('deterministic with same seed', () => {
    const rng1 = new RNG(12345);
    const rng2 = new RNG(12345);
    const r1 = resolveAction('DRIBBLE', attacker, defender, { fatigue: 10 }, rng1);
    const r2 = resolveAction('DRIBBLE', attacker, defender, { fatigue: 10 }, rng2);
    expect(r1).toEqual(r2);
  });

  test('returns expected shape and fields', () => {
    const rng = new RNG(42);
    const r = resolveAction('SHOOT', attacker, defender, { fatigue: 5 }, rng);
    expect(typeof r.success).toBe('boolean');
    expect(typeof r.description).toBe('string');
    expect(typeof r.fatigueDelta).toBe('number');
    expect(['YELLOW','RED',null]).toContain(r.card);
  });
});
