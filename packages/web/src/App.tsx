import { createMuiTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from "@material-ui/core"
import { blueGrey, lightBlue } from "@material-ui/core/colors"
import React, { useState } from "react"
import { BrowserRouter } from "react-router-dom"
import useSound from "use-sound"
import * as Api from "./api/games"
import { AppRouter } from "./AppRouter"
import { defaultEnvironment, EnvironmentContext, readConfig, updateConfig } from "./environment"
import { socketMessaging } from "./socketMessaging"
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

const setupEnvironment = (toggleSound: () => void) => ({
  api: Api,
  config: readConfig(),
  useSound,
  toggleSound,
  socketMessaging,
})

export const App = () => {
  const [environment, setEnvironment] = useState(defaultEnvironment)

  const toggleSound = () => {
    setEnvironment(e => updateConfig({ soundOn: !e.config.soundOn })(e))
  }

  React.useEffect(() => {
    setEnvironment(setupEnvironment(toggleSound))
  }, [])

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
