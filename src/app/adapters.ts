import { AppConfig } from "../config"
import { DomainEnvironment } from "../domain/adapters"
import { gamesDomainPorts } from "../domain/games"

export const buildExpressEnvironment = (config: AppConfig, domainEnvironment: DomainEnvironment) => ({
  config: {
    port: config.port,
  },
  domainAdapter: {
    gamesDomainPorts,
    domainEnvironment,
  },
})

export type ExpressEnvironment = ReturnType<typeof buildExpressEnvironment>
