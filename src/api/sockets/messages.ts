import { RevealWordInput, CreateGameInput, JoinGameInput } from "../models"
import { createSocketMessage } from "./messagesTypes"

export const createGameMessage = (data: CreateGameInput) => createSocketMessage("createGame", data)
export const joinGameMessage = (data: JoinGameInput) => createSocketMessage("joinGame", data)
export const revealWordMessage = (data: RevealWordInput) => createSocketMessage("revealWord", data)
