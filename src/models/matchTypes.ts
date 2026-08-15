// Minimal match-related types for the interactive prototype
import { Player, PlayerStats } from '../models/types';

export type ActionType = 'DRIBBLE' | 'PASS' | 'CROSS' | 'SHOOT';

export interface MatchConfig {
  homeTeamName: string;
  awayTeamName: string;
  userPlayerId: string; // player's id
  userPosition?: string;
  startMinute?: number; // default 0
  deterministicSeed?: number; // optional seed for deterministic runs
}

export interface MatchEvent {
  minute: number;
  type: string;
  description: string;
  actorId?: string; // player id responsible
  targetId?: string; // optional target (for pass/assist)
}

export interface MatchState {
  minute: number;
  homeGoals: number;
  awayGoals: number;
  possessionTeam: 'home' | 'away';
  events: MatchEvent[];
}

export interface ActionResolutionResult {
  success: boolean;
  description: string;
  goal?: boolean;
  assist?: boolean;
  lostPossession?: boolean;
  card?: 'YELLOW' | 'RED' | null;
  fatigueDelta?: number; // applied to player
}

export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
  playerStats: PlayerStats & { rating: number };
  events: MatchEvent[];
}

export interface MatchCallbacks {
  onStateUpdate?: (state: MatchState) => void;
  onActionPrompt?: (minute: number, actions: ActionType[], context: any) => Promise<ActionType> | ActionType;
  onEvent?: (event: MatchEvent) => void;
}
