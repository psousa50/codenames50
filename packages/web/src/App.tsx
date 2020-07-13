import { createMuiTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from "@material-ui/core"
import { blueGrey, lightBlue } from "@material-ui/core/colors"
import React, { useState } from "react"
import { BrowserRouter } from "react-router-dom"
import useSound from "use-sound"
import * as Api from "./api/games"
import { AppRouter } from "./AppRouter"
import { defaultEnvironment, EnvironmentContext, readConfig, updateConfig, EnvironmentConfig } from "./environment"
import { EmitMessage } from "./utils/types"
import { useSocketMessaging, AddMessageHandler } from "./utils/useSocketMessaging"
import { ViewportProvider } from "./utils/viewPort"

const darkTheme = responsiveFontSizes(
  createMuiTheme({
    palette: {
      type: "dark",
      primary: lightBlue,
      secondary: blueGrey,
    },
  }),
)

const buildEnvironment = (
  config: EnvironmentConfig,
  toggleSound: () => void,
  emitMessage: EmitMessage,
  addMessageHandler: AddMessageHandler,
) => ({
  api: Api,
  config,
  useSound,
  toggleSound,
  socketMessaging: {
    emitMessage,
    addMessageHandler,
  },
})

export const App = () => {
  const [environment, setEnvironment] = useState(defaultEnvironment)
  const [emitMessage, addMessageHandler] = useSocketMessaging(process.env.REACT_APP_SERVER_URL || "")

  const toggleSound = () => {
    setEnvironment(e => updateConfig({ soundOn: !e.config.soundOn })(e))
  }

  React.useEffect(() => {
    const config = readConfig()
    setEnvironment(buildEnvironment(config, toggleSound, emitMessage, addMessageHandler))
  }, [addMessageHandler, emitMessage])

  return (
    <React.StrictMode>
      <ViewportProvider>
        <EnvironmentContext.Provider value={environment}>
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </ThemeProvider>
        </EnvironmentContext.Provider>
      </ViewportProvider>
    </React.StrictMode>
  )
}
