import { MatchConfig, MatchResult, MatchEvent, MatchCallbacks } from '../models/matchTypes';
import { PlayerGenerator } from '../utils/playerGenerator';

export class WorldMatchSimulator {
  private config: MatchConfig;

  constructor(config: MatchConfig) {
    this.config = config;
  }

  async run(callbacks: MatchCallbacks = {}): Promise<MatchResult> {
    // Very lightweight AI-only simulation that produces plausible MatchResult
    const homeGoals = Math.floor(Math.random() * 4);
    const awayGoals = Math.floor(Math.random() * 4);
    const events: MatchEvent[] = [];

    // Create a few events
    for (let m = (this.config.startMinute ?? 0); m <= 90; m += Math.floor(Math.random() * 10) + 1) {
      if (Math.random() < 0.2) {
        const ev: MatchEvent = {
          minute: m,
          type: 'GOAL_AI',
          description: `${Math.random() < 0.5 ? this.config.homeTeamName : this.config.awayTeamName} scored (AI)`,
        };
        events.push(ev);
        if (callbacks.onEvent) callbacks.onEvent(ev);
      }
      if (callbacks.onStateUpdate) callbacks.onStateUpdate({ minute: m, homeGoals, awayGoals, possessionTeam: Math.random() < 0.5 ? 'home' : 'away', events });
    }

    // Minimal playerStats stub
    const playerStats = {
      appearances: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      averageRating: 6.5,
      totalRating: 585
    } as any;

    return {
      homeGoals,
      awayGoals,
      playerStats,
      events
    } as MatchResult;
  }
}
