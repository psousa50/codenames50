import * as GameActions from "codenames50-core/lib/main"
import { CodeNamesGame, Words, WordsBoard } from "codenames50-core/lib/models"
import * as GameRules from "codenames50-core/lib/rules"
import { left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, fromEither, map } from "fp-ts/lib/ReaderTaskEither"
import { GameMessagingEnvironment } from "../messaging/adapters"
import * as Messages from "codenames50-messaging/lib/messages"
import { RepositoriesEnvironment } from "../repositories/adapters"
import { actionErrorOf, actionOf, withEnv } from "../utils/actions"
import { adapt } from "../utils/adapters"
import { currentUtcDateTime } from "../utils/dates"
import { ServiceError } from "../utils/errors"
import { UUID } from "../utils/types"
import { DomainEnvironment, DomainPort } from "./adapters"
import { ErrorCodes } from "./errors"
import { CreateGameInput } from "./models"

const checkRules = (rule: GameRules.GameRule): DomainPort<CodeNamesGame, CodeNamesGame> => game => {
  const validation = rule(game)
  return fromEither(validation === undefined ? right(game) : left(new ServiceError(validation, validation)))
}

const doAction = (action: GameActions.GameAction): DomainPort<CodeNamesGame, CodeNamesGame> => game =>
  fromEither(right(action(game)))

const emitMessage = (userId: string, message: Messages.GameMessage): DomainPort<CodeNamesGame, CodeNamesGame> => game =>
  withEnv(({ gameMessagingAdapter: { gameMessagingPorts, gameMessagingEnvironment } }) =>
    pipe(
      adapt<GameMessagingEnvironment, DomainEnvironment, void>(
        gameMessagingPorts.emitMessage({ userId, roomId: game.gameId, message }),
        gameMessagingEnvironment,
      ),
      map(_ => game),
    ),
  )

const broadcastMessage = (message: Messages.GameMessage): DomainPort<CodeNamesGame, CodeNamesGame> => game =>
  withEnv(({ gameMessagingAdapter: { gameMessagingPorts, gameMessagingEnvironment } }) =>
    pipe(
      adapt<GameMessagingEnvironment, DomainEnvironment, void>(
        gameMessagingPorts.broadcastMessage({ roomId: game.gameId, message }),
        gameMessagingEnvironment,
      ),
      map(_ => game),
    ),
  )

const getGame: DomainPort<UUID, CodeNamesGame> = gameId =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment } }) =>
    pipe(
      adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame | null>(
        gamesRepositoryPorts.getById(gameId),
        repositoriesEnvironment,
      ),
      chain(game =>
        game
          ? actionOf(game)
          : actionErrorOf(new ServiceError(`Game '${gameId}' does not exist`, ErrorCodes.GAME_NOT_FOUND)),
      ),
    ),
  )

const buildBoard: DomainPort<string, WordsBoard> = language =>
  withEnv(
    ({
      config: { boardWidth, boardHeight },
      gameActions,
      repositoriesAdapter: { wordsRepositoryPorts, repositoriesEnvironment },
    }) =>
      pipe(
        adapt<RepositoriesEnvironment, DomainEnvironment, Words | null>(
          wordsRepositoryPorts.getByLanguage(language),
          repositoriesEnvironment,
        ),
        chain(allWords =>
          allWords
            ? actionOf(allWords)
            : actionErrorOf<DomainEnvironment, Words>(
                new ServiceError(`Language '${language}' not found`, ErrorCodes.LANGUAGE_NOT_FOUND),
              ),
        ),
        chain(words => actionOf(gameActions.buildBoard(boardWidth, boardHeight, words.words))),
      ),
  )

export const create: DomainPort<CreateGameInput> = ({ gameId, userId }) =>
  withEnv(
    ({ currentUtcDateTime, gameActions, repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment } }) =>
      pipe(
        actionOf(gameActions.createGame(gameId, userId, currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"))),
        chain(game => adapt(gamesRepositoryPorts.insert(game), repositoriesEnvironment)),
        chain(game => emitMessage(userId, Messages.gameCreated(game))(game)),
      ),
  )

export const join: DomainPort<Messages.JoinGameInput> = ({ gameId, userId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions }) =>
    pipe(
      getGame(gameId),
      chain(game => actionOf(gameActions.addPlayer(userId)(game))),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(game => broadcastMessage(Messages.joinedGame({ game, userId }))(game)),
    ),
  )

