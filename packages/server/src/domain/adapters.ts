import { GamePorts, GameModels } from "@codenames50/core"
import { AppConfig } from "../config"
import { GameMessagingEnvironment } from "../messaging/adapters"
import { GameMessagingPorts } from "../messaging/main"
import { RepositoriesEnvironment } from "../repositories/adapters"
import { GamesRepositoryPorts } from "../repositories/games"
import { WordsRepositoryPorts } from "../repositories/words"
import { Port } from "../utils/adapters"
import { currentUtcEpoch } from "../utils/dates"

export type DomainPort<I = void, R = GameModels.CodeNamesGame> = Port<DomainEnvironment, I, R>

export const buildDomainEnvironment = (
  config: AppConfig,
  repositoriesEnvironment: RepositoriesEnvironment,
  gamesRepositoryPorts: GamesRepositoryPorts,
  wordsRepositoryPorts: WordsRepositoryPorts,
  gameMessagingEnvironment: GameMessagingEnvironment,
  gameMessagingPorts: GameMessagingPorts,
  gamePorts: GamePorts,
) => ({
  config,
  repositoriesAdapter: {
    gamesRepositoryPorts,
    wordsRepositoryPorts,
    repositoriesEnvironment,
  },
  gameMessagingAdapter: {
    gameMessagingPorts,
    gameMessagingEnvironment,
  },
  gamePorts,
  currentUtcEpoch,
})

export type DomainEnvironment = ReturnType<typeof buildDomainEnvironment>
