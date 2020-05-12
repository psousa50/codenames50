type SocketMessageType = "iamSpyMaster" | "selectWord"

const createSocketMessage = <T>(type: SocketMessageType, handler: (data: T) => void) => ({
  type,
  createMessage: (data: T) => ({
    type,
    data,
  }),
  handler,
})

export type SocketMessageTemplate<T> = {
  type: SocketMessageType
  createMessage: (data: T) => SocketMessage<T>
  handler: (data: T) => void
}

type SocketMessage<T> = {
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
