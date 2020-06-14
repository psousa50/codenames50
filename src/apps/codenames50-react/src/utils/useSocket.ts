import { useEffect, useRef } from "react"
import io from "socket.io-client"

export const useSocket = (uri: string, opts?: SocketIOClient.ConnectOpts) => {
  const { current: socket } = useRef(io(uri, opts))
  useEffect(() => {
    return () => {
      socket && socket.removeAllListeners()
      socket && socket.close()
    }
  }, [socket])
  return [socket]
}
