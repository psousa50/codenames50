import React from "react"
import { useSocket } from "../utils/hooks"

interface CodeNamesViewProps {
  gameId: string
}

export const CodeNamesView: React.FC<CodeNamesViewProps> = ({ gameId }) => {
  const [socket] = useSocket("http://127.0.0.1:7000", { autoConnect: false })
  const [messages, setMessages] = React.useState<string[]>([])

  const addMessage = React.useCallback((message: string) => {
    console.log("=====>", message)
    setMessages(m => [...m, message])
  }, [])

  React.useEffect(() => {
    socket.connect()
    console.log("CONNECT")

    socket.on("reply", addMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = () => {
    socket.emit("message", `client message ${Math.floor(Math.random() * 10)}`)
  }

  console.log("RENDER")

  return (
    <div>
      <button onClick={sendMessage}>SEND</button>
      {messages.map((m, i) => (
        <div key={i}>{m}</div>
      ))}
    </div>
  )
}
