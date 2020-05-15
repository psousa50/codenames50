export type GameMessageType =
  | "createGame"
  | "gameCreated"
  | "joinGame"
  | "joinedGame"
  | "iamSpyMaster"
  | "revealWord"
  | "changeTurn"
  | "error"

export type GameMessage<T = {}> = {
  type: GameMessageType
  data: T
}

export const createGameMessage = <T>(type: GameMessageType, data: T) => ({
  type,
  data,
})
