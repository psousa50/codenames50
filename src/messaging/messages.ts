import { ErrorCodes } from "../domain/errors"
import { ChangeTurnInput, CodeNamesGame, JoinGameInput, RevealWordInput, SetSpyMasterInput } from "../domain/models"

export type GameMessageType =
  | "connect"
  | "reconnect"
  | "disconnect"
  | "registerUserSocket"
  | "createGame"
  | "gameCreated"
  | "joinGame"
  | "joinedGame"
  | "setSpyMaster"
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
  userId: string
  language: string
}

export interface ErrorInput {
  code: ErrorCodes
  text: string
}

export const registerUserSocket = (userId: RegisterUserSocketInput) => createGameMessage("registerUserSocket", userId)
export const createGame = (data: CreateGameInput) => createGameMessage("createGame", data)
export const gameCreated = (data: CodeNamesGame) => createGameMessage("gameCreated", data)
export const joinGame = (data: JoinGameInput) => createGameMessage("joinGame", data)
export const joinedGame = (data: CodeNamesGame) => createGameMessage("joinedGame", data)
export const revealWord = (data: RevealWordInput) => createGameMessage("revealWord", data)
export const changeTurn = (data: ChangeTurnInput) => createGameMessage("changeTurn", data)
export const setSpyMaster = (data: SetSpyMasterInput) => createGameMessage("setSpyMaster", data)
export const error = (data: ErrorInput) => createGameMessage("gameError", data)
