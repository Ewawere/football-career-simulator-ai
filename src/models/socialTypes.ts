import { Player, Club } from './types';

export enum SocialActorType {
  FAN = 'FAN',
  CLUB = 'CLUB',
  JOURNALIST = 'JOURNALIST',
  FORMER_PLAYER = 'FORMER_PLAYER',
  TEAMMATE = 'TEAMMATE',
  RIVAL_FAN = 'RIVAL_FAN'
}

export interface SocialPost {
  id: string;
  actorName: string;
  actorType: SocialActorType;
  content: string;
  likes: number;
  hashtags: string[];
  timestamp: Date;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  options: InterviewOption[];
}

export interface InterviewOption {
  text: string;
  personalityImpact?: Partial<PersonalityImpact>;
  relationshipImpact?: Partial<RelationshipImpact>;
}

export interface PersonalityImpact {
  teamPlayer: number;
  confidence: number;
  ambition: number;
  loyalty: number;
  ego: number;
  professionalism: number;
}

export interface RelationshipImpact {
  managerTrust: number;
  fanApproval: number;
  teammateUnity: number;
}
