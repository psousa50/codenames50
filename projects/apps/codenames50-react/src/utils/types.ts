import * as Messages from "codenames50-messaging/lib/messages"

export type EmitMessage = <T extends {}>(message: Messages.GameMessage<T>) => void

export interface Hint {
  word: string
  count: number
  startedTime: number | undefined
}
