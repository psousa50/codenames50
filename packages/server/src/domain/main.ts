import { GameModels, GamePort } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import { left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, fromEither, map } from "fp-ts/lib/ReaderTaskEither"
import { actionErrorOf, actionOf, withEnv } from "../utils/actions"
import { adapt } from "../utils/adapters"
import { ServiceError } from "../utils/errors"
import { UUID } from "../utils/types"
import { DomainEnvironment, DomainPort } from "./adapters"
import { ErrorCodes } from "./errors"
import { CreateGameInput } from "./models"

const doAction = (action: GamePort): DomainPort<GameModels.CodeNamesGame, GameModels.CodeNamesGame> => game => {
  const result = action(game)
  return fromEither(typeof result === "string" ? left(new ServiceError(result, result)) : right(result))
}

const emitMessage = (
  userId: string,
  message: Messages.GameMessage,
): DomainPort<GameModels.CodeNamesGame, GameModels.CodeNamesGame> => game =>
  withEnv(({ gameMessagingAdapter: { gameMessagingPorts, gameMessagingEnvironment } }) =>
    pipe(
      adapt(gameMessagingPorts.emitMessage({ userId, roomId: game.gameId, message }), gameMessagingEnvironment),
      map(_ => game),
    ),
  )

const broadcastMessage = (
  message: Messages.GameMessage,
): DomainPort<GameModels.CodeNamesGame, GameModels.CodeNamesGame> => game =>
  withEnv(({ gameMessagingAdapter: { gameMessagingPorts, gameMessagingEnvironment } }) =>
    pipe(
      adapt(gameMessagingPorts.broadcastMessage({ roomId: game.gameId, message }), gameMessagingEnvironment),
      map(_ => game),
    ),
  )

const getGame: DomainPort<UUID, GameModels.CodeNamesGame> = gameId =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment } }) =>
    pipe(
      adapt(gamesRepositoryPorts.getById(gameId), repositoriesEnvironment),
      chain(game =>
        game
          ? actionOf(game)
          : actionErrorOf(new ServiceError(`Game '${gameId}' does not exist`, ErrorCodes.GAME_NOT_FOUND)),
      ),
    ),
  )

const buildBoard: DomainPort<{ language: string; variant: GameModels.GameVariant }, GameModels.WordsBoard> = ({ language, variant }) =>
  withEnv(
    ({
      config: { boardWidth, boardHeight },
      gamePorts,
      repositoriesAdapter: { wordsRepositoryPorts, repositoriesEnvironment },
    }) =>
      pipe(
        adapt(wordsRepositoryPorts.getByLanguage(language), repositoriesEnvironment),
        chain(allWords =>
          allWords
            ? actionOf(allWords)
            : actionErrorOf<DomainEnvironment, GameModels.Words>(
                new ServiceError(`Language '${language}' not found`, ErrorCodes.LANGUAGE_NOT_FOUND),
              ),
        ),
        map(words => gamePorts.buildBoard(boardWidth, boardHeight, words.words, variant)),
      ),
  )

export const create: DomainPort<CreateGameInput> = ({ gameId, userId }) =>
  withEnv(({ currentUtcEpoch, gamePorts, repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment } }) =>
    pipe(
      adapt(
        gamesRepositoryPorts.insert(gamePorts.createGame(gameId, userId, currentUtcEpoch())),
        repositoriesEnvironment,
      ),
      chain(game => emitMessage(userId, Messages.gameCreated(game))(game)),
    ),
  )

export const join: DomainPort<Messages.JoinGameInput> = ({ gameId, userId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gamePorts }) =>
    pipe(
      getGame(gameId),
      map(game => gamePorts.addPlayer(userId)(game)),
      chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
      chain(game => broadcastMessage(Messages.joinedGame({ game, userId }))(game)),
    ),
  )

export const removePlayer: DomainPort<Messages.JoinGameInput> = ({ gameId, userId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gamePorts }) =>
    pipe(
      getGame(gameId),
      map(game => gamePorts.removePlayer(userId)(game)),
      chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
      chain(game => broadcastMessage(Messages.removePlayer({ gameId, userId }))(game)),
    ),
  )

export const restartGame: DomainPort<Messages.RestartGameInput> = ({ gameId, userId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gamePorts }) =>
    pipe(
      getGame(gameId),
      map(game => gamePorts.restartGame(game)),
      chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
      chain(game => broadcastMessage(Messages.restartGame({ gameId, userId }))(game)),
    ),
  )

export const joinTeam: DomainPort<Messages.JoinTeamInput> = ({ gameId, userId, team }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gamePorts }) =>
    pipe(
      getGame(gameId),
      chain(doAction(gamePorts.joinTeam(userId, team))),
      chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
      chain(game => broadcastMessage(Messages.joinTeam({ gameId, userId, team }))(game)),
    ),
  )

export const randomizeTeams: DomainPort<Messages.RandomizeTeamsInput> = ({ gameId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gamePorts }) =>
    pipe(
      getGame(gameId),
      chain(doAction(gamePorts.randomizeTeams())),
      chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
      chain(game => broadcastMessage(Messages.updateGame(game))(game)),
    ),
  )

