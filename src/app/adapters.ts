import { DomainEnvironment, GamesDomainAdapters, buildGamesDomainAdapters } from "../domain/adapters"
import { ask as askAction } from "../utils/actions"
import { AppConfig } from "../config"

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
