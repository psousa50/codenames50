import { Collections, Random } from "@psousa50/shared"
import * as R from "ramda"
import { getPlayer, otherTeam } from "./helpers"
import { BoardWord, CodeNamesGame, GameConfig, GameStates, Teams, WordsBoard, WordType, GameVariant } from "./models"

export type GameAction = (game: CodeNamesGame) => CodeNamesGame

const nullAction = (game: CodeNamesGame) => game
const conditionalAction = (v: boolean, action: GameAction) => (v ? action : nullAction)
const act = (actions: GameAction[]) => (game: CodeNamesGame) => actions.reduce((acc, action) => action(acc), game)

export const restartGame: GameAction = game => ({
  ...game,
  state: GameStates.idle,
  hintWord: "",
  hintWordCount: 0,
  wordsRevealedCount: 0,
  interceptPhase: false,
  interceptUsed: false,
  interceptingTeam: undefined,
  redTeam: {
    ...game.redTeam,
    score: 0,
  },
  blueTeam: {
    ...game.blueTeam,
    score: 0,
  },
})

export const addPlayer =
  (userId: string): GameAction =>
  game => {
    const teamRedCount = game.players.filter(p => p.team === Teams.red).length
    const teamBlueCount = game.players.filter(p => p.team === Teams.blue).length
    const team =
      game.redTeam.spyMaster === userId
        ? Teams.red
        : game.blueTeam.spyMaster === userId
          ? Teams.blue
          : teamBlueCount < teamRedCount
            ? Teams.blue
            : Teams.red

    return game.players.find(p => p.userId === userId)
      ? game
      : {
          ...game,
          players: [...game.players, { userId, team }],
        }
  }

export const removePlayer =
  (userId: string): GameAction =>
  game => {
    return {
      ...game,
      players: game.players.filter(p => p.userId !== userId),
    }
  }

export const joinTeam =
  (userId: string, team: Teams): GameAction =>
  game => {
    const player = getPlayer(game, userId)
    return player
      ? {
          ...game,
          players: game.players.map(p => (p.userId === userId ? { ...p, team } : p)),
          blueTeam: {
            ...game.blueTeam,
            spyMaster: team === Teams.red && game.blueTeam.spyMaster === userId ? undefined : game.blueTeam.spyMaster,
          },
          redTeam: {
            ...game.redTeam,
            spyMaster: team === Teams.blue && game.redTeam.spyMaster === userId ? undefined : game.redTeam.spyMaster,
          },
        }
      : game
  }

export const setSpyMaster =
  (userId: string, team: Teams): GameAction =>
  game => ({
    ...game,
    redTeam: {
      ...game.redTeam,
      spyMaster: team === Teams.red ? userId : game.redTeam.spyMaster === userId ? undefined : game.redTeam.spyMaster,
    },
    blueTeam: {
      ...game.blueTeam,
      spyMaster:
        team === Teams.blue ? userId : game.blueTeam.spyMaster === userId ? undefined : game.blueTeam.spyMaster,
    },
    players: game.players.map(p => (p.userId === userId ? { ...p, team } : p)),
  })

export const randomizeTeams: GameAction = game => {
  const middle = Math.floor(game.players.length / 2)
  const randomizedPlayers = Random.shuffle(game.players).map((p, i) => ({
    ...p,
    team: i < middle ? Teams.red : Teams.blue,
  }))

  return {
    ...game,
    players: randomizedPlayers,
    redTeam: {
      ...game.redTeam,
      spyMaster: undefined,
    },
    blueTeam: {
      ...game.blueTeam,
      spyMaster: undefined,
    },
  }
}

const countTypes = (board: WordsBoard, type: WordType) => R.flatten(board).filter(w => w.type === type).length

export const startGame =
  (config: GameConfig, board: WordsBoard, now: number): GameAction =>
  game => {
    const redWordsLeft = countTypes(board, WordType.red)
    const blueWordsLeft = countTypes(board, WordType.blue)
    return {
      ...game,
      gameStartedTime: now,
      config,
      state: GameStates.running,
      turn: redWordsLeft > blueWordsLeft ? Teams.red : Teams.blue,
      redTeam: {
        ...game.redTeam,
        wordsLeft: redWordsLeft,
      },
      blueTeam: {
        ...game.blueTeam,
        wordsLeft: blueWordsLeft,
      },
      turnCount: 0,
      turnTimeoutSec: config.turnTimeoutSec ? config.turnTimeoutSec + 60 : undefined,
      turnStartedTime: now,
      board,
    }
  }

export const sendHint =
  (hintWord: string, hintWordCount: number): GameAction =>
  game => ({
    ...game,
    hintWord,
    hintWordCount,
    wordsRevealedCount: 0,
    interceptPhase: true,
    interceptUsed: false,
    interceptingTeam: game.turn === Teams.red ? Teams.blue : Teams.red,
  })

const decreaseWordsLeft =
  (team?: Teams): GameAction =>
  game => ({
    ...game,
    blueTeam: {
      ...game.blueTeam,
      wordsLeft: (game.blueTeam.wordsLeft || 0) - (team === Teams.blue ? 1 : 0),
    },
    redTeam: {
      ...game.redTeam,
      wordsLeft: (game.redTeam.wordsLeft || 0) - (team === Teams.red ? 1 : 0),
    },
  })

const increaseScore =
  (team?: Teams): GameAction =>
  game => ({
    ...game,
    blueTeam: {
      ...game.blueTeam,
      score: game.blueTeam.score + (team === Teams.blue ? 1 : 0),
    },
    redTeam: {
      ...game.redTeam,
      score: game.redTeam.score + (team === Teams.red ? 1 : 0),
    },
  })

const reveal = (w: BoardWord) => ({ ...w, revealed: true })

