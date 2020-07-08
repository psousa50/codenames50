import { GameModels } from "@codenames50/core"
import { fetchJson } from "../utils/fetch"
import { apiUrl } from "./config"

export const getLanguages = () => fetchJson<string[]>(`${apiUrl}/games/languages`)

export const getTurnTimeouts = () => fetchJson<GameModels.TurnTimeoutConfig[]>(`${apiUrl}/games/turnTimeouts`)
