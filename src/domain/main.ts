import { left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, fromEither, map } from "fp-ts/lib/ReaderTaskEither"
import * as GameActions from "../codenames-core/main"
import { CodeNamesGame, Words } from "../codenames-core/models"
import * as GameRules from "../codenames-core/rules"
import { GameMessagingEnvironment } from "../messaging/adapters"
import * as Messages from "../messaging/messages"
import { RepositoriesEnvironment } from "../repositories/adapters"
import { actionErrorOf, actionOf, withEnv } from "../utils/actions"
import { adapt } from "../utils/adapters"
import { ServiceError } from "../utils/errors"
import { UUID } from "../utils/types"
import { DomainEnvironment, DomainPort } from "./adapters"
import { ErrorCodes } from "./errors"

const e = (game: CodeNamesGame) => (v: GameRules.ValidationError | undefined) =>
  v === undefined ? right(game) : left(new ServiceError(v, v))

const checkRules = (rule: GameRules.GameRule): DomainPort<CodeNamesGame, CodeNamesGame> => game =>
  fromEither(e(game)(rule(game)))

const doAction = (action: GameActions.GameAction): DomainPort<CodeNamesGame, CodeNamesGame> => game =>
  fromEither(right(action(game)))

const insertGame = (gameId: string, userId: string): DomainPort<Words, CodeNamesGame> => words =>
  withEnv(
    ({
      config: { boardWidth, boardHeight },
      repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment },
      currentUtcDateTime,
      gameActions,
    }) =>
      adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
        gamesRepositoryPorts.insert(
          gameActions.createGame(
            gameId,
            userId,
            currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"),
            gameActions.buildBoard(boardWidth, boardHeight, words.words),
          ),
        ),
        repositoriesEnvironment,
      ),
  )

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

export const create: DomainPort<Messages.CreateGameInput, Messages.CreateGameOutput> = ({ gameId, userId, language }) =>
  withEnv(({ repositoriesAdapter: { wordsRepositoryPorts, repositoriesEnvironment } }) =>
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
      chain(insertGame(gameId, userId)),
      chain(game => emitMessage(userId, Messages.gameCreated(game))(game)),
    ),
  )

export const join: DomainPort<Messages.JoinGameInput, Messages.JoinGameOutput> = ({ gameId, userId }) =>
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
      chain(game => broadcastMessage(Messages.joinedGame(game))(game)),
    ),
  )

export const joinTeam: DomainPort<Messages.JoinTeamInput, Messages.JoinTeamOutput> = ({ gameId, userId, team }) =>
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

export const startGame: DomainPort<Messages.StartGameInput, Messages.StartGameOutput> = ({ gameId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions, gameRules }) =>
    pipe(
      getGame(gameId),
      chain(checkRules(gameRules.startGame)),
      chain(game => actionOf(gameActions.startGame(game))),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(game => broadcastMessage(Messages.startGame(game))(game)),
    ),
  )

export const sendHint: DomainPort<Messages.SendHintInput, Messages.SendHintOutput> = ({
  gameId,
  userId,
  hintWord,
  hintWordCount,
}) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions, gameRules }) =>
    pipe(
      getGame(gameId),
      chain(checkRules(gameRules.sendHint(userId))),
      chain(game => actionOf(gameActions.sendHint(hintWord, hintWordCount)(game))),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(broadcastMessage(Messages.sendHint({ gameId, userId, hintWord, hintWordCount }))),
    ),
  )

export const revealWord: DomainPort<Messages.RevealWordInput, Messages.RevealWordOutput> = ({
  gameId,
  userId,
  row,
  col,
}) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions, gameRules }) =>
    pipe(
      getGame(gameId),
      chain(checkRules(gameRules.revealWord(row, col, userId))),
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

export const changeTurn: DomainPort<Messages.ChangeTurnInput, Messages.ChangeTurnOutput> = ({ gameId, userId }) =>
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

export const setSpyMaster: DomainPort<Messages.SetSpyMasterInput, Messages.SetSpyMasterOutput> = ({ gameId, userId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions, gameRules }) =>
    pipe(
      getGame(gameId),
      chain(checkRules(gameRules.setSpyMaster(userId))),
      chain(doAction(gameActions.setSpyMaster(userId))),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(broadcastMessage(Messages.setSpyMaster({ gameId, userId }))),
    ),
  )

export const gamesDomainPorts = {
  create,
  join,
  joinTeam,
  setSpyMaster,
  startGame,
  changeTurn,
  sendHint,
  revealWord,
}

export type GamesDomainPorts = typeof gamesDomainPorts
