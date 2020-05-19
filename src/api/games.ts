import { postJson } from "../utils/fetch"
import { apiUrl } from "./config"
import { CreateGameInput, JoinGameInput } from "./server/domain/models"
import { CodeNamesGame } from "./server/game/models"

export const create = (input: CreateGameInput) =>
  postJson<CodeNamesGame>(`${apiUrl}/games/create`, { body: JSON.stringify(input) })

export const join = (input: JoinGameInput) =>
  postJson<CodeNamesGame>(`${apiUrl}/games/join`, { body: JSON.stringify(input) })
