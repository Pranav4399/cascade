export interface WordData {
  clue: string;
  answer: string;
  length: number;
}

export interface FocusedCell {
  wordIndex: number;
  letterIndex: number;
}

export interface GameData {
  id: number;
  date: string;
  words: WordData[];
}

export type GameDataArray = GameData[];

export interface GameState {
  userAnswers: string[];
  validatedAnswers: boolean[];
  gameComplete: boolean;
  focusedCell: FocusedCell | null;
} 