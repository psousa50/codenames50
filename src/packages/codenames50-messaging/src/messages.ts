import { CodeNamesGame, GameConfig, Teams } from "codenames50-core/lib/models"

export type GameMessageType =
  | "changeTurn"
  | "connect"
  | "createGame"
  | "disconnect"
  | "gameCreated"
  | "gameError"
  | "gameRestarted"
  | "gameStarted"
  | "hintSent"
  | "joinedGame"
  | "joinGame"
  | "joinTeam"
  | "randomizeTeam"
  | "reconnect"
  | "registerUserSocket"
  | "removePlayer"
  | "restartGame"
  | "revealWord"
  | "sendHint"
  | "setSpyMaster"
  | "startGame"
  | "turnChanged"
  | "turnTimeout"
  | "updateGame"

export type GameMessage<T = {}> = {
  type: GameMessageType
  data: T
}

export type GameMessageHandlerSpec<T extends GameMessageType, D = any, R = void> = {
  type: T
  handler: (data: D) => R
}

export type GameMessageHandler =
  | GameMessageHandlerSpec<"changeTurn", ChangeTurnInput>
  | GameMessageHandlerSpec<"connect">
  | GameMessageHandlerSpec<"createGame", CreateGameInput>
  | GameMessageHandlerSpec<"disconnect">
  | GameMessageHandlerSpec<"gameCreated", CodeNamesGame>
  | GameMessageHandlerSpec<"gameError", GameErrorInput>
  | GameMessageHandlerSpec<"gameRestarted">
  | GameMessageHandlerSpec<"gameStarted", CodeNamesGame>
  | GameMessageHandlerSpec<"hintSent", HintSentInput>
  | GameMessageHandlerSpec<"joinedGame", JoinedGameInput>
  | GameMessageHandlerSpec<"joinGame", JoinGameInput>
  | GameMessageHandlerSpec<"joinTeam", JoinTeamInput>
  | GameMessageHandlerSpec<"randomizeTeam">
  | GameMessageHandlerSpec<"reconnect">
  | GameMessageHandlerSpec<"registerUserSocket", RegisterUserSocketInput>
  | GameMessageHandlerSpec<"removePlayer", RemovePlayerInput>
  | GameMessageHandlerSpec<"restartGame", RestartGameInput>
  | GameMessageHandlerSpec<"revealWord", RevealWordInput>
  | GameMessageHandlerSpec<"sendHint", SendHintInput>
  | GameMessageHandlerSpec<"setSpyMaster", SetSpyMasterInput>
  | GameMessageHandlerSpec<"startGame", StartGameInput>
  | GameMessageHandlerSpec<"turnChanged">
  | GameMessageHandlerSpec<"turnTimeout", TurnTimeoutInput>
  | GameMessageHandlerSpec<"updateGame", CodeNamesGame>

export const createGameMessagehandler = <T extends GameMessageType, D = any, R = void>(
  type: T,
  handler: (data: D) => R,
): GameMessageHandlerSpec<T, D> => ({
  type,
  handler,
})

export const createGameMessage = <T>(type: GameMessageType, data: T): GameMessage<T> => ({
  type,
  data,
})

export type RegisterUserSocketInput = {
  userId: string
}

export interface CreateGameInput {
  gameId?: string
  userId: string
}

export interface JoinGameInput {
  gameId: string
  userId: string
}

export interface RandomizeTeamsInput {
  gameId: string
}

export interface JoinedGameInput {
  game: CodeNamesGame
  userId: string
}

export type GameErrorInput = {
  message: string
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
  config: GameConfig
}

export interface RestartGameInput {
  gameId: string
  userId: string
}

export type SendHintInput = {
  gameId: string
  userId: string
  hintWord: string
  hintWordCount: number
}

export type HintSentInput = {
  gameId: string
  userId: string
  hintWord: string
  hintWordCount: number
  hintWordStartedTime: number
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

export type TurnTimeoutInput = {
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
export const hintSent = (data: HintSentInput) => createGameMessage("hintSent", data)
export const joinGame = (data: JoinGameInput) => createGameMessage("joinGame", data)
export const joinTeam = (data: JoinTeamInput) => createGameMessage("joinTeam", data)
export const randomizeTeam = (data: RandomizeTeamsInput) => createGameMessage("randomizeTeam", data)
export const registerUserSocket = (userId: RegisterUserSocketInput) => createGameMessage("registerUserSocket", userId)
export const removePlayer = (data: RemovePlayerInput) => createGameMessage("removePlayer", data)
export const revealWord = (data: RevealWordInput) => createGameMessage("revealWord", data)
export const sendHint = (data: SendHintInput) => createGameMessage("sendHint", data)
export const setSpyMaster = (data: SetSpyMasterInput) => createGameMessage("setSpyMaster", data)
export const startGame = (data: StartGameInput) => createGameMessage("startGame", data)
export const restartGame = (data: RestartGameInput) => createGameMessage("restartGame", data)
export const turnTimeout = (data: TurnTimeoutInput) => createGameMessage("turnTimeout", data)

export const error = (data: ErrorInput) => createGameMessage("gameError", data)
export const gameCreated = (data: CodeNamesGame) => createGameMessage("gameCreated", data)
export const joinedGame = (data: JoinedGameInput) => createGameMessage("joinedGame", data)
export const updateGame = (data: CodeNamesGame) => createGameMessage("updateGame", data)
export const gameStarted = (data: CodeNamesGame) => createGameMessage("gameStarted", data)
