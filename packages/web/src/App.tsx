import { createMuiTheme, CssBaseline, responsiveFontSizes, ThemeProvider, CircularProgress } from "@material-ui/core"
import { blueGrey, lightBlue } from "@material-ui/core/colors"
import React, { useState } from "react"
import { BrowserRouter } from "react-router-dom"
import { AppRouter } from "./AppRouter"
import { EnvironmentContext, readConfig, updateConfig, Environment, buildEnvironment } from "./environment"
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

export const App = () => {
  const [environment, setEnvironment] = useState<Environment>()

  const toggleSound = () => {
    setEnvironment(e => e && updateConfig({ soundOn: !e.config.soundOn })(e))
  }

  React.useEffect(() => {
    const config = readConfig()
    setEnvironment(buildEnvironment(config, toggleSound))
  }, [])

  return environment ? (
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
  ) : (
    <CircularProgress />
  )
}
