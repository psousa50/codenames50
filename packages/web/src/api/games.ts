import { GameModels } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import { postJson } from "../utils/fetch"
import { apiUrl } from "./config"

export const create = (input: Messages.CreateGameInput) =>
  postJson<GameModels.CodeNamesGame>(`${apiUrl}/games/create`, { body: JSON.stringify(input) })

export const join = (input: Messages.JoinGameInput) =>
  postJson<GameModels.CodeNamesGame>(`${apiUrl}/games/join`, { body: JSON.stringify(input) })
