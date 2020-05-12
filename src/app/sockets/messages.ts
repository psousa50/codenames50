type SocketMessageType = "iamSpyMaster" | "selectWord"

const createSocketMessage = <T>(type: SocketMessageType, handler: (data: T) => void) => {
  const message = (data: T) => ({
    type,
    data,
  })
  message.type = type
  message.handler = handler

  return message
}

export interface SocketMessageTemplate<T> {
  type: SocketMessageType
  (data: T): SocketMessage<T>
  handler: (data: T) => void
}

export type SocketMessage<T> = {
  type: SocketMessageType
  data: T
}

const spyMasterHandler = (data: { userId: string; row: number; col: number }) => {
  console.log("=====>\n", data)
}
const selectWordHandler = (data: { userId: string }) => {
  console.log("=====>\n", data)
}

export const spyMasterMessage = createSocketMessage("iamSpyMaster", spyMasterHandler)
export const selectWordMessage = createSocketMessage("selectWord", selectWordHandler)
