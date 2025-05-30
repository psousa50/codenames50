import { GameModels, GamePort } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import { left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, fromEither, map } from "fp-ts/lib/ReaderTaskEither"
import { actionErrorOf, actionOf, withEnv } from "../utils/actions"
import { adaptMessagingToDomain, adaptRepositoryToDomain } from "../utils/adapters"
import { ServiceError } from "../utils/errors"
import { UUID } from "../utils/types"
import { DomainEnvironment, DomainPort } from "./adapters"
import { ErrorCodes } from "./errors"
import { CreateGameInput } from "./models"

// Import these at the top level to access them in the withEnv callbacks
// import { gamesRepositoryPorts } from "../repositories/games" // Cascade: Refactored to use env
// import { wordsRepositoryPorts } from "../repositories/words" // Cascade: Refactored to use env
// import { gameMessagingPorts } from "../messaging/main" // Cascade: Refactored to use env
import { gamePorts } from "@codenames50/core"

const doAction = (action: GamePort): DomainPort<GameModels.CodeNamesGame, GameModels.CodeNamesGame> => game => {
  const result = action(game)
  return fromEither(typeof result === "string" ? left(new ServiceError(result, result)) : right(result))
}

const emitMessage = (
  userId: string,
  message: Messages.GameMessage,
): DomainPort<GameModels.CodeNamesGame, GameModels.CodeNamesGame> => game =>
  withEnv((env) =>
    pipe(
      adaptMessagingToDomain(env.gameMessagingAdapter.gameMessagingPorts.emitMessage({ userId, roomId: game.gameId, message }), env),
      map(_ => game),
    ),
  )

const broadcastMessage = (
  message: Messages.GameMessage,
): DomainPort<GameModels.CodeNamesGame, GameModels.CodeNamesGame> => game =>
  withEnv((env) =>
    pipe(
      adaptMessagingToDomain(env.gameMessagingAdapter.gameMessagingPorts.broadcastMessage({ roomId: game.gameId, message }), env),
      map(_ => game),
    ),
  )

const getGame: DomainPort<UUID, GameModels.CodeNamesGame> = gameId =>
  withEnv((env) =>
    pipe(
      adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.getById(gameId), env),
      chain(game =>
        game
          ? actionOf(game)
          : actionErrorOf(new ServiceError(`Game '${gameId}' does not exist`, ErrorCodes.GAME_NOT_FOUND)),
      ),
    ),
  )

const buildBoard: DomainPort<{ language: string; variant: GameModels.GameVariant }, GameModels.WordsBoard> = ({ language, variant }) =>
  withEnv(
    (env) =>
      pipe(
        adaptRepositoryToDomain(env.repositoriesAdapter.wordsRepositoryPorts.getByLanguage(language), env),
        chain(allWords =>
          allWords
            ? actionOf(allWords)
            : actionErrorOf<DomainEnvironment, GameModels.Words>(
                new ServiceError(`Language '${language}' not found`, ErrorCodes.LANGUAGE_NOT_FOUND),
              ),
        ),
        map(words => gamePorts.buildBoard(env.config.boardWidth, env.config.boardHeight, words.words, variant)),
      ),
  )

export const create: DomainPort<CreateGameInput> = ({ gameId, userId }) =>
  withEnv((env) =>
    pipe(
      adaptRepositoryToDomain(
        env.repositoriesAdapter.gamesRepositoryPorts.insert(env.gamePorts.createGame(gameId, userId, env.currentUtcEpoch())),
        env
      ),
      chain(game => emitMessage(userId, Messages.gameCreated(game))(game)),
    ),
  )

export const join: DomainPort<Messages.JoinGameInput> = ({ gameId, userId }) =>
  withEnv((env) =>
    pipe(
      getGame(gameId),
      map(game => env.gamePorts.addPlayer(userId)(game)),
      chain(game => adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.update(game), env)),
      chain(game => broadcastMessage(Messages.joinedGame({ game, userId }))(game)),
    ),
  )

export const removePlayer: DomainPort<Messages.JoinGameInput> = ({ gameId, userId }) =>
  withEnv((env) =>
    pipe(
      getGame(gameId),
      map(game => env.gamePorts.removePlayer(userId)(game)),
      chain(game => adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.update(game), env)),
      chain(game => broadcastMessage(Messages.removePlayer({ gameId, userId }))(game)),
    ),
  )

