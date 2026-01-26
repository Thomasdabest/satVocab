export interface WordItem {
  word: string;
  meaning: string;
  sentence?: string;
  sportsExample?: string;
  songAssociation?: {
    title: string;
    artist: string;
    reason: string;
  };
}

export interface User {
  name: string;
  email: string;
  password?: string;
  savedWords: string[];
  unitProgress?: Record<number, number>; // unitId -> highscore
}

export interface SATQuestion {
  id: number;
  text: string;
  options: {
    label: string;
    text: string;
  }[];
  answer: string; // The label (A, B, C, D)
}

export interface SATUnit {
  id: number;
  title: string;
  questions: SATQuestion[];
}

export interface CardState {
  image?: string;
  audio?: string;
  loading: boolean;
  sentence?: string;
  sportsExample?: string;
  songAssociation?: {
    title: string;
    artist: string;
    reason: string;
  };
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: number;
}

export enum View {
  Landing = 'landing',
  Login = 'login',
  Home = 'home',
  Flashcards = 'flashcards',
  Quiz = 'quiz',
  Game = 'game',
  MyWords = 'mywords'
}