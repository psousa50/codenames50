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

export interface TeamConfig {
  spyMaster: string | undefined
  wordsLeft: number | undefined
}

export type TurnOutcome = "success" | "failure" | "assassin" | undefined

export interface GameConfig {
  language: string | undefined
  turnTimeoutSec: number | undefined
}

export interface CodeNamesGame {
  gameId: string
  gameCreatedTime: number
  gameStartedTime: number | undefined
  config: GameConfig
  userId: string
  players: Player[]
  blueTeam: TeamConfig
  redTeam: TeamConfig
  hintWord: string
  hintWordCount: number
  turnStartedTime: number | undefined
  wordsRevealedCount: number
  state: GameStates
  turn: Teams | undefined
  turnCount: number | undefined
  turnTimeoutSec: number | undefined
  turnOutcome: TurnOutcome | undefined
  winner: Teams | undefined
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
