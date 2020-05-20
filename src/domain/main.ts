import { left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, fromEither, map } from "fp-ts/lib/ReaderTaskEither"
import * as GameActions from "../game/main"
import { CodeNamesGame, Words } from "../game/models"
import * as GameRules from "../game/rules"
import { GameMessagingEnvironment } from "../messaging/adapters"
import * as messages from "../messaging/messages"
import { GameMessage } from "../messaging/messages"
import { RepositoriesEnvironment } from "../repositories/adapters"
import { actionErrorOf, actionOf, withEnv } from "../utils/actions"
import { adapt } from "../utils/adapters"
import { ServiceError } from "../utils/errors"
import { UUID } from "../utils/types"
import { DomainEnvironment, DomainPort } from "./adapters"
import { ErrorCodes } from "./errors"
import {
  ChangeTurnInput,
  ChangeTurnOutput,
  CreateGameInput,
  CreateGameOutput,
  JoinGameInput,
  JoinGameOutput,
  JoinTeamInput,
  JoinTeamOutput,
  RevealWordInput,
  RevealWordOutput,
  SendHintInput,
  SendHintOutput,
  SetSpyMasterInput,
  SetSpyMasterOutput,
  StartGameInput,
  StartGameOutput,
} from "./models"

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

const emitMessage = (userId: string, message: GameMessage): DomainPort<CodeNamesGame, CodeNamesGame> => game =>
  withEnv(({ gameMessagingAdapter: { gameMessagingPorts, gameMessagingEnvironment } }) =>
    pipe(
      adapt<GameMessagingEnvironment, DomainEnvironment, void>(
        gameMessagingPorts.emitMessage({ userId, roomId: game.gameId, message }),
        gameMessagingEnvironment,
      ),
      map(_ => game),
    ),
  )

const broadcastMessage = (message: GameMessage): DomainPort<CodeNamesGame, CodeNamesGame> => game =>
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

export const create: DomainPort<CreateGameInput, CreateGameOutput> = ({ gameId, userId, language }) =>
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
      chain(game => emitMessage(userId, messages.gameCreated(game))(game)),
    ),
  )

export const join: DomainPort<JoinGameInput, JoinGameOutput> = ({ gameId, userId }) =>
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
      chain(game => broadcastMessage(messages.joinedGame(game))(game)),
    ),
  )

export const joinTeam: DomainPort<JoinTeamInput, JoinTeamOutput> = ({ gameId, userId, team }) =>
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
      chain(game => broadcastMessage(messages.joinTeam({ gameId, userId, team }))(game)),
    ),
  )

export const startGame: DomainPort<StartGameInput, StartGameOutput> = ({ gameId }) =>
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
      chain(game => broadcastMessage(messages.startGame(game))(game)),
    ),
  )

export const sendHint: DomainPort<SendHintInput, SendHintOutput> = ({ gameId, userId, hintWord, hintWordCount }) =>
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
      chain(broadcastMessage(messages.sendHint({ gameId, userId, hintWord, hintWordCount }))),
    ),
  )

export const revealWord: DomainPort<RevealWordInput, RevealWordOutput> = ({ gameId, userId, row, col }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gameActions, gameRules }) =>
    pipe(
      getGame(gameId),
      chain(checkRules(gameRules.revealWord(row, col, userId))),
      chain(game => actionOf(gameActions.revealWord(row, col)(game))),
      chain(game =>
        adapt<RepositoriesEnvironment, DomainEnvironment, CodeNamesGame>(
          gamesRepositoryPorts.update(game),
          repositoriesEnvironment,
        ),
      ),
      chain(broadcastMessage(messages.revealWord({ gameId, userId, row, col }))),
    ),
  )

export const changeTurn: DomainPort<ChangeTurnInput, ChangeTurnOutput> = ({ gameId, userId }) =>
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
      chain(broadcastMessage(messages.changeTurn({ gameId, userId }))),
    ),
  )

export const setSpyMaster: DomainPort<SetSpyMasterInput, SetSpyMasterOutput> = ({ gameId, userId }) =>
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
      chain(broadcastMessage(messages.setSpyMaster({ gameId, userId }))),
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
