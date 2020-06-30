import { Messages } from "@codenames50/messaging"

export type EmitMessage = <T extends {}>(message: Messages.GameMessage<T>) => void

export interface Hint {
  word: string
  count: number
}
