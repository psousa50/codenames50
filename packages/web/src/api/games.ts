import { GameModels } from "@codenames50/core"
import { fetchJson } from "../utils/fetch"
import { apiUrl } from "./config"

export type GameVariantConfig = {
  name: string
  displayName: string
  description: string
}

export const getLanguages = () => fetchJson<string[]>(`${apiUrl}/games/languages`)

export const getTurnTimeouts = () => fetchJson<GameModels.TurnTimeoutConfig[]>(`${apiUrl}/games/turnTimeouts`)

export const getVariants = () => fetchJson<GameVariantConfig[]>(`${apiUrl}/games/variants`)
