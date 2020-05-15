import { AppConfig } from "../config"
import { buildGamesDomainAdapters, DomainEnvironment, GamesDomainAdapters } from "../domain/adapters"
import { ask as askAction } from "../utils/actions"

export type ExpressConfig = {
  port: number
}

export type ExpressEnvironment = {
  config: ExpressConfig
  adapters: {
    gamesDomain: GamesDomainAdapters
  }
}

export function ask() {
  return askAction<ExpressEnvironment>()
}

export const buildExpressEnvironment = (
  config: AppConfig,
  domainEnvironment: DomainEnvironment,
): ExpressEnvironment => ({
  config: {
    port: config.port,
  },
  adapters: {
    gamesDomain: buildGamesDomainAdapters(domainEnvironment),
  },
})
