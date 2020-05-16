import moment from "moment"
import { AppConfig } from "../config"
import { GameMessagingEnvironment } from "../messaging/adapters"
import { GameMessagingPorts, gameMessagingPorts } from "../messaging/main"
import { RepositoriesEnvironment } from "../repositories/adapters"
import { gamesRepositoryPorts, GamesRepositoryPorts } from "../repositories/games"
import { wordsRepositoryPorts, WordsRepositoryPorts } from "../repositories/words"
import { Port } from "../utils/adapters"
import { currentUtcDateTime } from "../utils/dates"

export type DomainConfig = {
  boardWidth: number
  boardHeight: number
}

export type DomainEnvironment = {
  config: DomainConfig
  adapters: {
    gamesRepositoryPorts: GamesRepositoryPorts
    wordsRepositoryPorts: WordsRepositoryPorts
    repositoriesEnvironment: RepositoriesEnvironment
    gameMessagingPorts: GameMessagingPorts
    gameMessagingEnvironment: GameMessagingEnvironment
    currentUtcDateTime: () => moment.Moment
  }
}

export type DomainPort<I = void, R = void> = Port<DomainEnvironment, I, R>

export const buildDomainEnvironment = (
  { boardWidth, boardHeight }: AppConfig,
  repositoriesEnvironment: RepositoriesEnvironment,
  gameMessagingEnvironment: GameMessagingEnvironment,
): DomainEnvironment => ({
  config: {
    boardWidth,
    boardHeight,
  },
  adapters: {
    gamesRepositoryPorts,
    wordsRepositoryPorts,
    repositoriesEnvironment,
    gameMessagingPorts,
    gameMessagingEnvironment,
    currentUtcDateTime: currentUtcDateTime,
  },
})
