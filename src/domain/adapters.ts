import { AppConfig } from "../config"
import { GameMessagingEnvironment } from "../messaging/adapters"
import { gameMessagingPorts } from "../messaging/main"
import { RepositoriesEnvironment } from "../repositories/adapters"
import { gamesRepositoryPorts } from "../repositories/games"
import { wordsRepositoryPorts } from "../repositories/words"
import { Port } from "../utils/adapters"
import { currentUtcDateTime } from "../utils/dates"

export type DomainPort<I = void, R = void> = Port<DomainEnvironment, I, R>

export const buildDomainEnvironment = (
  { boardWidth, boardHeight }: AppConfig,
  repositoriesEnvironment: RepositoriesEnvironment,
  gameMessagingEnvironment: GameMessagingEnvironment,
) => ({
  config: {
    boardWidth,
    boardHeight,
  },
  repositoriesAdapter: {
    gamesRepositoryPorts,
    wordsRepositoryPorts,
    repositoriesEnvironment,
  },
  gameMessagingAdapter: {
    gameMessagingPorts,
    gameMessagingEnvironment,
  },
  currentUtcDateTime: currentUtcDateTime,
})

export type DomainEnvironment = ReturnType<typeof buildDomainEnvironment>
