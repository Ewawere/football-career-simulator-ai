import { ActionType, ActionResolutionResult } from '../models/matchTypes';
import { Player } from '../models/types';

// Simple seedable RNG (LCG)
export class RNG {
  private seed: number;
  constructor(seed = 1) {
    this.seed = seed >>> 0;
  }
  next() {
    // constants from Numerical Recipes
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }
  // return value in [-range, range]
  noise(range = 0.1) {
    return (this.next() * 2 - 1) * range;
  }
}

function clamp(v: number, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}

function skillForAction(action: ActionType, p: Player) {
  // compute a simple skill metric for the player based on attributes
  const attrs = (p as any).attributes || {};
  const pers = (p as any).personality || {};
  switch (action) {
    case 'DRIBBLE':
      return (attrs.dribbling * 0.5 + attrs.pace * 0.2 + attrs.agility * 0.2 + pers.confidence * 0.1) / 100;
    case 'PASS':
      return (attrs.passing * 0.5 + attrs.vision * 0.2 + attrs.ballControl * 0.2 + pers.professionalism * 0.1) / 100;
    case 'CROSS':
      return (attrs.crossing * 0.6 + attrs.pace * 0.15 + attrs.ballControl * 0.15 + pers.teamPlayer * 0.1) / 100;
    case 'SHOOT':
      return (attrs.finishing * 0.6 + attrs.composure * 0.2 + attrs.positioning * 0.1 + pers.confidence * 0.1) / 100;
    default:
      return 0.5;
  }
}

function defenderSkillAgainst(action: ActionType, d?: Player) {
  if (!d) return 0.5;
  const attrs = (d as any).attributes || {};
  const pers = (d as any).personality || {};
  // defenders rely on positioning, strength, concentration, decisionMaking
  return (attrs.positioning * 0.4 + attrs.strength * 0.2 + attrs.concentration * 0.2 + pers.professionalism * 0.1 + attrs.pace * 0.1) / 100;
}

export function resolveAction(action: ActionType, attacker: Player, defender?: Player, context: { fatigue?: number } = {}, rng: RNG = new RNG(1)): ActionResolutionResult {
  const fatigue = context.fatigue || 0; // 0..100
  const atk = skillForAction(action, attacker);
  const def = defenderSkillAgainst(action, defender);
  // base probability influenced by skill gap and fatigue
  let base = 0.5 + 0.3 * (atk - def) - 0.002 * fatigue;
  base = clamp(base, 0.05, 0.95);
  // randomness
  const noise = rng.noise(0.08);
  const prob = clamp(base + noise, 0, 1);

  const success = rng.next() < prob;
  const result: ActionResolutionResult = {
    success,
    description: '',
    goal: false,
    assist: false,
    lostPossession: false,
    card: null,
    fatigueDelta: -1
  };

  if (!success) {
    result.description = `Action ${action} failed against defender.`;
    result.lostPossession = true;
    // small chance of a foul leading to card
    if (rng.next() < 0.02) {
      result.card = rng.next() < 0.1 ? 'RED' : 'YELLOW';
      result.description += ` Foul resulted in ${result.card}.`;
    }
    return result;
  }

  // success -- special handling for SHOOT
  if (action === 'SHOOT') {
    const attrs: any = (attacker as any).attributes || {};
    // goal probability influenced by finishing and composure
    const finishingFactor = attrs.finishing ? attrs.finishing / 100 : 0.5;
    const composureFactor = attrs.composure ? attrs.composure / 100 : 0.5;
    let goalProb = 0.15 + 0.6 * finishingFactor + 0.1 * composureFactor;
    goalProb *= prob; // requires successful shot mechanics
    goalProb = clamp(goalProb, 0.01, 0.99);
    if (rng.next() < goalProb) {
      result.goal = true;
      result.description = `Shot from ${attacker.name} beats the keeper! GOAL.`;
      result.fatigueDelta = -3;
    } else {
      result.description = `Shot from ${attacker.name} was saved or missed.`;
      result.fatigueDelta = -2;
    }
    return result;
  }

  // For PASS/CROSS, success may lead to chance creation
  if (action === 'PASS' || action === 'CROSS') {
    // chance the pass becomes an assist leading to a shot
    const chanceForChance = 0.15 + 0.5 * atk;
    if (rng.next() < chanceForChance) {
      // simulate receiver shot outcome
      const receiverFinishing = 0.5 + rng.noise(0.2);
      const shotSuccess = rng.next() < clamp(0.25 + 0.5 * receiverFinishing, 0, 0.95);
      if (shotSuccess) {
        result.assist = true;
        result.description = `${action} completed and led to a goal (assist).`;
        result.fatigueDelta = -2;
      } else {
        result.description = `${action} completed but chance was wasted.`;
        result.fatigueDelta = -1;
      }
    } else {
      result.description = `${action} completed.`;
      result.fatigueDelta = -1;
    }
    return result;
  }

  if (action === 'DRIBBLE') {
    result.description = `Dribble successful.`;
    result.fatigueDelta = -1;
    return result;
  }

  return result;
}