export const removePlayer: DomainPort<Messages.JoinGameInput> = ({ gameId, userId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions }) =>
    pipe(
      getGame(gameId),
      chain(game => actionOf(gameActions.removePlayer(userId)(game))),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(game => broadcastMessage(Messages.removePlayer({ gameId, userId }))(game)),
    ),
  )

export const restartGame: DomainPort<Messages.RestartGameInput> = ({ gameId, userId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions }) =>
    pipe(
      getGame(gameId),
      chain(game => actionOf(gameActions.restartGame(game))),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(game => broadcastMessage(Messages.restartGame({ gameId, userId }))(game)),
    ),
  )

export const joinTeam: DomainPort<Messages.JoinTeamInput> = ({ gameId, userId, team }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions, gameRules }) =>
    pipe(
      getGame(gameId),
      chain(checkRules(gameRules.joinTeam)),
      chain(game => actionOf(gameActions.joinTeam(userId, team)(game))),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(game => broadcastMessage(Messages.joinTeam({ gameId, userId, team }))(game)),
    ),
  )

export const randomizeTeams: DomainPort<Messages.RandomizeTeamsInput> = ({ gameId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions, gameRules }) =>
    pipe(
      getGame(gameId),
      chain(checkRules(gameRules.randomizeTeams)),
      chain(game => actionOf(gameActions.randomizeTeams(game))),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(game => broadcastMessage(Messages.updateGame(game))(game)),
    ),
  )

export const startGame: DomainPort<Messages.StartGameInput> = ({ gameId, config }) =>
  withEnv(
    ({
      repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment },
      gameActions,
      gameRules,
      currentUtcDateTime,
    }) =>
      pipe(
        getGame(gameId),
        chain(checkRules(gameRules.startGame(config))),
        chain(game =>
          pipe(
            buildBoard(config.language!),
            chain(board =>
              actionOf(gameActions.startGame(config, currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"), board)(game)),
            ),
          ),
        ),
        chain(game =>
          adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
            gamesRepositoryPorts.update(game),
            repositoriesEnvironment,
          ),
        ),
        chain(game => broadcastMessage(Messages.gameStarted(game))(game)),
      ),
  )

export const sendHint: DomainPort<Messages.SendHintInput> = ({ gameId, userId, hintWord, hintWordCount }) => {
  const hintWordStartedTime = currentUtcDateTime().toDate().getTime()
  return withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions, gameRules }) =>
    pipe(
      getGame(gameId),
      chain(checkRules(gameRules.sendHint(userId))),
      chain(game => actionOf(gameActions.sendHint(hintWord, hintWordCount, hintWordStartedTime)(game))),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(broadcastMessage(Messages.hintSent({ gameId, userId, hintWord, hintWordCount, hintWordStartedTime }))),
    ),
  )
}
export const revealWord: DomainPort<Messages.RevealWordInput> = ({ gameId, userId, row, col }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions, gameRules }) =>
    pipe(
      getGame(gameId),
      chain(checkRules(gameRules.revealWord(userId, row, col))),
      chain(game => actionOf(gameActions.revealWord(userId, row, col)(game))),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(broadcastMessage(Messages.revealWord({ gameId, userId, row, col }))),
    ),
  )

export const changeTurn: DomainPort<Messages.ChangeTurnInput> = ({ gameId, userId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions, gameRules }) =>
    pipe(
      getGame(gameId),
      chain(checkRules(gameRules.changeTurn(userId))),
      chain(doAction(gameActions.changeTurn)),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(broadcastMessage(Messages.changeTurn({ gameId, userId }))),
    ),
  )

export const turnTimeout: DomainPort<Messages.ChangeTurnInput> = ({ gameId, userId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions }) =>
    pipe(
      getGame(gameId),
      chain(doAction(gameActions.turnTimeout)),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(broadcastMessage(Messages.turnTimeout({ gameId, userId }))),
    ),
  )

export const setSpyMaster: DomainPort<Messages.SetSpyMasterInput> = ({ gameId, userId, team }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions, gameRules }) =>
    pipe(
      getGame(gameId),
      chain(checkRules(gameRules.setSpyMaster(team))),
      chain(doAction(gameActions.setSpyMaster(userId, team))),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(broadcastMessage(Messages.setSpyMaster({ gameId, userId, team }))),
    ),
  )

export const gamesDomainPorts = {
  changeTurn,
  create,
  join,
  joinTeam,
  removePlayer,
  revealWord,
  sendHint,
  setSpyMaster,
  startGame,
  randomizeTeams,
  restartGame,
  turnTimeout,
}

export type GamesDomainPorts = typeof gamesDomainPorts
