import { CodeNamesGame } from "../codenames-core/models"

export interface CreateGameInput {
  gameId: string
  userId: string
  language: string
}

export type CreateGameOutput = CodeNamesGame

export interface JoinGameInput {
  gameId: string
  userId: string
}

export type JoinGameOutput = CodeNamesGame

export interface JoinTeamInput {
  gameId: string
  userId: string
  team: Teams
}

export type JoinTeamOutput = CodeNamesGame

export interface StartGameInput {
  gameId: string
  userId: string
}

export type StartGameOutput = CodeNamesGame

export type SendHintInput = {
  gameId: string
  userId: string
  hintWord: string
  hintWordCount: number
}

export type SendHintOutput = CodeNamesGame

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

export type SetSpyMasterInput = {
  gameId: string
  userId: string
}

export type SetSpyMasterOutput = CodeNamesGame

export enum Teams {
  red = "red",
  blue = "blue",
}
