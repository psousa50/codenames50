import { Messages } from "@codenames50/messaging"
import { fireEvent, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { Environment } from "../../environment"
import { defaultEnvironment, renderWithEnvironment } from "../../_testHelpers/render"
import { CreateGameScreen } from "./CreateGameScreen"

interface TestRedirectProps {
  ComponentWithRedirection: React.ComponentType
  redirectUrl: string
}

describe("CreateGameScreen", () => {
  const userId = "Some Name"

  describe("when the user types a name and presses create game button", () => {
    const userTypesNameAndPressesCreateGameButton = () => {
      const emitMessage = jest.fn()
      const messageHandlers = {} as any
      const socketMessaging = {
        connect: () => {},
        disconnect: () => {},
        emitMessage: jest.fn(() => emitMessage),
        addMessageHandler: () => (handler: Messages.GameMessageHandler) => {
          messageHandlers[handler.type] = handler.handler
        },
      }

      const callMessagehandler = (messageType: Messages.GameMessageType) => messageHandlers[messageType]

      const environment: Environment = {
        ...defaultEnvironment,
        socketMessaging,
      } as any

      renderWithEnvironment(
        <BrowserRouter>
          <Switch>
            <Route path="/" exact>
              <CreateGameScreen />
            </Route>
            <Route
              path={"/game"}
              render={({ location: { pathname, search } }) => (
                <div data-testid="redirect-url">{`${pathname}${search}`}</div>
              )}
            />
          </Switch>
        </BrowserRouter>,
        environment,
      )

      fireEvent.change(screen.getByRole("textbox", { name: "Your Name" }), { target: { value: userId } })
      userEvent.click(screen.getByTestId("create-game-button"))

      return {
        emitMessage,
        callMessagehandler,
      }
    }

    it("emits messages to register the user socket and to create the game", () => {
      const { emitMessage } = userTypesNameAndPressesCreateGameButton()

      expect(emitMessage).toHaveBeenCalledWith(Messages.registerUserSocket({ userId }))
      expect(emitMessage).toHaveBeenCalledWith(Messages.createGame({ userId }))
    })

    it("redirects to the game page when the game is created", async () => {
      const { callMessagehandler } = userTypesNameAndPressesCreateGameButton()

      const gameId = "some-game-id"
      const game = { gameId, error: "" }
      act(() => callMessagehandler("gameCreated")(game))

      const redirectUrl = screen.getByText(`/game?gameId=${gameId}&userId=${userId}`)
      expect(redirectUrl).toBeDefined()
    })
  })
})