export const startGame: DomainPort<Messages.StartGameInput> = ({ gameId, config }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gamePorts, currentUtcEpoch }) =>
    pipe(
      getGame(gameId),
      chain(game =>
        pipe(
          buildBoard({ language: config.language || "en", variant: config.variant }),
          chain(board => doAction(gamePorts.startGame(config, board, currentUtcEpoch()))(game)),
        ),
      ),
      chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
      chain(game => broadcastMessage(Messages.gameStarted(game))(game)),
    ),
  )

export const sendHint: DomainPort<Messages.SendHintInput> = ({ gameId, userId, hintWord, hintWordCount }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gamePorts }) =>
    pipe(
      getGame(gameId),
      chain(doAction(gamePorts.sendHint(userId, hintWord, hintWordCount))),
      chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
      chain(broadcastMessage(Messages.hintSent({ gameId, userId, hintWord, hintWordCount }))),
    ),
  )

export const interceptWord: DomainPort<Messages.InterceptWordInput> = ({ gameId, userId, row, col }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gamePorts, currentUtcEpoch }) => {
    const now = currentUtcEpoch()
    return pipe(
      getGame(gameId),
      chain(game => {
        const revealedWord = game.board[row][col]
        const revealedWordTeam =
          revealedWord.type === GameModels.WordType.blue ? GameModels.Teams.blue : 
          revealedWord.type === GameModels.WordType.red ? GameModels.Teams.red : undefined
        const activeTeam = game.turn
        const success = revealedWordTeam === activeTeam
        
        return pipe(
          doAction(gamePorts.interceptWord(userId, row, col))(game),
          chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
          chain(game => pipe(
            broadcastMessage(Messages.wordIntercepted({ gameId, userId, row, col, now, success }))(game),
            chain(() => broadcastMessage(Messages.updateGame(game))(game))
          )),
        )
      }),
    )
  })

export const revealWord: DomainPort<Messages.RevealWordInput> = ({ gameId, userId, row, col }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gamePorts, currentUtcEpoch }) => {
    const now = currentUtcEpoch()
    return pipe(
      getGame(gameId),
      chain(doAction(gamePorts.revealWord(userId, row, col, now))),
      chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
      chain(broadcastMessage(Messages.wordRevealed({ gameId, userId, row, col, now }))),
    )
  })

export const changeTurn: DomainPort<Messages.ChangeTurnInput> = ({ gameId, userId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gamePorts, currentUtcEpoch }) => {
    const now = currentUtcEpoch()
    return pipe(
      getGame(gameId),
      chain(doAction(gamePorts.changeTurn(userId, now))),
      chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
      chain(broadcastMessage(Messages.turnChanged({ gameId, userId, now }))),
    )
  })

export const checkTurnTimeout: DomainPort<Messages.ChangeTurnInput> = ({ gameId, userId }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gamePorts, currentUtcEpoch }) => {
    const now = currentUtcEpoch()
    return pipe(
      getGame(gameId),
      chain(game =>
        gamePorts.checkTurnTimeout(userId, now)(game)
          ? pipe(
              doAction(gamePorts.forceChangeTurn(userId, now))(game),
              chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
              chain(broadcastMessage(Messages.turnChanged({ gameId, userId, now }))),
            )
          : actionOf(game),
      ),
    )
  })

export const setSpyMaster: DomainPort<Messages.SetSpyMasterInput> = ({ gameId, userId, team }) =>
  withEnv(({ repositoriesAdapter: { gamesRepositoryPorts, repositoriesEnvironment }, gamePorts }) =>
    pipe(
      getGame(gameId),
      chain(doAction(gamePorts.setSpyMaster(userId, team))),
      chain(game => adapt(gamesRepositoryPorts.update(game), repositoriesEnvironment)),
      chain(broadcastMessage(Messages.setSpyMaster({ gameId, userId, team }))),
    ),
  )

const timeouts: GameModels.TurnTimeoutConfig[] = [
  {
    timeoutSec: 0,
    description: "No limit",
  },
  {
    timeoutSec: 1 * 60,
    description: "1 minute",
  },
  {
    timeoutSec: 2 * 60,
    description: "2 minutes",
  },
  {
    timeoutSec: 3 * 60,
    description: "3 minutes",
  },
]

export const getLanguages: DomainPort<void, string[]> = () => actionOf(["en", "pt"])
export const getTurnTimeouts: DomainPort<void, GameModels.TurnTimeoutConfig[]> = () => actionOf(timeouts)

export type GameVariantConfig = {
  name: string
  displayName: string
  description: string
}

const variants: GameVariantConfig[] = [
  {
    name: GameModels.GameVariant.classic,
    displayName: "Classic",
    description: "Standard Codenames rules with assassin word"
  },
  {
    name: GameModels.GameVariant.interception,
    displayName: "Interception",
    description: "Equal teams, both teams can intercept, scoring-based victory"
  }
]

export const getVariants: DomainPort<void, GameVariantConfig[]> = () => actionOf(variants)

export const gamesDomainPorts = {
  changeTurn,
  create,
  getLanguages,
  getTurnTimeouts,
  getVariants,
  interceptWord,
  join,
  joinTeam,
  removePlayer,
  revealWord,
  sendHint,
  setSpyMaster,
  startGame,
  randomizeTeams,
  restartGame,
  checkTurnTimeout,
}

export type GamesDomainPorts = typeof gamesDomainPorts
