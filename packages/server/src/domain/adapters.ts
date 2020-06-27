import { GameActions, GameModels, GameRules } from "@codenames50/core"
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
  { boardWidth, boardHeight }: AppConfig,
  repositoriesEnvironment: RepositoriesEnvironment,
  gamesRepositoryPorts: GamesRepositoryPorts,
  wordsRepositoryPorts: WordsRepositoryPorts,
  gameMessagingEnvironment: GameMessagingEnvironment,
  gameMessagingPorts: GameMessagingPorts,
  gameActions: GameActions.GameActions,
  gameRules: GameRules.GameRules,
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
  gameActions,
  gameRules,
  currentUtcEpoch,
})

export type DomainEnvironment = ReturnType<typeof buildDomainEnvironment>