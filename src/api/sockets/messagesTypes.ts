export type SocketMessageType =
  | "createGame"
  | "gameCreated"
  | "joinGame"
  | "joinedGame"
  | "iamSpyMaster"
  | "revealWord"
  | "changeTurn"

export type SocketMessage<T> = {
  type: SocketMessageType
  data: T
}

export const createSocketMessage = <T>(type: SocketMessageType, data: T) => ({
  type,
  data,
})
