import * as readline from 'readline';
import { PlayerMatchController } from '../engine/PlayerMatchController';
import { MatchConfig } from '../models/matchTypes';
import { SocialFeedEngine } from '../engine/SocialFeedEngine';
import { InterviewSystem } from '../engine/InterviewSystem';

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function runDemo() {
  console.log('Interactive Match Demo — Arsenal vs Chelsea');
  const config: MatchConfig = {
    homeTeamName: 'Arsenal',
    awayTeamName: 'Chelsea',
    userPlayerId: 'you-01',
    userPosition: 'RW',
    startMinute: 65,
    deterministicSeed: 42
  };

  const controller = new PlayerMatchController(config);

  const social = new SocialFeedEngine();
  const interview = new InterviewSystem();

  const callbacks = {
    onStateUpdate: (state: any) => {
      // show minute & score occasionally
      if (state.minute % 5 === 0) {
        console.log(`Minute ${state.minute} — Score ${state.homeGoals} - ${state.awayGoals}`);
      }
    },
    onActionPrompt: async (minute: number, actions: any[], context: any) => {
      console.log(`\n${minute}:00 — BALL RECEIVED`);
      console.log('You: RW');
      actions.forEach((a: any, i: number) => console.log(`${i + 1}. ${a}`));
      const ans = await promptUser('Choose an action (1-4): ');
      const idx = parseInt(ans, 10) - 1;
      if (idx >= 0 && idx < actions.length) return actions[idx];
      return actions[0];
    },
    onEvent: (ev: any) => {
      console.log(`[${ev.minute}] ${ev.type}: ${ev.description}`);
    }
  };

  console.log('\nSubstitution: You enter the game at minute 65 as RW');
  const result = await controller.run(callbacks as any);

  console.log('\n--- FULL TIME ---');
  console.log(`Final Score: ${result.homeGoals} - ${result.awayGoals}`);
  console.log('Your Stats:', result.playerStats);

  // Feed into existing systems
  const socialPosts = social.generateMatchReactions({ id: 'you-01', name: 'You', position: 'RW', personality: { teamPlayer:50, confidence:50, ambition:50, loyalty:50, ego:20, professionalism:50 } } as any, { id: 'ars-01', name: 'Arsenal', country: 'England', leagueId: 'pl-01', reputation: 85, budget: 100000000, managerTrust: 50 } as any, result.playerStats.averageRating, { goals: result.playerStats.goals, assists: result.playerStats.assists });
  socialPosts.forEach((p: any) => console.log(`[SOCIAL] ${p.actorName}: ${p.content}`));

  const question = interview.generatePostMatchInterview({ id: 'you-01', name: 'You' } as any, result.playerStats.averageRating);
  console.log('\n[INTERVIEW] Reporter:', question.text);
}

if (require.main === module) {
  runDemo().catch(err => console.error(err));
}
