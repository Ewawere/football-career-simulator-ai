import { Attributes, Position, Player, Appearance, Personality, PlayerStats } from './types';

export function calculateOVR(attributes: Attributes, position: Position): number {
  const weights: Record<Position, Partial<Attributes>> = {
    [Position.ST]: { finishing: 0.2, shooting: 0.15, positioning: 0.15, pace: 0.1, ballControl: 0.1, strength: 0.1, composure: 0.1, acceleration: 0.1 },
    [Position.RW]: { pace: 0.15, acceleration: 0.15, dribbling: 0.15, crossing: 0.15, agility: 0.1, ballControl: 0.1, finishing: 0.1, vision: 0.1 },
    [Position.LW]: { pace: 0.15, acceleration: 0.15, dribbling: 0.15, crossing: 0.15, agility: 0.1, ballControl: 0.1, finishing: 0.1, vision: 0.1 },
    [Position.CAM]: { passing: 0.2, vision: 0.2, ballControl: 0.15, dribbling: 0.1, decisionMaking: 0.1, positioning: 0.1, finishing: 0.05, agility: 0.1 },
    [Position.CM]: { passing: 0.2, stamina: 0.15, vision: 0.1, ballControl: 0.1, decisionMaking: 0.1, positioning: 0.1, strength: 0.1, composure: 0.1, ballControl: 0.05 },
    [Position.CDM]: { strength: 0.15, stamina: 0.15, passing: 0.15, positioning: 0.15, concentration: 0.1, decisionMaking: 0.1, ballControl: 0.1, pace: 0.1 },
    [Position.CB]: { strength: 0.2, positioning: 0.2, concentration: 0.15, decisionMaking: 0.1, pace: 0.1, acceleration: 0.05, stamina: 0.1, ballControl: 0.1 },
    [Position.LB]: { pace: 0.15, acceleration: 0.1, stamina: 0.15, crossing: 0.1, positioning: 0.15, strength: 0.1, agility: 0.1, dribbling: 0.05, ballControl: 0.1 },
    [Position.RB]: { pace: 0.15, acceleration: 0.1, stamina: 0.15, crossing: 0.1, positioning: 0.15, strength: 0.1, agility: 0.1, dribbling: 0.05, ballControl: 0.1 },
    [Position.GK]: { concentration: 0.3, agility: 0.2, positioning: 0.2, strength: 0.1, decisionMaking: 0.1, composure: 0.1 },
  };

  const posWeights = weights[position];
  let totalWeight = 0;
  let ovr = 0;

  for (const [attr, weight] of Object.entries(posWeights)) {
    ovr += (attributes[attr as keyof Attributes] || 0) * weight!;
    totalWeight += weight!;
  }

  // If weights don't sum to 1, normalize or use remaining as average
  if (totalWeight < 1) {
    const remaining = 1 - totalWeight;
    const avg = Object.values(attributes).reduce((a, b) => a + b, 0) / Object.keys(attributes).length;
    ovr += avg * remaining;
  }

  return Math.round(ovr);
}

export class PlayerGenerator {
  static generate(overrides: Partial<Player> = {}): Player {
    const id = Math.random().toString(36).substr(2, 9);
    const seed = Math.random().toString(36).substr(2, 9);
    
    const attributes: Attributes = {
      finishing: 50 + Math.floor(Math.random() * 30),
      passing: 50 + Math.floor(Math.random() * 30),
      dribbling: 50 + Math.floor(Math.random() * 30),
      ballControl: 50 + Math.floor(Math.random() * 30),
      crossing: 50 + Math.floor(Math.random() * 30),
      shooting: 50 + Math.floor(Math.random() * 30),
      pace: 60 + Math.floor(Math.random() * 30),
      acceleration: 60 + Math.floor(Math.random() * 30),
      strength: 50 + Math.floor(Math.random() * 30),
      stamina: 60 + Math.floor(Math.random() * 30),
      agility: 60 + Math.floor(Math.random() * 30),
      vision: 50 + Math.floor(Math.random() * 30),
      composure: 50 + Math.floor(Math.random() * 30),
      positioning: 50 + Math.floor(Math.random() * 30),
      decisionMaking: 50 + Math.floor(Math.random() * 30),
      concentration: 50 + Math.floor(Math.random() * 30),
    };

    const appearance: Appearance = {
      hairStyle: 'Short',
      hairColor: 'Brown',
      skinTone: 'Light',
      height: 175 + Math.floor(Math.random() * 20),
      build: 'Athletic',
      seed,
    };

    const personality: Personality = {
      teamPlayer: 50 + Math.floor(Math.random() * 30),
      confidence: 50 + Math.floor(Math.random() * 30),
      ambition: 50 + Math.floor(Math.random() * 30),
      loyalty: 50 + Math.floor(Math.random() * 30),
      ego: 20 + Math.floor(Math.random() * 30),
      professionalism: 50 + Math.floor(Math.random() * 30),
    };

    const stats: PlayerStats = {
      appearances: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      averageRating: 0,
      totalRating: 0,
    };

    return {
      id,
      name: 'Player ' + id,
      nationality: 'England',
      age: 16,
      position: Position.ST,
      attributes,
      potential: 80 + Math.floor(Math.random() * 15),
      appearance,
      marketValue: 500000,
      wage: 500,
      milestones: [],
      stats,
      personality,
      ...overrides,
    };
  }
}
