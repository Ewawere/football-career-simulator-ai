import { PlayerMatchController } from '../engine/PlayerMatchController';
import * as actionResolver from '../engine/actionResolver';
import { PlayerGenerator } from '../utils/playerGenerator';

describe('PlayerMatchController integration', () => {
  beforeAll(() => {
    // Mock resolveAction to deterministic outcomes for integration test
    jest.spyOn(actionResolver, 'resolveAction').mockImplementation((action: any, attacker: any, defender: any, context: any, rng: any) => {
      if (action === 'SHOOT') {
        return { success: true, goal: true, description: 'Mocked goal', assist: false, lostPossession: false, card: null, fatigueDelta: -3 };
      }
      if (action === 'PASS') {
        return { success: true, goal: false, assist: true, description: 'Mocked assist', lostPossession: false, card: null, fatigueDelta: -1 };
      }
      if (action === 'DRIBBLE') {
        return { success: true, goal: false, assist: false, description: 'Mocked dribble', lostPossession: false, card: null, fatigueDelta: -1 };
      }
      if (action === 'CROSS') {
        return { success: true, goal: false, assist: false, description: 'Mocked cross', lostPossession: false, card: null, fatigueDelta: -1 };
      }
      return { success: false, description: 'Mocked fail', lostPossession: true, goal: false, assist: false, card: null, fatigueDelta: -1 };
    });

    // Stub PlayerGenerator.generate to return a predictable player
    jest.spyOn(PlayerGenerator, 'generate' as any).mockImplementation((opts: any = {}) => {
      return {
        id: opts?.id || 'you-01',
        name: opts?.name || 'You',
        position: opts?.position || 'RW',
        attributes: {
          dribbling: 90,
          pace: 85,
          agility: 80,
          passing: 75,
          vision: 70,
          ballControl: 80,
          crossing: 70,
          finishing: 95,
          composure: 90,
          positioning: 80
        },
        personality: { confidence: 75, professionalism: 70, teamPlayer: 60 }
      } as any;
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('player involvement leads to goals and assists and rating is computed', async () => {
    const controller = new PlayerMatchController({ homeTeamName: 'Arsenal', awayTeamName: 'Chelsea', userPlayerId: 'you-01', userPosition: 'RW', startMinute: 65, deterministicSeed: 42 });

    // Provide a callback that always chooses SHOOT to force goals via mocked resolveAction
    const callbacks: any = {
      onActionPrompt: async (minute: number, actions: any[], context: any) => {
        return 'SHOOT';
      },
      onEvent: (ev: any) => {
        // no-op
      },
      onStateUpdate: (s: any) => {
        // no-op
      }
    };

    const result = await controller.run(callbacks);

    expect(result.playerStats).toBeDefined();
    expect(typeof result.playerStats.averageRating).toBe('number');
    // Because we forced SHOOT to always be a goal, expect at least one goal recorded
    expect(result.playerStats.goals).toBeGreaterThanOrEqual(1);
    // Events should include at least one GOAL
    expect(result.events.some((e: any) => e.type === 'GOAL')).toBeTruthy();
  }, 20000);
});
