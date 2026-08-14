import { PlayerGenerator } from './utils/playerGenerator';
import { Position, Club } from './models/types';
import { SocialFeedEngine } from './engine/SocialFeedEngine';
import { InterviewSystem } from './engine/InterviewSystem';

async function main() {
  console.log("--- EUROPEAN FOOTBALL CAREER SIMULATOR ---");
  console.log("PHASE 11: SOCIAL & MEDIA SYSTEM DEMO\n");

  // 1. Generate Player
  const player = PlayerGenerator.generate({
    name: "Marcus Sterling",
    position: Position.RW,
    nationality: "England"
  });

  const arsenal: Club = {
    id: 'ars-01',
    name: 'Arsenal',
    country: 'England',
    leagueId: 'pl-01',
    reputation: 85,
    budget: 100000000,
    managerTrust: 50
  };

  console.log(`Created Player: ${player.name} (${player.position}) at ${arsenal.name}`);
  console.log(`Initial Personality:`, player.personality);
  console.log(`Initial Manager Trust: ${arsenal.managerTrust}\n`);

  const socialEngine = new SocialFeedEngine();
  const interviewSystem = new InterviewSystem();

  // 2. Simulate a Great Match
  console.log("--- Scenario: A Great Match (Rating 9.2, 2 Goals) ---");
  const performanceRating = 9.2;
  const matchStats = { goals: 2, assists: 1 };
  
  const matchReactions = socialEngine.generateMatchReactions(player, arsenal, performanceRating, matchStats);
  console.log("Social Feed Reactions:");
  matchReactions.forEach(post => {
    console.log(`[${post.actorType}] ${post.actorName}: "${post.content}" (${post.likes} likes) ${post.hashtags.join(' ')}`);
  });

  // 3. Post-Match Interview
  console.log("\n--- Scenario: Post-Match Interview ---");
  const question = interviewSystem.generatePostMatchInterview(player, performanceRating);
  console.log(`Reporter: "${question.text}"`);
  
  // Simulate choosing the "Humble" option (index 0)
  const choice = question.options[0];
  console.log(`Player choice: "${choice.text}"`);
  
  interviewSystem.applyChoice(player, arsenal, choice);
  
  console.log(`\nUpdated Personality:`, player.personality);
  console.log(`Updated Manager Trust: ${arsenal.managerTrust}\n`);

  // 4. Trending Topics
  console.log("Trending Topics:", socialEngine.getTrendingTopics());

  // 5. Transfer Scenario
  console.log("\n--- Scenario: Major Transfer to Real Madrid ---");
  const realMadrid: Club = {
    id: 'rm-01',
    name: 'Real Madrid',
    country: 'Spain',
    leagueId: 'll-01',
    reputation: 95,
    budget: 250000000,
    managerTrust: 50
  };
  
  const transferReactions = socialEngine.generateTransferReactions(player, arsenal, realMadrid, 85000000);
  transferReactions.forEach(post => {
    console.log(`[${post.actorType}] ${post.actorName}: "${post.content}"`);
  });

  console.log("\n--- DEMO COMPLETE ---");
}

main().catch(err => console.error(err));
