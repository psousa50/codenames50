import { CodeNamesGame, GameConfig, Teams } from "@codenames50/core/models"

export type GameMessageType =
  | "changeTurn"
  | "checkTurnTimeout"
  | "connect"
  | "createGame"
  | "disconnect"
  | "gameCreated"
  | "gameError"
  | "gameRestarted"
  | "gameStarted"
  | "hintSent"
  | "interceptWord"
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
  | "updateGame"
  | "updateConfig"
  | "wordIntercepted"
  | "wordRevealed"

export type GameMessage<T = Record<string, unknown>> = {
  type: GameMessageType
  data: T
}

export type GameMessageHandlerSpec<T extends GameMessageType, D = void, R = void> = {
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
  | GameMessageHandlerSpec<"interceptWord", InterceptWordInput>
  | GameMessageHandlerSpec<"joinedGame", JoinedGameInput>
  | GameMessageHandlerSpec<"joinGame", JoinGameInput>
  | GameMessageHandlerSpec<"joinTeam", JoinTeamInput>
  | GameMessageHandlerSpec<"randomizeTeam", RandomizeTeamsInput>
  | GameMessageHandlerSpec<"reconnect">
  | GameMessageHandlerSpec<"registerUserSocket", RegisterUserSocketInput>
  | GameMessageHandlerSpec<"removePlayer", RemovePlayerInput>
  | GameMessageHandlerSpec<"restartGame", RestartGameInput>
  | GameMessageHandlerSpec<"revealWord", RevealWordInput>
  | GameMessageHandlerSpec<"sendHint", SendHintInput>
  | GameMessageHandlerSpec<"setSpyMaster", SetSpyMasterInput>
  | GameMessageHandlerSpec<"startGame", StartGameInput>
  | GameMessageHandlerSpec<"turnChanged", TurnChangedInput>
  | GameMessageHandlerSpec<"checkTurnTimeout", CheckTurnTimeoutInput>
  | GameMessageHandlerSpec<"updateGame", CodeNamesGame>
  | GameMessageHandlerSpec<"updateConfig", UpdateConfigInput>
  | GameMessageHandlerSpec<"wordIntercepted", WordInterceptedInput>
  | GameMessageHandlerSpec<"wordRevealed", WordRevealedInput>

export const createGameMessagehandler = <T extends GameMessageType, D = Record<string, unknown>, R = void>(
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

export type CreateGameInput = {
  userId: string
}

export type JoinGameInput = {
  gameId: string
  userId: string
}

export type RandomizeTeamsInput = {
  gameId: string
  userId: string
}

export type JoinedGameInput = {
  game: CodeNamesGame
  userId: string
}

export type GameErrorInput = {
  message: string
}

export type RemovePlayerInput = {
  gameId: string
  userId: string
}

export type JoinTeamInput = {
  gameId: string
  userId: string
  team: Teams
}

export type StartGameInput = {
  gameId: string
  userId: string
  config: GameConfig
}

export type RestartGameInput = {
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
}

export type RevealWordInput = {
  gameId: string
  userId: string
  row: number
  col: number
}

export type InterceptWordInput = {
  gameId: string
  userId: string
  row: number
  col: number
}

export type WordInterceptedInput = InterceptWordInput & {
  now: number
  success: boolean
}

export type WordRevealedInput = RevealWordInput & {
  now: number
}

export type ChangeTurnInput = {
  gameId: string
  userId: string
}

export type TurnChangedInput = ChangeTurnInput & {
  now: number
}

export type CheckTurnTimeoutInput = {
  gameId: string
  userId: string
}

export type UpdateConfigInput = {
  gameId: string
  userId: string
  config: GameConfig
}

export type SetSpyMasterInput = {
  gameId: string
  userId: string
  team: Teams
}

export type ErrorInput = {
  code: string
  text: string
}

export const changeTurn = (data: ChangeTurnInput) => createGameMessage("changeTurn", data)
export const checkTurnTimeout = (data: CheckTurnTimeoutInput) => createGameMessage("checkTurnTimeout", data)
export const createGame = (data: CreateGameInput) => createGameMessage("createGame", data)
export const hintSent = (data: HintSentInput) => createGameMessage("hintSent", data)
export const interceptWord = (data: InterceptWordInput) => createGameMessage("interceptWord", data)
export const joinGame = (data: JoinGameInput) => createGameMessage("joinGame", data)
export const joinTeam = (data: JoinTeamInput) => createGameMessage("joinTeam", data)
export const randomizeTeam = (data: RandomizeTeamsInput) => createGameMessage("randomizeTeam", data)
export const registerUserSocket = (data: RegisterUserSocketInput) => createGameMessage("registerUserSocket", data)
export const removePlayer = (data: RemovePlayerInput) => createGameMessage("removePlayer", data)
export const revealWord = (data: RevealWordInput) => createGameMessage("revealWord", data)
export const sendHint = (data: SendHintInput) => createGameMessage("sendHint", data)
export const setSpyMaster = (data: SetSpyMasterInput) => createGameMessage("setSpyMaster", data)
export const startGame = (data: StartGameInput) => createGameMessage("startGame", data)
export const restartGame = (data: RestartGameInput) => createGameMessage("restartGame", data)
export const turnChanged = (data: TurnChangedInput) => createGameMessage("turnChanged", data)
export const updateConfig = (data: UpdateConfigInput) => createGameMessage("updateConfig", data)
export const wordIntercepted = (data: WordInterceptedInput) => createGameMessage("wordIntercepted", data)
export const wordRevealed = (data: WordRevealedInput) => createGameMessage("wordRevealed", data)
export const error = (data: ErrorInput) => createGameMessage("gameError", data)
export const gameCreated = (data: CodeNamesGame) => createGameMessage("gameCreated", data)
export const joinedGame = (data: JoinedGameInput) => createGameMessage("joinedGame", data)
export const updateGame = (data: CodeNamesGame) => createGameMessage("updateGame", data)
export const gameStarted = (data: CodeNamesGame) => createGameMessage("gameStarted", data)
