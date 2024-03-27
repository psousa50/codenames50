import React, { useState } from "react"
import { usePlayGameMessaging } from "../../../utils/usePlayGameMessaging"

interface ChatProps {
  gameId: string
  userId: string
}

const Chat: React.FC<ChatProps> = ({ gameId, userId }) => {
  const [message, setMessage] = useState("")
  const { sendChatMessage, messageHistory } = usePlayGameMessaging(gameId, userId)

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      sendChatMessage(message)
      setMessage("")
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
        {messageHistory.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "5px" }}
        />
        <button
          onClick={handleSendMessage}
          style={{ padding: "5px 10px", backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer" }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat
