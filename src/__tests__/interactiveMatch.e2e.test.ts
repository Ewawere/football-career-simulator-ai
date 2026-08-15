import { PlayerMatchController } from '../engine/PlayerMatchController';
import * as actionResolver from '../engine/actionResolver';
import { PlayerGenerator } from '../utils/playerGenerator';

describe('Interactive E2E: scripted match flow', () => {
  beforeAll(() => {
    // Scripted sequence of resolveAction results to simulate realistic outcomes
    const seq: any[] = [];
    // First involvement -> PASS -> leads to assist
    seq.push({ success: true, assist: true, description: 'Scripted assist', goal: false, lostPossession: false, card: null, fatigueDelta: -1 });
    // Second involvement -> DRIBBLE success
    seq.push({ success: true, assist: false, description: 'Scripted dribble', goal: false, lostPossession: false, card: null, fatigueDelta: -1 });
    // Third involvement -> SHOOT -> goal
    seq.push({ success: true, assist: false, description: 'Scripted goal', goal: true, lostPossession: false, card: null, fatigueDelta: -3 });

    let idx = 0;
    jest.spyOn(actionResolver, 'resolveAction').mockImplementation((action: any, attacker: any, defender: any, context: any, rng: any) => {
      const out = seq[Math.min(idx, seq.length - 1)];
      idx += 1;
      return out;
    });

    // Deterministic player generator
    jest.spyOn(PlayerGenerator, 'generate' as any).mockImplementation((opts: any = {}) => {
      return {
        id: opts?.id || 'you-01',
        name: opts?.name || 'You',
        position: opts?.position || 'RW',
        attributes: {
          dribbling: 80,
          pace: 80,
          agility: 75,
          passing: 78,
          vision: 72,
          ballControl: 76,
          crossing: 70,
          finishing: 85,
          composure: 80,
          positioning: 75
        },
        personality: { confidence: 70, professionalism: 70, teamPlayer: 60 }
      } as any;
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('scripted actions produce expected goals and assists in MatchResult', async () => {
    const controller = new PlayerMatchController({ homeTeamName: 'Arsenal', awayTeamName: 'Chelsea', userPlayerId: 'you-01', userPosition: 'RW', startMinute: 65, deterministicSeed: 42 });

    const choices = ['PASS', 'DRIBBLE', 'SHOOT'];
    let call = 0;

    const callbacks: any = {
      onActionPrompt: async (minute: number, actions: any[], context: any) => {
        // Return next scripted choice
        const choice = choices[call % choices.length];
        call += 1;
        return choice;
      },
      onEvent: (ev: any) => {
        // no-op for test
      },
      onStateUpdate: (s: any) => {
        // no-op
      }
    };

    const result = await controller.run(callbacks);

    // Expect at least one goal and one assist according to our scripted sequence
    expect(result.playerStats.goals).toBeGreaterThanOrEqual(1);
    expect(result.playerStats.assists).toBeGreaterThanOrEqual(1);
    expect(result.playerStats.averageRating).toBeDefined();
    expect(Array.isArray(result.events)).toBeTruthy();
    // Ensure there's at least one GOAL event
    expect(result.events.some((e: any) => e.type === 'GOAL')).toBeTruthy();
  }, 20000);
});
