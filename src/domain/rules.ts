import { chain, Either, left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { ServiceError } from "../utils/errors"
import { ErrorCodes } from "./errors"
import { CodeNamesGame, GameStates } from "./models"

type GameRuleOutcome = Either<ServiceError, CodeNamesGame>
export type GameRule = (game: CodeNamesGame) => GameRuleOutcome

const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

const check = (valid: boolean, message: string, errorCode: ErrorCodes) => (game: CodeNamesGame) =>
  valid ? right(game) : left(new ServiceError(message, errorCode))

const gameIsRunning = (game: CodeNamesGame) =>
  check(game.state !== GameStates.running, "Game is not Running", ErrorCodes.GAME_IS_NOT_RUNNING)(game)

const playersTurn = (userId: string): GameRule => game =>
  check(game.turn === getPlayer(game, userId)?.team, "Not player's turn", ErrorCodes.NOT_PLAYERS_TURN)(game)

export const setSpyMaster: GameRule = game =>
  pipe(
    gameIsRunning(game),
    chain(check(game.spyMaster === undefined, "SpyMaster already set", ErrorCodes.SPY_MASTER_ALREADY_SET)),
  )

export const changeTurn = (userId: string): GameRule => game =>
  pipe(
    gameIsRunning(game),
    chain(playersTurn(userId)),
    chain(check(game.spyMaster === undefined, "SpyMaster already set", ErrorCodes.SPY_MASTER_ALREADY_SET)),
  )
