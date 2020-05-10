import { Action, withEnv, actionOf, actionErrorOf } from "../utils/actions"
import { UUID } from "../utils/types"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, map } from "fp-ts/lib/ReaderTaskEither"
import { CodeNameGame, GameStates, Teams, NewCodeNameGame } from "../repositories/games"
import { ServiceError, ErrorCodes } from "../utils/audit"
import { shuffle } from "../utils/random"

export interface CreateRequest {
  userId: string
  language: string
}

export interface CreateResponse {
  gameId: UUID
}

export interface JoinRequest {
  gameId: string
  userId: string
}

const addPlayer = (userId: string) => (game: CodeNameGame) => ({
  ...game,
  players: [...game.players, { userId }],
})

export const create: Action<CreateRequest, CreateResponse> = req => {
  const userId = req.userId
  const newGame: NewCodeNameGame = {
    userId,
    players: [{ userId }],
    state: GameStates.idle,
    turn: Teams.red,
    words: [],
  }

  return withEnv(env =>
    pipe(
      env.wordsRepository.getByLanguage(req.language),
      chain(allWords =>
        allWords
          ? actionOf(shuffle(allWords.words).slice(0, env.config.numberOfWords))
          : actionErrorOf<string[]>(new ServiceError("Language not found", ErrorCodes.NOT_FOUND)),
      ),
      chain(words =>
        env.gamesRepository.insert({
          ...newGame,
          words,
          gameId: env.uuid(),
          timestamp: env.currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"),
        }),
      ),
      map(gameId => ({ gameId })),
    ),
  )
}

export const join: Action<JoinRequest, void> = req => {
  const gameId = req.gameId
  const userId = req.userId

  return withEnv(env =>
    pipe(
      env.gamesRepository.getById(gameId),
      chain(game => actionOf(addPlayer(userId)(game!))),
      chain(env.gamesRepository.update),
    ),
  )
}
