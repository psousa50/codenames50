import { postJson } from "../utils/fetch"
import { apiUrl } from "./config"
import { CodeNamesGame, CreateInput, JoinInput } from "./models"

export const create = (input: CreateInput) =>
  postJson<CodeNamesGame>(`${apiUrl}/games/create`, { body: JSON.stringify(input) })

export const join = (input: JoinInput) =>
  postJson<CodeNamesGame>(`${apiUrl}/games/join`, { body: JSON.stringify(input) })
