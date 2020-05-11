import { Action, withEnv, actionOf, actionErrorOf } from "../utils/actions"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, map } from "fp-ts/lib/ReaderTaskEither"
import {
  CodeNamesGame,
  GameStates,
  Teams,
  BoardWord,
  WordType,
  CreateInput,
  CreateOutput,
  JoinInput,
  JoinOutput,
} from "./models"
import { ServiceError, ErrorCodes } from "../utils/audit"
import { shuffle } from "../utils/random"

const addPlayer = (userId: string) => (game: CodeNamesGame) =>
  game.players.find(p => p.userId === userId)
    ? game
    : {
        ...game,
        players: [...game.players, { userId }],
      }

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

export const create: Action<CreateInput, CreateOutput> = input => {
  console.log("=====>\n", input)
  const userId = input.userId

  return withEnv(env =>
    pipe(
      env.wordsRepository.getByLanguage(input.language),
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
    ),
  )
}

export const join: Action<JoinInput, JoinOutput> = input => {
  const gameId = input.gameId
  const userId = input.userId

  return withEnv(env =>
    pipe(
      env.gamesRepository.getById(gameId),
      chain(game =>
        game
          ? actionOf(addPlayer(userId)(game))
          : actionErrorOf<CodeNamesGame>(new ServiceError(`Game '${gameId}' does not exist`, ErrorCodes.NOT_FOUND)),
      ),
      chain(env.gamesRepository.update),
      map(_ => ({ gameId, userId })),
    ),
  )
}
