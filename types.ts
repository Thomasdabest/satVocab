
export interface WordItem {
  word: string;
  meaning: string;
}

export interface CardState {
  image?: string;
  audio?: string;
  loadingImage: boolean;
  loadingAudio: boolean;
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
