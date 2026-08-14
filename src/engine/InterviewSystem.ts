import { Player, Club } from '../models/types';
import { InterviewQuestion, InterviewOption, SocialActorType } from '../models/socialTypes';

export class InterviewSystem {
  generatePostMatchInterview(player: Player, performanceRating: number): InterviewQuestion {
    if (performanceRating >= 8.0) {
      return {
        id: 'pm_win_high',
        text: `Incredible performance today, ${player.name}. You were everywhere. How are you feeling about your form?`,
        options: [
          {
            text: "It's all about the team. I'm just happy we got the three points.",
            personalityImpact: { teamPlayer: 2, professionalism: 1, ego: -1 },
            relationshipImpact: { managerTrust: 2, fanApproval: 1, teammateUnity: 2 }
          },
          {
            text: "I know what I'm capable of. This is just the beginning.",
            personalityImpact: { confidence: 3, ego: 2, ambition: 1 },
            relationshipImpact: { managerTrust: 0, fanApproval: 2, teammateUnity: -1 }
          },
          {
            text: "I love playing for this club. The fans give me so much energy.",
            personalityImpact: { loyalty: 3, teamPlayer: 1 },
            relationshipImpact: { managerTrust: 1, fanApproval: 5, teammateUnity: 1 }
          }
        ]
      };
    } else if (performanceRating < 6.0) {
      return {
        id: 'pm_loss_low',
        text: `Tough game today. You struggled to make an impact. What went wrong?`,
        options: [
          {
            text: "I wasn't good enough today. I'll work harder in training to fix it.",
            personalityImpact: { professionalism: 3, confidence: -1, ego: -2 },
            relationshipImpact: { managerTrust: 3, fanApproval: 1, teammateUnity: 1 }
          },
          {
            text: "The tactics didn't really suit my game today, but we move on.",
            personalityImpact: { ego: 2, teamPlayer: -2, professionalism: -1 },
            relationshipImpact: { managerTrust: -3, fanApproval: -1, teammateUnity: -1 }
          },
          {
            text: "It's a collective failure. We all need to be better.",
            personalityImpact: { teamPlayer: 2, professionalism: 1 },
            relationshipImpact: { managerTrust: 1, fanApproval: 0, teammateUnity: 1 }
          }
        ]
      };
    }

    return {
      id: 'pm_standard',
      text: "A solid shift today. Are you satisfied with the result?",
      options: [
        {
          text: "We take the point and move to the next one.",
          personalityImpact: { professionalism: 1 },
          relationshipImpact: { managerTrust: 1, fanApproval: 1, teammateUnity: 1 }
        },
        {
          text: "I'm always looking to improve, I want to be more decisive.",
          personalityImpact: { ambition: 2, professionalism: 1 },
          relationshipImpact: { managerTrust: 1, fanApproval: 1, teammateUnity: 0 }
        }
      ]
    };
  }

  applyChoice(player: Player, club: Club, option: InterviewOption) {
    // Apply Personality changes
    if (option.personalityImpact) {
      for (const [key, value] of Object.entries(option.personalityImpact)) {
        const k = key as keyof typeof player.personality;
        player.personality[k] = Math.max(0, Math.min(100, player.personality[k] + (value || 0)));
      }
    }

    // Apply Relationship changes (In a real engine, these would update club/manager state)
    if (option.relationshipImpact) {
      if (option.relationshipImpact.managerTrust) {
        club.managerTrust = Math.max(0, Math.min(100, club.managerTrust + option.relationshipImpact.managerTrust));
      }
      // Note: fanApproval and teammateUnity would be tracked in a more complex RelationshipManager
    }
  }
}
