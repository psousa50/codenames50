import { Messages } from "@codenames50/messaging"
import { render } from "@testing-library/react"
import React from "react"
import { Environment, EnvironmentContext } from "../../environment"
import { CodeNamesGameLoader } from "./CodeNamesGameLoader"

describe("CodeNamesGameLoader", () => {
  it("emits messages to register the user socket and to join the game", async done => {
    const userId = "Some Name"
    const gameId = "some-game-id"
    const emitMessage = jest.fn()
    const useSocketMessaging = (_: string, onConnect: () => void) => {
      setTimeout(() => {
        onConnect()
        expect(emitMessage).toHaveBeenCalledWith(Messages.registerUserSocket({ userId }))
        expect(emitMessage).toHaveBeenCalledWith(Messages.joinGame({ gameId, userId }))
        done()
      }, 0)
      return [emitMessage, () => {}]
    }

    const environment: Environment = {
      config: {},
      useSound: () => [jest.fn()],
      useSocketMessaging,
    } as any

    render(
      <EnvironmentContext.Provider value={environment}>
        <CodeNamesGameLoader gameId={gameId} userId={userId} />
      </EnvironmentContext.Provider>,
    )
  })
})
