import { left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, fromEither, map } from "fp-ts/lib/ReaderTaskEither"
import * as GameActions from "../codenames-core/main"
import { CodeNamesGame, Words, WordsBoard } from "../codenames-core/models"
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

export const create: DomainPort<CreateGameInput, Messages.CreateGameOutput> = ({ gameId, userId, language }) =>
  withEnv(
    ({ currentUtcDateTime, gameActions, repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment } }) =>
      pipe(
        buildBoard(language),
        chain(board =>
          actionOf(
            gameActions.createGame(gameId, userId, currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"), language, board),
          ),
        ),
        chain(game => adapt(gamesRepositoryPorts.insert(game), repositoriesEnvironment)),
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
      chain(game => broadcastMessage(Messages.joinedGame({ game, userId }))(game)),
    ),
  )

const resetGame = (language?: string): DomainPort<CodeNamesGame, CodeNamesGame> => game =>
  withEnv(({ currentUtcDateTime, gameActions }) =>
    pipe(
      buildBoard(language || game.language),
      chain(board =>
        actionOf(
          gameActions.resetGame(
            currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"),
            language || game.language,
            board,
          )(game),
        ),
      ),
    ),
  )

export const nextGame: DomainPort<Messages.NextGameInput, Messages.NextGameOutput> = ({ gameId, language }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment } }) =>
    pipe(
      getGame(gameId),
      chain(resetGame(language)),
      chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
      chain(game => broadcastMessage(Messages.nextGame(game))(game)),
    ),
  )

export const removePlayer: DomainPort<Messages.JoinGameInput, Messages.JoinGameOutput> = ({ gameId, userId }) =>
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

export const setSpyMaster: DomainPort<Messages.SetSpyMasterInput, Messages.SetSpyMasterOutput> = ({
  gameId,
  userId,
  team,
}) =>
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
  create,
  join,
  nextGame,
  removePlayer,
  joinTeam,
  setSpyMaster,
  startGame,
  changeTurn,
  sendHint,
  revealWord,
}

export type GamesDomainPorts = typeof gamesDomainPorts