export const restartGame: DomainPort<Messages.RestartGameInput> = ({ gameId, userId }) =>
  withEnv((env) =>
    pipe(
      getGame(gameId),
      map(game => env.gamePorts.restartGame(game)),
      chain(game => adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.update(game), env)),
      chain(game => broadcastMessage(Messages.restartGame({ gameId, userId }))(game)),
    ),
  )

export const joinTeam: DomainPort<Messages.JoinTeamInput> = ({ gameId, userId, team }) =>
  withEnv((env) =>
    pipe(
      getGame(gameId),
      chain(doAction(env.gamePorts.joinTeam(userId, team))),
      chain(game => adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.update(game), env)),
      chain(game => broadcastMessage(Messages.joinTeam({ gameId, userId, team }))(game)),
    ),
  )

export const randomizeTeams: DomainPort<Messages.RandomizeTeamsInput> = ({ gameId }) =>
  withEnv((env) =>
    pipe(
      getGame(gameId),
      chain(doAction(env.gamePorts.randomizeTeams())),
      chain(game => adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.update(game), env)),
      chain(game => broadcastMessage(Messages.updateGame(game))(game)),
    ),
  )

export const startGame: DomainPort<Messages.StartGameInput> = ({ gameId, config }) =>
  withEnv((env) =>
    pipe(
      getGame(gameId),
      chain(game =>
        pipe(
          buildBoard({ language: config.language || "en", variant: config.variant }),
          chain(board => doAction(env.gamePorts.startGame(config, board, env.currentUtcEpoch()))(game)),
        ),
      ),
      chain(game => adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.update(game), env)),
      chain(game => broadcastMessage(Messages.gameStarted(game))(game)),
    ),
  )

export const sendHint: DomainPort<Messages.SendHintInput> = ({ gameId, userId, hintWord, hintWordCount }) =>
  withEnv((env) =>
    pipe(
      getGame(gameId),
      chain(doAction(env.gamePorts.sendHint(userId, hintWord, hintWordCount))),
      chain(game => adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.update(game), env)),
      chain(broadcastMessage(Messages.hintSent({ gameId, userId, hintWord, hintWordCount }))),
    ),
  )

export const interceptWord: DomainPort<Messages.InterceptWordInput> = ({ gameId, userId, row, col }) =>
  withEnv((env) => {
    const now = env.currentUtcEpoch()
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
          doAction(env.gamePorts.interceptWord(userId, row, col))(game),
          chain(game => adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.update(game), env)),
          chain(game => pipe(
            broadcastMessage(Messages.wordIntercepted({ gameId, userId, row, col, now, success }))(game),
            chain(() => broadcastMessage(Messages.updateGame(game))(game))
          )),
        )
      }),
    )
  })

export const revealWord: DomainPort<Messages.RevealWordInput> = ({ gameId, userId, row, col }) =>
  withEnv((env) => {
    const now = env.currentUtcEpoch()
    return pipe(
      getGame(gameId),
      chain(doAction(env.gamePorts.revealWord(userId, row, col, now))),
      chain(game => adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.update(game), env)),
      chain(broadcastMessage(Messages.wordRevealed({ gameId, userId, row, col, now }))),
    )
  })

export const changeTurn: DomainPort<Messages.ChangeTurnInput> = ({ gameId, userId }) =>
  withEnv((env) => {
    const now = env.currentUtcEpoch()
    return pipe(
      getGame(gameId),
      chain(doAction(env.gamePorts.changeTurn(userId, now))),
      chain(game => adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.update(game), env)),
      chain(broadcastMessage(Messages.turnChanged({ gameId, userId, now }))),
    )
  })

export const checkTurnTimeout: DomainPort<Messages.CheckTurnTimeoutInput> = ({ gameId, userId }) =>
  withEnv((env) => {
    const now = env.currentUtcEpoch()
    return pipe(
      getGame(gameId),
      chain(game =>
        env.gamePorts.checkTurnTimeout(userId, now)(game)
          ? pipe(
              doAction(env.gamePorts.forceChangeTurn(userId, now))(game),
              chain(game => adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.update(game), env)),
              chain(broadcastMessage(Messages.turnChanged({ gameId, userId, now }))),
            )
          : actionOf(game),
      ),
    )
  })

export const setSpyMaster: DomainPort<Messages.SetSpyMasterInput> = ({ gameId, userId, team }) =>
  withEnv((env) =>
    pipe(
      getGame(gameId),
      chain(doAction(env.gamePorts.setSpyMaster(userId, team))),
      chain(game => adaptRepositoryToDomain(env.repositoriesAdapter.gamesRepositoryPorts.update(game), env)),
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
