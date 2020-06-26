import { GameActions } from "codenames50-core/lib/main"
import { CodeNamesGame } from "codenames50-core/lib/models"
import { GameRules } from "codenames50-core/lib/rules"
import { AppConfig } from "../config"
import { GameMessagingEnvironment } from "../messaging/adapters"
import { GameMessagingPorts } from "../messaging/main"
import { RepositoriesEnvironment } from "../repositories/adapters"
import { GamesRepositoryPorts } from "../repositories/games"
import { WordsRepositoryPorts } from "../repositories/words"
import { Port } from "../utils/adapters"
import { currentUtcEpoch } from "../utils/dates"

export type DomainPort<I = void, R = CodeNamesGame> = Port<DomainEnvironment, I, R>

export const buildDomainEnvironment = (
  { boardWidth, boardHeight }: AppConfig,
  repositoriesEnvironment: RepositoriesEnvironment,
  gamesRepositoryPorts: GamesRepositoryPorts,
  wordsRepositoryPorts: WordsRepositoryPorts,
  gameMessagingEnvironment: GameMessagingEnvironment,
  gameMessagingPorts: GameMessagingPorts,
  gameActions: GameActions,
  gameRules: GameRules,
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
