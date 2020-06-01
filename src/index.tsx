import { createMuiTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from "@material-ui/core"
import { cyan, teal } from "@material-ui/core/colors"
import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter } from "react-router-dom"
import { App } from "./App"
import "./index.css"
import * as serviceWorker from "./serviceWorker"
import { ViewportProvider } from "./utils/viewPort"

const theme = responsiveFontSizes(
  createMuiTheme({
    palette: {
      type: "dark",
      primary: teal,
      secondary: cyan,
    },
  }),
)

ReactDOM.render(
  <React.StrictMode>
    <ViewportProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ViewportProvider>
  </React.StrictMode>,
  document.getElementById("root"),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
