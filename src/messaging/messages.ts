import { ErrorCodes } from "../domain/errors"
import {
  ChangeTurnInput,
  CreateGameInput,
  JoinGameInput,
  JoinTeamInput,
  RevealWordInput,
  SendHintInput,
  SetSpyMasterInput,
  StartGameInput,
} from "../domain/models"
import { CodeNamesGame } from "../game/models"

export type GameMessageType =
  | "connect"
  | "reconnect"
  | "disconnect"
  | "registerUserSocket"
  | "createGame"
  | "gameCreated"
  | "joinGame"
  | "joinedGame"
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

export interface ErrorInput {
  code: ErrorCodes
  text: string
}

export const registerUserSocket = (userId: RegisterUserSocketInput) => createGameMessage("registerUserSocket", userId)
export const createGame = (data: CreateGameInput) => createGameMessage("createGame", data)
export const gameCreated = (data: CodeNamesGame) => createGameMessage("gameCreated", data)
export const joinGame = (data: JoinGameInput) => createGameMessage("joinGame", data)
export const joinedGame = (data: CodeNamesGame) => createGameMessage("joinedGame", data)
export const joinTeam = (data: JoinTeamInput) => createGameMessage("joinTeam", data)
export const startGame = (data: StartGameInput) => createGameMessage("startGame", data)
export const sendHint = (data: SendHintInput) => createGameMessage("sendHint", data)
export const revealWord = (data: RevealWordInput) => createGameMessage("revealWord", data)
export const changeTurn = (data: ChangeTurnInput) => createGameMessage("changeTurn", data)
export const setSpyMaster = (data: SetSpyMasterInput) => createGameMessage("setSpyMaster", data)
export const error = (data: ErrorInput) => createGameMessage("gameError", data)
