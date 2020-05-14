import { DomainEnvironment } from "../domain/adapters"
import { ActionResult, Action, ask as askAction } from "../utils/actions"
import { AppConfig } from "../config"
import { gamesDomainPorts } from "../domain/games"
import { buildAdapter, Adapter } from "../utils/adapters"
import {
  CreateGameOutput,
  JoinGameInput,
  JoinGameOutput,
  RevealWordInput,
  RevealWordOutput,
  ChangeTurnInput,
  ChangeTurnOutput,
  CreateGameInput,
} from "../domain/models"
import { Stringify } from "./routes/transformers"
import * as GamesModels from "../domain/models"

export type ExpressConfig = {
  port: number
}

export type ExpressEnvironment = {
  config: ExpressConfig
  adapters: {
    gamesDomain: {
      create: Adapter<CreateGameInput, CreateGameOutput>
      join: Adapter<JoinGameInput, JoinGameOutput>
      revealWord: Adapter<RevealWordInput, RevealWordOutput>
      changeTurn: Adapter<ChangeTurnInput, ChangeTurnOutput>
    }
  }
}

export type ExpressActionResult<R = void> = ActionResult<ExpressEnvironment, R>
export type ExpressAction<I = void, R = void> = Action<ExpressEnvironment, I, R>

export function ask() {
  return askAction<ExpressEnvironment>()
}

const createRequestTransformer = (params: Stringify<GamesModels.CreateGameInput>): GamesModels.CreateGameInput => ({
  language: params.language!,
  userId: params.userId!,
})

const joinRequestTransformer = (params: Stringify<GamesModels.JoinGameInput>): GamesModels.JoinGameInput => ({
  gameId: params.gameId!,
  userId: params.userId!,
})

export const buildExpressEnvironment = (
  config: AppConfig,
  domainEnvironment: DomainEnvironment,
): ExpressEnvironment => ({
  config: {
    port: config.port,
  },
  adapters: {
    gamesDomain: {
      create: buildAdapter(domainEnvironment, gamesDomainPorts.create, createRequestTransformer),
      join: buildAdapter(domainEnvironment, gamesDomainPorts.join, joinRequestTransformer),
      revealWord: buildAdapter(domainEnvironment, gamesDomainPorts.revealWord),
      changeTurn: buildAdapter(domainEnvironment, gamesDomainPorts.changeTurn),
    },
  },
})
