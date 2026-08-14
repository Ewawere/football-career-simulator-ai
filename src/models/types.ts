export enum Position {
  ST = 'ST',
  RW = 'RW',
  LW = 'LW',
  CAM = 'CAM',
  CM = 'CM',
  CDM = 'CDM',
  CB = 'CB',
  LB = 'LB',
  RB = 'RB',
  GK = 'GK'
}

export interface Attributes {
  // Technical
  finishing: number;
  passing: number;
  dribbling: number;
  ballControl: number;
  crossing: number;
  shooting: number;
  // Physical
  pace: number;
  acceleration: number;
  strength: number;
  stamina: number;
  agility: number;
  // Mental
  vision: number;
  composure: number;
  positioning: number;
  decisionMaking: number;
  concentration: number;
}

export interface Appearance {
  hairStyle: string;
  hairColor: string;
  skinTone: string;
  height: number;
  build: string;
  seed: string;
}

export interface Milestone {
  date: Date;
  type: string;
  description: string;
}

export interface Player {
  id: string;
  name: string;
  nationality: string;
  age: number;
  position: Position;
  attributes: Attributes;
  potential: number;
  appearance: Appearance;
  marketValue: number;
  wage: number;
  clubId?: string;
  stats: PlayerStats;
  milestones: Milestone[];
  personality: Personality;
}

export interface PlayerStats {
  appearances: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  averageRating: number;
  totalRating: number;
}

export interface Personality {
  teamPlayer: number; // 0-100
  confidence: number;
  ambition: number;
  loyalty: number;
  ego: number;
  professionalism: number;
}

export interface Club {
  id: string;
  name: string;
  country: string;
  leagueId: string;
  reputation: number;
  budget: number;
  managerTrust: number; // 0-100 for the user player
}

export interface League {
  id: string;
  name: string;
  country: string;
  clubs: string[]; // Club IDs
  standings: Standing[];
}

export interface Standing {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}
