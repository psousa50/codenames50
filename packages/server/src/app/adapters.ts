import { AppConfig } from "../config"
import { DomainEnvironment } from "../domain/adapters"
import { GamesDomainPorts } from "../domain/main"

export const buildExpressEnvironment = (
  config: AppConfig,
  domainEnvironment: DomainEnvironment,
  gamesDomainPorts: GamesDomainPorts,
) => ({
  config,
  domainAdapter: {
    gamesDomainPorts,
    domainEnvironment,
  },
})

export type ExpressEnvironment = ReturnType<typeof buildExpressEnvironment>
