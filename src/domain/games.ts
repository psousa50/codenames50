import * as R from "ramda"
import { Action, withEnv, actionOf, actionErrorOf } from "../utils/actions"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, map } from "fp-ts/lib/ReaderTaskEither"
import {
  CodeNamesGame,
  GameStates,
  Teams,
  BoardWord,
  WordType,
  CreateGameInput,
  CreateGameOutput,
  JoinGameInput,
  JoinGameOutput,
  RevealWordInput,
  RevealWordOutput,
} from "./models"
import { ServiceError, ErrorCodes } from "../utils/audit"
import { shuffle } from "../utils/random"
import { update2dCell } from "../utils/collections"

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

const buildBoard = (boardWidth: number, boardHeight: number) => (words: BoardWord[]): BoardWord[][] =>
  R.range(0, boardHeight).map(r => words.slice(r * boardWidth, r * boardWidth + boardWidth))

export const create: Action<CreateGameInput, CreateGameOutput> = ({ userId, language }) =>
  withEnv(({ gamesRepository, wordsRepository, uuid, currentUtcDateTime, config: { boardWidth, boardHeight } }) =>
    pipe(
      wordsRepository.getByLanguage(language),
      chain(allWords =>
        allWords
          ? actionOf(shuffle(allWords.words).slice(0, boardWidth * boardHeight))
          : actionErrorOf<string[]>(new ServiceError("Language not found", ErrorCodes.NOT_FOUND)),
      ),
      map(determineWordTypes),
      map(buildBoard(boardWidth, boardHeight)),
      chain(board =>
        gamesRepository.insert({
          gameId: uuid(),
          timestamp: currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"),
          userId,
          players: [{ userId }],
          state: GameStates.idle,
          turn: Teams.red,
          board,
        }),
      ),
    ),
  )

export const join: Action<JoinGameInput, JoinGameOutput> = ({ gameId, userId }) =>
  withEnv(({ gamesRepository }) =>
    pipe(
      gamesRepository.getById(gameId),
      chain(game =>
        game
          ? actionOf(addPlayer(userId)(game))
          : actionErrorOf<CodeNamesGame>(new ServiceError(`Game '${gameId}' does not exist`, ErrorCodes.NOT_FOUND)),
      ),
      chain(game =>
        pipe(
          gamesRepository.update(game),
          map(_ => game),
        ),
      ),
    ),
  )

const revealOnBoard = (row: number, col: number) => (game: CodeNamesGame) => ({
  ...game,
  board: update2dCell(game.board)(
    w => ({
      ...w,
      revealed: true,
    }),
    row,
    col,
  ),
})

export const revealWord: Action<RevealWordInput, RevealWordOutput> = ({ gameId, row, col }) =>
  withEnv(({ gamesRepository }) =>
    pipe(
      gamesRepository.getById(gameId),
      chain(game =>
        game
          ? actionOf(revealOnBoard(row, col)(game))
          : actionErrorOf<CodeNamesGame>(new ServiceError(`Game '${gameId}' does not exist`, ErrorCodes.NOT_FOUND)),
      ),
      chain(game =>
        pipe(
          gamesRepository.update(game),
          map(_ => game),
        ),
      ),
    ),
  )

export const gamesDomain = {
  create,
  join,
  revealWord,
}

export type GamesDomain = typeof gamesDomain
