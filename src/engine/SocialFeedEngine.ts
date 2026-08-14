import { SocialPost, SocialActorType } from '../models/socialTypes';
import { Player, Club } from '../models/types';

export class SocialFeedEngine {
  private posts: SocialPost[] = [];

  generateMatchReactions(player: Player, club: Club, performanceRating: number, stats: { goals: number, assists: number }): SocialPost[] {
    const reactions: SocialPost[] = [];
    const hashtags = [`#${club.name.replace(/\s/g, '')}`, `#${player.name.replace(/\s/g, '')}`];

    if (stats.goals > 0) {
      hashtags.push('#GoalMachine');
    }

    // High performance
    if (performanceRating >= 8.0) {
      reactions.push({
        id: Math.random().toString(36).substr(2, 9),
        actorName: 'FanLocal88',
        actorType: SocialActorType.FAN,
        content: performanceRating > 9.0 ? `${player.name} is absolutely UNREAL! Best talent we've seen in years! 🔥` : `What a performance from ${player.name} today. Top class.`,
        likes: Math.floor(Math.random() * 500) + 100,
        hashtags,
        timestamp: new Date()
      });
      reactions.push({
        id: Math.random().toString(36).substr(2, 9),
        actorName: 'TheFootyJournal',
        actorType: SocialActorType.JOURNALIST,
        content: `${player.name} dominated the pitch today. Scouts from across Europe must be watching closely.`,
        likes: Math.floor(Math.random() * 1000) + 500,
        hashtags: [...hashtags, '#Wonderkid'],
        timestamp: new Date()
      });
    } else if (performanceRating < 6.0) {
      reactions.push({
        id: Math.random().toString(36).substr(2, 9),
        actorName: 'AngryGooner',
        actorType: SocialActorType.RIVAL_FAN,
        content: `${player.name} was a ghost today. Overrated?`,
        likes: Math.floor(Math.random() * 200),
        hashtags,
        timestamp: new Date()
      });
    }

    if (stats.goals >= 2) {
      reactions.push({
        id: Math.random().toString(36).substr(2, 9),
        actorName: club.name + ' Official',
        actorType: SocialActorType.CLUB,
        content: `Brace for ${player.name}! What a talent we have on our hands. 🔴⚪`,
        likes: Math.floor(Math.random() * 5000),
        hashtags,
        timestamp: new Date()
      });
    }

    this.posts.push(...reactions);
    return reactions;
  }

  generateTransferReactions(player: Player, oldClub: Club, newClub: Club, fee: number): SocialPost[] {
    const reactions: SocialPost[] = [
      {
        id: Math.random().toString(36).substr(2, 9),
        actorName: 'TransferNewsLive',
        actorType: SocialActorType.JOURNALIST,
        content: `DONE DEAL: ${player.name} joins ${newClub.name} from ${oldClub.name} for a fee around €${(fee / 1000000).toFixed(1)}M. Huge move!`,
        likes: Math.floor(Math.random() * 10000),
        hashtags: ['#TransferNews', `#${newClub.name.replace(/\s/g, '')}`, '#HereWeGo'],
        timestamp: new Date()
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        actorName: 'LoyalFan',
        actorType: SocialActorType.FAN,
        content: `Sad to see ${player.name} leave, but that's a massive profit for the club. Good luck!`,
        likes: Math.floor(Math.random() * 300),
        hashtags: [`#${oldClub.name.replace(/\s/g, '')}`],
        timestamp: new Date()
      }
    ];
    this.posts.push(...reactions);
    return reactions;
  }

  getRecentPosts(limit: number = 10): SocialPost[] {
    return this.posts.slice(-limit).reverse();
  }

  getTrendingTopics(): string[] {
    const counts: Record<string, number> = {};
    this.posts.forEach(p => {
      p.hashtags.forEach(h => {
        counts[h] = (counts[h] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0])
      .slice(0, 5);
  }
}
