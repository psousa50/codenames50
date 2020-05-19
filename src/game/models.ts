export enum GameStates {
  idle = "idle",
  running = "running",
  ended = "ended",
}

export enum WordType {
  red = "red",
  blue = "blue",
  inocent = "inocent",
  assassin = "assassin",
}

export interface BoardWord {
  word: string
  type: WordType
  revealed: boolean
}

export type WordsBoard = BoardWord[][]

export enum Teams {
  red = "red",
  blue = "blue",
}

export interface CodeNamesGame {
  gameId: string
  timestamp: string
  userId: string
  players: Player[]
  blueSpyMaster: string | undefined
  redSpyMaster: string | undefined
  hintWord: string
  hintWordCount: number
  wordsRevealedCount: number
  state: GameStates
  turn: Teams | undefined
  board: WordsBoard
}

export interface Player {
  userId: string
  team: Teams | undefined
}

export interface Words {
  language: string
  words: string[]
}
