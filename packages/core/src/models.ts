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

export type BoardWord = {
  word: string
  type: WordType
  revealed: boolean
}

export type WordsBoard = BoardWord[][]

export enum Teams {
  red = "red",
  blue = "blue",
}

export type TeamConfig = {
  spyMaster: string | undefined
  wordsLeft: number | undefined
  score: number
}

export type TurnOutcome = "success" | "failure" | "assassin" | undefined

export enum GameVariant {
  classic = "classic",
  interception = "interception",
}

export type GameConfig = {
  language: string | undefined
  turnTimeoutSec: number | undefined
  variant: GameVariant
}

export type CodeNamesGame = {
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
  interceptPhase: boolean
  interceptUsed: boolean
  interceptingTeam: Teams | undefined
}

export type Player = {
  userId: string
  team: Teams | undefined
}

export type Words = {
  language: string
  words: string[]
}

export type TurnTimeoutConfig = {
  timeoutSec: number
  description: string
}
