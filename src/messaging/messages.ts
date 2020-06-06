import { CodeNamesGame, Teams } from "../codenames-core/models"

export type GameMessageType =
  | "changeTurn"
  | "connect"
  | "createGame"
  | "disconnect"
  | "gameCreated"
  | "gameError"
  | "joinedGame"
  | "joinGame"
  | "joinTeam"
  | "nextGame"
  | "updateGame"
  | "randomizeTeam"
  | "reconnect"
  | "registerUserSocket"
  | "removePlayer"
  | "revealWord"
  | "sendHint"
  | "setSpyMaster"
  | "startGame"

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

export interface RandomizeTeamsInput {
  gameId: string
}

export type RandomizeTeamsOutput = CodeNamesGame

export interface UpdateGameInput {
  game: CodeNamesGame
}

export interface JoinedGameInput {
  game: CodeNamesGame
  userId: string
}

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

export const changeTurn = (data: ChangeTurnInput) => createGameMessage("changeTurn", data)
export const createGame = (data: CreateGameInput) => createGameMessage("createGame", data)
export const joinGame = (data: JoinGameInput) => createGameMessage("joinGame", data)
export const joinTeam = (data: JoinTeamInput) => createGameMessage("joinTeam", data)
export const nextGame = (data: NextGameInput) => createGameMessage("nextGame", data)
export const randomizeTeam = (data: RandomizeTeamsInput) => createGameMessage("randomizeTeam", data)
export const registerUserSocket = (userId: RegisterUserSocketInput) => createGameMessage("registerUserSocket", userId)
export const removePlayer = (data: RemovePlayerInput) => createGameMessage("removePlayer", data)
export const revealWord = (data: RevealWordInput) => createGameMessage("revealWord", data)
export const sendHint = (data: SendHintInput) => createGameMessage("sendHint", data)
export const setSpyMaster = (data: SetSpyMasterInput) => createGameMessage("setSpyMaster", data)
export const startGame = (data: StartGameInput) => createGameMessage("startGame", data)

export const error = (data: ErrorInput) => createGameMessage("gameError", data)
export const gameCreated = (data: CodeNamesGame) => createGameMessage("gameCreated", data)
export const joinedGame = (data: JoinedGameInput) => createGameMessage("joinedGame", data)
export const updateGame = (data: UpdateGameInput) => createGameMessage("updateGame", data)
