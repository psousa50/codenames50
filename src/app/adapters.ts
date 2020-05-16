import { AppConfig } from "../config"
import { DomainEnvironment } from "../domain/adapters"
import { GamesDomainPorts, gamesDomainPorts } from "../domain/games"
import { ask as askAction } from "../utils/actions"

export type ExpressConfig = {
  port: number
}

export type ExpressEnvironment = {
  config: ExpressConfig
  adapters: {
    gamesDomainPorts: GamesDomainPorts
    domainEnvironment: DomainEnvironment
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
    gamesDomainPorts,
    domainEnvironment,
  },
})
