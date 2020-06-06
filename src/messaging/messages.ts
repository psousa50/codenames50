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

export interface JoinGameInput {
  gameId: string
  userId: string
}

export interface RandomizeTeamsInput {
  gameId: string
}

export type UpdateGameInput = CodeNamesGame

export interface JoinedGameInput {
  game: CodeNamesGame
  userId: string
}

export interface NextGameInput {
  gameId: string
  language?: string
}

export interface RemovePlayerInput {
  gameId: string
  userId: string
}

export interface JoinTeamInput {
  gameId: string
  userId: string
  team: Teams
}

export interface StartGameInput {
  gameId: string
  userId: string
}

export type SendHintInput = {
  gameId: string
  userId: string
  hintWord: string
  hintWordCount: number
}

export type RevealWordInput = {
  gameId: string
  userId: string
  row: number
  col: number
}

export type ChangeTurnInput = {
  gameId: string
  userId: string
}

export type SetSpyMasterInput = {
  gameId: string
  userId: string
  team: Teams
}

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
