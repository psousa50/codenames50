import { postJson } from "../utils/fetch"
import { apiUrl } from "./config"
import { CodeNamesGame, CreateGameInput, JoinGameInput } from "./models"

export const create = (input: CreateGameInput) =>
  postJson<CodeNamesGame>(`${apiUrl}/games/create`, { body: JSON.stringify(input) })

export const join = (input: JoinGameInput) =>
  postJson<CodeNamesGame>(`${apiUrl}/games/join`, { body: JSON.stringify(input) })
