export type SocketMessageType =
  | "createGame"
  | "gameCreated"
  | "joinGame"
  | "joinedGame"
  | "iamSpyMaster"
  | "revealWord"
  | "changeTurn"
  | "error"

export type SocketMessage<T> = {
  type: SocketMessageType
  data: T
}

export const createSocketMessage = <T>(type: SocketMessageType, data: T) => ({
  type,
  data,
})
