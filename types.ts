
export enum Page {
  HOME = 'home',
  GROWTH = 'growth',
  AI = 'ai',
  KNOWLEDGE = 'knowledge',
  PROFILE = 'profile'
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface GrowthData {
  week: number;
  comparison: string;
  weight: number;
  height: number;
  highlights: string;
  suggestion: string;
  image: string;
}
