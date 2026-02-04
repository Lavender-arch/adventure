
export type GameType = 'click' | 'memory' | 'timing';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface ActivityOption {
  title: string;
  icon: string;
  description: string;
}

export interface Level {
  id: number;
  title: string;
  gameType: GameType;
  gameInstructions: string;
  optionsPool: ActivityOption[];
  image: string;
}

export interface GameState {
  currentLevelIdx: number;
  step: 'intro' | 'playing' | 'choosing' | 'scratched' | 'finished';
  selectedOptionIdx: number | null;
  penalties: string[];
  itinerary: string[]; // 存储每一关刮出的活动标题
  difficulty: Difficulty;
}
