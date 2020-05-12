export interface CreateGameInput {
  userId: string
  language: string
}

export type CreateGameOutput = CodeNamesGame

export interface JoinGameInput {
  gameId: string
  userId: string
}

export type JoinGameOutput = CodeNamesGame

export type RevealWordInput = {
  gameId: string
  userId: string
  row: number
  col: number
}

export type RevealWordOutput = CodeNamesGame

export type ChangeTurnInput = {
  gameId: string
  userId: string
}

export type ChangeTurnOutput = CodeNamesGame

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

export type WordsBoard = BoardWord[][]

export interface CodeNamesGame {
  gameId: string
  timestamp: string
  userId: string
  players: Player[]
  state: GameStates
  turn: Teams
  board: WordsBoard
}

interface Player {
  userId: string
}

export interface Words {
  language: string
  words: string[]
}
