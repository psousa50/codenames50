import { Action, withEnv, actionOf, actionErrorOf } from "../utils/actions"
import { UUID } from "../utils/types"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, map } from "fp-ts/lib/ReaderTaskEither"
import { CodeNameGame, GameStates, Teams, BoardWord, WordType } from "./models"
import { ServiceError, ErrorCodes } from "../utils/audit"
import { shuffle } from "../utils/random"

export interface CreateInput {
  userId: string
  language: string
}

export interface CreateOutput {
  gameId: UUID
}

export interface JoinInput {
  gameId: string
  userId: string
}

export interface JoinOutput {
  gameId: string
}

const addPlayer = (userId: string) => (game: CodeNameGame) => ({
  ...game,
  players: [...game.players, { userId }],
})

const determineWordTypes = (words: string[]): BoardWord[] => {
  const numberOfWordsForTeams = Math.max(0, Math.floor((words.length - 1) / 3))
  const numberOfWordsForInocents = Math.max(words.length - 1 - numberOfWordsForTeams * 2, 0)
  const types = [
    ...new Array(numberOfWordsForTeams).fill(WordType.red),
    ...new Array(numberOfWordsForTeams).fill(WordType.blue),
    ...new Array(numberOfWordsForInocents).fill(WordType.inocent),
    WordType.assassin,
  ]

  return shuffle(words.map((word, i) => ({ word, type: types[i], revealed: false })))
}

export const create: Action<CreateInput, CreateOutput> = req => {
  const userId = req.userId

  return withEnv(env =>
    pipe(
      env.wordsRepository.getByLanguage(req.language),
      chain(allWords =>
        allWords
          ? actionOf(allWords.words.slice(0, env.config.numberOfWords))
          : actionErrorOf<string[]>(new ServiceError("Language not found", ErrorCodes.NOT_FOUND)),
      ),
      map(determineWordTypes),
      chain(board =>
        env.gamesRepository.insert({
          gameId: env.uuid(),
          timestamp: env.currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"),
          userId,
          players: [{ userId }],
          state: GameStates.idle,
          turn: Teams.red,
          board,
        }),
      ),
      map(gameId => ({ gameId })),
    ),
  )
}

export const join: Action<JoinInput, JoinOutput> = req => {
  const gameId = req.gameId
  const userId = req.userId

  return withEnv(env =>
    pipe(
      env.gamesRepository.getById(gameId),
      chain(game => actionOf(addPlayer(userId)(game!))),
      chain(env.gamesRepository.update),
      map(_ => ({ gameId, userId })),
    ),
  )
}
