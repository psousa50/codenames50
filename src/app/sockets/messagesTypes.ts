export type SocketMessageType = "createGame" | "gameCreated" | "joinGame" | "joinedGame" | "iamSpyMaster" | "revealWord"

export type SocketMessage<T> = {
  type: SocketMessageType
  data: T
}

export const createSocketMessage = <T>(type: SocketMessageType, data: T) => ({
  type,
  data,
})
