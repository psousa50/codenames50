export enum Teams {
  red = "red",
  blue = "blue",
}

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

export interface CodeNameGame {
  gameId: string
  timestamp: string
  userId: string
  players: Player[]
  state: GameStates
  turn: Teams
  board: BoardWord[]
}

interface Player {
  userId: string
}

export interface Words {
  language: string
  words: string[]
}
