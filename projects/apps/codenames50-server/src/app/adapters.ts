import { AppConfig } from "../config"
import { DomainEnvironment } from "../domain/adapters"
import { GamesDomainPorts } from "../domain/main"

export const buildExpressEnvironment = (
  config: AppConfig,
  domainEnvironment: DomainEnvironment,
  gamesDomainPorts: GamesDomainPorts,
) => ({
  config: {
    port: config.port,
  },
  domainAdapter: {
    gamesDomainPorts,
    domainEnvironment,
  },
})

export type ExpressEnvironment = ReturnType<typeof buildExpressEnvironment>
