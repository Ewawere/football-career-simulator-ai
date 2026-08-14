import { SocialFeedEngine } from '../engine/SocialFeedEngine';
import { InterviewSystem } from '../engine/InterviewSystem';
import { PlayerGenerator } from '../utils/playerGenerator';
import { Club } from '../models/types';
import { SocialActorType } from '../models/socialTypes';

describe('Phase 11: Social & Media System', () => {
  const player = PlayerGenerator.generate({ name: 'Test Player' });
  const club: Club = {
    id: 'test-club',
    name: 'Test FC',
    country: 'TestLand',
    leagueId: 'test-league',
    reputation: 50,
    budget: 1000,
    managerTrust: 50
  };

  test('SocialFeedEngine generates match reactions', () => {
    const engine = new SocialFeedEngine();
    const reactions = engine.generateMatchReactions(player, club, 9.0, { goals: 1, assists: 0 });
    
    expect(reactions.length).toBeGreaterThan(0);
    expect(reactions.some(r => r.actorType === SocialActorType.FAN)).toBe(true);
    expect(reactions[0].hashtags).toContain('#TestPlayer');
  });

  test('InterviewSystem generates questions and applies choices', () => {
    const system = new InterviewSystem();
    const initialTrust = club.managerTrust;
    const initialProfessionalism = player.personality.professionalism;
    
    const question = system.generatePostMatchInterview(player, 9.0);
    expect(question.options.length).toBeGreaterThan(0);
    
    const humbleOption = question.options[0];
    system.applyChoice(player, club, humbleOption);
    
    expect(club.managerTrust).toBeGreaterThan(initialTrust);
    expect(player.personality.professionalism).toBeGreaterThanOrEqual(initialProfessionalism);
  });

  test('SocialFeedEngine tracks trending topics', () => {
    const engine = new SocialFeedEngine();
    engine.generateMatchReactions(player, club, 9.5, { goals: 3, assists: 0 });
    
    const trending = engine.getTrendingTopics();
    expect(trending).toContain('#GoalMachine');
  });
});