const checkWin = (game: CodeNamesGame) => {
  if (game.config.variant === GameVariant.interception) {
    // Interception: game ends when a team has no words left
    const gameEnded = game.redTeam.wordsLeft === 0 || game.blueTeam.wordsLeft === 0
    if (gameEnded) {
      // Winner is team with highest score
      const redScore = game.redTeam.score
      const blueScore = game.blueTeam.score
      const winner = redScore > blueScore ? Teams.red : blueScore > redScore ? Teams.blue : undefined
      return {
        ...game,
        state: GameStates.ended,
        winner,
      }
    }
  } else {
    // Classic: first to reveal all their words wins
    if (game.redTeam.wordsLeft === 0 || game.blueTeam.wordsLeft === 0) {
      return {
        ...game,
        state: GameStates.ended,
        winner: game.redTeam.wordsLeft === 0 ? Teams.red : Teams.blue,
      }
    }
  }
  return game
}

export const revealWord =
  (userId: string, row: number, col: number, now: number): GameAction =>
  game => {
    const revealedWord = game.board[row][col]
    const revealedWordTeam =
      revealedWord.type === WordType.blue ? Teams.blue : revealedWord.type === WordType.red ? Teams.red : undefined
    const playerTeam = getPlayer(game, userId)?.team
    const failedGuess = playerTeam && revealedWordTeam !== playerTeam
    const isInterceptionVariant = game.config.variant === GameVariant.interception

    const actions = [
      conditionalAction(revealedWord.type === WordType.assassin, endGame(otherTeam(playerTeam))),
      decreaseWordsLeft(revealedWordTeam),
      // For Interception variant: increment score when revealing any team word
      conditionalAction(isInterceptionVariant && revealedWordTeam !== undefined, increaseScore(revealedWordTeam)),
      conditionalAction(failedGuess || game.wordsRevealedCount >= game.hintWordCount, changeTurn(userId, now)),
      checkWin,
    ]

    const updatedGame = act(actions)(game)

    return {
      ...updatedGame,
      turnOutcome: revealedWord.type === WordType.assassin ? "assassin" : failedGuess ? "failure" : "success",
      board: Collections.update2dCell(updatedGame.board)(reveal, row, col),
      wordsRevealedCount: updatedGame.wordsRevealedCount + 1,
      interceptPhase: false,
    }
  }

export const changeTurn =
  (_: string, now: number): GameAction =>
  game => ({
    ...game,
    turn: game.turn === Teams.blue ? Teams.red : Teams.blue,
    hintWord: "",
    hintWordCount: 0,
    wordsRevealedCount: 0,
    turnCount: (game.turnCount || 0) + 1,
    turnTimeoutSec: game.config.turnTimeoutSec,
    turnStartedTime: now,
    interceptPhase: false,
    interceptUsed: false,
    interceptingTeam: undefined,
  })

export const interceptWord =
  (userId: string, row: number, col: number): GameAction =>
  game => {
    const revealedWord = game.board[row][col]
    const revealedWordTeam =
      revealedWord.type === WordType.blue ? Teams.blue : revealedWord.type === WordType.red ? Teams.red : undefined
    const activeTeam = game.turn
    const interceptingTeam = getPlayer(game, userId)?.team
    const isCorrectIntercept = revealedWordTeam === activeTeam

    // Handle assassin intercept - game ends immediately, intercepting team loses
    if (revealedWord.type === WordType.assassin) {
      return {
        ...game,
        board: Collections.update2dCell(game.board)(reveal, row, col),
        state: GameStates.ended,
        winner: otherTeam(interceptingTeam),
        interceptPhase: false,
        interceptUsed: true,
      }
    }

    if (game.config.variant === GameVariant.interception) {
      // Interception variant: reveal word and award points
      const updatedGame = {
        ...game,
        board: Collections.update2dCell(game.board)(reveal, row, col),
        interceptPhase: false,
        interceptUsed: true,
      }

      if (isCorrectIntercept) {
        // Correct intercept: intercepting team gets 1 point
        return act([increaseScore(interceptingTeam), decreaseWordsLeft(revealedWordTeam), checkWin])(updatedGame)
      } else {
        // Incorrect intercept: other team gets 1 point
        return act([increaseScore(otherTeam(interceptingTeam)), decreaseWordsLeft(revealedWordTeam), checkWin])(
          updatedGame,
        )
      }
    } else {
      // Classic variant: existing logic
      if (isCorrectIntercept) {
        // Success: Team B gets points for correct intercept, Team A's word stays unrevealed
        return act([
          decreaseWordsLeft(interceptingTeam), // Team B gets closer to winning
          checkWin,
        ])({
          ...game,
          interceptPhase: false,
          interceptUsed: true,
        })
      } else {
        const activeTeamWords = R.flatten(game.board)
          .map((word, index) => ({
            word,
            index,
            row: Math.floor(index / game.board[0].length),
            col: index % game.board[0].length,
          }))
          .filter(
            item => item.word.type === (activeTeam === Teams.red ? WordType.red : WordType.blue) && !item.word.revealed,
          )

        if (activeTeamWords.length > 0) {
          const randomWord = Random.shuffle(activeTeamWords)[0]
          // Failure: Give Team A a free word (decrease their count as penalty for Team B)
          return act([decreaseWordsLeft(activeTeam), checkWin])({
            ...game,
            board: Collections.update2dCell(game.board)(reveal, randomWord.row, randomWord.col),
            interceptPhase: false,
            interceptUsed: true,
          })
        }

        return {
          ...game,
          interceptPhase: false,
          interceptUsed: true,
        }
      }
    }
  }

const endGame =
  (winner: Teams | undefined): GameAction =>
  game => ({
    ...game,
    state: GameStates.ended,
    winner,
  })
