import { Either, left, right } from "fp-ts/lib/Either"
import { ServiceError } from "../utils/audit"
import { ErrorCodes } from "./errors"
import { CodeNamesGame } from "./models"

type DomainRule = (game: CodeNamesGame) => Either<ServiceError, CodeNamesGame>

const check = (game: CodeNamesGame) => (valid: boolean, message: string, errorCode: ErrorCodes) =>
  valid ? right(game) : left(new ServiceError(message, errorCode))

export const setSpyMaster: DomainRule = game =>
  check(game)(game.spyMaster === undefined, "SpyMaster already set", ErrorCodes.SPY_MASTER_ALREADY_SET)
