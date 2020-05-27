import { CodeNamesGame, Teams } from "../codenames-core/models"

export type GameMessageType =
  | "connect"
  | "reconnect"
  | "disconnect"
  | "registerUserSocket"
  | "createGame"
  | "gameCreated"
  | "joinGame"
  | "joinedGame"
  | "nextGame"
  | "removePlayer"
  | "joinTeam"
  | "setSpyMaster"
  | "startGame"
  | "sendHint"
  | "revealWord"
  | "changeTurn"
  | "gameError"

export type GameMessage<T = {}> = {
  type: GameMessageType
  data: T
}

export const createGameMessage = <T>(type: GameMessageType, data: T) => ({
  type,
  data,
})

export type RegisterUserSocketInput = {
  userId: string
}

export interface CreateGameInput {
  gameId?: string
  userId: string
  language: string
}

export type CreateGameOutput = CodeNamesGame

export interface JoinGameInput {
  gameId: string
  userId: string
}

export type JoinGameOutput = CodeNamesGame

export interface NextGameInput {
  gameId: string
  language?: string
}

export type NextGameOutput = CodeNamesGame

export interface RemovePlayerInput {
  gameId: string
  userId: string
}

export type RemovePlayerOutput = CodeNamesGame

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
  team: Teams
}

export type SetSpyMasterOutput = CodeNamesGame

export interface ErrorInput {
  code: string
  text: string
}

export const registerUserSocket = (userId: RegisterUserSocketInput) => createGameMessage("registerUserSocket", userId)
export const createGame = (data: CreateGameInput) => createGameMessage("createGame", data)
export const gameCreated = (data: CodeNamesGame) => createGameMessage("gameCreated", data)
export const joinGame = (data: JoinGameInput) => createGameMessage("joinGame", data)
export const joinedGame = (data: CodeNamesGame) => createGameMessage("joinedGame", data)
export const nextGame = (data: NextGameInput) => createGameMessage("nextGame", data)
export const removePlayer = (data: RemovePlayerInput) => createGameMessage("removePlayer", data)
export const joinTeam = (data: JoinTeamInput) => createGameMessage("joinTeam", data)
export const startGame = (data: StartGameInput) => createGameMessage("startGame", data)
export const sendHint = (data: SendHintInput) => createGameMessage("sendHint", data)
export const revealWord = (data: RevealWordInput) => createGameMessage("revealWord", data)
export const changeTurn = (data: ChangeTurnInput) => createGameMessage("changeTurn", data)
export const setSpyMaster = (data: SetSpyMasterInput) => createGameMessage("setSpyMaster", data)
export const error = (data: ErrorInput) => createGameMessage("gameError", data)
