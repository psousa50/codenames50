import moment from "moment"
import { v4 as uuidv4 } from "uuid"
import { Stringify } from "../app/routes/transformers"
import { AppConfig } from "../config"
import * as GamesModels from "../domain/models"
import { RepositoriesEnvironment } from "../repositories/adapters"
import { gamesRepositoryPorts } from "../repositories/games"
import { wordsRepositoryPorts } from "../repositories/words"
import { Adapter, buildAdapter, Port, portToAdapter } from "../utils/adapters"
import { currentUtcDateTime } from "../utils/dates"
import { gamesDomainPorts } from "./games"
import {
  ChangeTurnInput,
  ChangeTurnOutput,
  CreateGameInput,
  CreateGameOutput,
  JoinGameInput,
  JoinGameOutput,
  RevealWordInput,
  RevealWordOutput,
} from "./models"

export type DomainConfig = {
  boardWidth: number
  boardHeight: number
}

export type GamesDomainAdapters = {
  create: Adapter<CreateGameInput, CreateGameOutput>
  join: Adapter<JoinGameInput, JoinGameOutput>
  revealWord: Adapter<RevealWordInput, RevealWordOutput>
  changeTurn: Adapter<ChangeTurnInput, ChangeTurnOutput>
}

const createRequestTransformer = (params: Stringify<GamesModels.CreateGameInput>): GamesModels.CreateGameInput => ({
  language: params.language!,
  userId: params.userId!,
})

const joinRequestTransformer = (params: Stringify<GamesModels.JoinGameInput>): GamesModels.JoinGameInput => ({
  gameId: params.gameId!,
  userId: params.userId!,
})

export const buildGamesDomainAdapters = (domainEnvironment: DomainEnvironment) => ({
  create: buildAdapter(domainEnvironment, gamesDomainPorts.create, createRequestTransformer),
  join: buildAdapter(domainEnvironment, gamesDomainPorts.join, joinRequestTransformer),
  revealWord: buildAdapter(domainEnvironment, gamesDomainPorts.revealWord),
  changeTurn: buildAdapter(domainEnvironment, gamesDomainPorts.changeTurn),
})

const gamesRepositoryAdapters = {
  insert: portToAdapter(gamesRepositoryPorts.insert),
  update: portToAdapter(gamesRepositoryPorts.update),
  getById: portToAdapter(gamesRepositoryPorts.getById),
}

const wordsRepositoryAdapters = {
  insert: portToAdapter(wordsRepositoryPorts.insert),
  getByLanguage: portToAdapter(wordsRepositoryPorts.getByLanguage),
}

export type DomainEnvironment = {
  config: DomainConfig
  adapters: {
    gamesRepository: typeof gamesRepositoryAdapters
    wordsRepository: typeof wordsRepositoryAdapters
    uuid: () => string
    currentUtcDateTime: () => moment.Moment
  }
}

export type DomainPort<I = void, R = void> = Port<DomainEnvironment, I, R>

export const buildDomainEnvironment = (
  { boardWidth, boardHeight }: AppConfig,
  repositoriesEnvironment: RepositoriesEnvironment,
): DomainEnvironment => ({
  config: {
    boardWidth,
    boardHeight,
  },
  adapters: {
    gamesRepository: {
      insert: buildAdapter(repositoriesEnvironment, gamesRepositoryPorts.insert),
      update: buildAdapter(repositoriesEnvironment, gamesRepositoryPorts.update),
      getById: buildAdapter(repositoriesEnvironment, gamesRepositoryPorts.getById),
    },
    wordsRepository: {
      insert: buildAdapter(repositoriesEnvironment, wordsRepositoryPorts.insert),
      getByLanguage: buildAdapter(repositoriesEnvironment, wordsRepositoryPorts.getByLanguage),
    },
    uuid: uuidv4,
    currentUtcDateTime: currentUtcDateTime,
  },
})
