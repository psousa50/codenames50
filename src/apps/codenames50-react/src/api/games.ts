import { CodeNamesGame } from "codenames50-core/lib/models"
import * as Messages from "../messaging/messages"
import { postJson } from "../utils/fetch"
import { apiUrl } from "./config"

export const create = (input: Messages.CreateGameInput) =>
  postJson<CodeNamesGame>(`${apiUrl}/games/create`, { body: JSON.stringify(input) })

export const join = (input: Messages.JoinGameInput) =>
  postJson<CodeNamesGame>(`${apiUrl}/games/join`, { body: JSON.stringify(input) })
