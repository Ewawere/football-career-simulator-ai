import { MatchConfig, MatchResult, MatchState, MatchEvent, MatchCallbacks, ActionType } from '../models/matchTypes';
import { Player } from '../models/types';
import { RNG, resolveAction } from './actionResolver';
import { PlayerGenerator } from '../utils/playerGenerator';

export class PlayerMatchController {
  private config: MatchConfig;
  private rng: RNG;
  private userPlayer!: Player;
  private homePlayers: Player[] = [];
  private awayPlayers: Player[] = [];

  constructor(config: MatchConfig) {
    this.config = config;
    const seed = config.deterministicSeed ?? 1;
    this.rng = new RNG(seed);
  }

  private createTeam(isHome: boolean) {
    const players: Player[] = [];
    for (let i = 0; i < 11; i++) {
      players.push(PlayerGenerator.generate());
    }
    return players;
  }

  private findDefenderAgainst(position: string): Player | undefined {
    // Very simple: pick a random away defender
    const defenders = this.awayPlayers.filter((p, idx) => idx >= 2 && idx <= 6);
    return defenders.length ? defenders[Math.floor(this.rng.next() * defenders.length)] : undefined;
  }

  async run(callbacks: MatchCallbacks = {}): Promise<MatchResult> {
    // Setup teams
    this.homePlayers = this.createTeam(true);
    this.awayPlayers = this.createTeam(false);

    // Place user player into a home team slot (as a substitute coming on at startMinute)
    this.userPlayer = PlayerGenerator.generate({ name: 'You', position: (this.config.userPosition as any) || 'RW' });
    // We'll insert user at index 7
    this.homePlayers[7] = this.userPlayer;

    const state: MatchState = {
      minute: this.config.startMinute ?? 65,
      homeGoals: 0,
      awayGoals: 0,
      possessionTeam: 'home',
      events: []
    };

    // initial appearance
    const playerStats = {
      appearances: 1,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      averageRating: 0,
      totalRating: 0
    } as any;

    // Simulate from startMinute to 90
    for (let m = state.minute; m <= 90; m++) {
      state.minute = m;
      // simple possession toggle logic
      if (this.rng.next() < 0.5) state.possessionTeam = 'home'; else state.possessionTeam = 'away';

      // If possession with home and user is likely to be involved randomly
      const userInvolved = state.possessionTeam === 'home' && this.rng.next() < 0.4;

      if (userInvolved) {
        // Prompt for action
        const actions: ActionType[] = ['DRIBBLE', 'PASS', 'CROSS', 'SHOOT'];
        let choice: ActionType;
        if (callbacks.onActionPrompt) {
          const res = callbacks.onActionPrompt(m, actions, { player: this.userPlayer });
          if (res instanceof Promise) choice = await res as ActionType; else choice = res as ActionType;
        } else {
          // default: pick best action by skill
          choice = actions[Math.floor(this.rng.next() * actions.length)];
        }

        const defender = this.findDefenderAgainst(this.userPlayer.position as any);
        const result = resolveAction(choice, this.userPlayer, defender, { fatigue: 100 - (this.userPlayer.personality?.professionalism || 50) }, this.rng);

        const ev: MatchEvent = {
          minute: m,
          type: result.goal ? 'GOAL' : (result.assist ? 'ASSIST' : (result.lostPossession ? 'TURNOVER' : 'ACTION')),
          description: result.description,
          actorId: this.userPlayer.id
        };
        state.events.push(ev);
        if (callbacks.onEvent) callbacks.onEvent(ev);

        if (result.goal) {
          state.homeGoals += 1;
          playerStats.goals += 1;
        }
        if (result.assist) {
          playerStats.assists += 1;
        }

        // Apply fatigue
        // We'll store fatigue as a simple derived property in personality.health if present (non-invasive)
        const p: any = this.userPlayer;
        if (!p._fatigue) p._fatigue = 0;
        p._fatigue += (result.fatigueDelta || -1);

        // update rating approx
        playerStats.totalRating += result.goal ? 8 + this.rng.next() * 2 : (result.assist ? 7 + this.rng.next() * 2 : 6 + this.rng.next() * 1);
      } else {
        // simulate AI event (non-user)
        if (this.rng.next() < 0.05) {
          // AI goal
          if (state.possessionTeam === 'home') {
            state.homeGoals += 1;
          } else {
            state.awayGoals += 1;
          }
          const ev: MatchEvent = {
            minute: m,
            type: 'GOAL_AI',
            description: 'AI team scored',
          };
          state.events.push(ev);
          if (callbacks.onEvent) callbacks.onEvent(ev);
        }
      }

      if (callbacks.onStateUpdate) callbacks.onStateUpdate(state);
    }

    // finalize rating
    playerStats.averageRating = Math.round((playerStats.totalRating / Math.max(1, 90 - (this.config.startMinute ?? 65) + 1)) * 10) / 10;
    const result: MatchResult = {
      homeGoals: state.homeGoals,
      awayGoals: state.awayGoals,
      playerStats,
      events: state.events
    };

    return result;
  }
}
