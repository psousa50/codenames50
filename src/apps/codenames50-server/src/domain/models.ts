import * as Messages from "../messaging/messages"

export interface CreateGameInput extends Messages.CreateGameInput {
  gameId: string
}
