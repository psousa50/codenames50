import { Messages } from "@codenames50/messaging"

export interface CreateGameInput extends Messages.CreateGameInput {
  gameId: string
}
