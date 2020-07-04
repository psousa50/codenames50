import React from "react"
import useSound from "use-sound"
import { EnvironmentContext } from "../environment"

export const sounds = {
  success: require("../assets/sounds/success.mp3"),
  failure: require("../assets/sounds/failure.mp3"),
  hintAlert: require("../assets/sounds/hintAlert.mp3"),
  assassin: require("../assets/sounds/assassin.mp3"),
  endGame: require("../assets/sounds/endGame.mp3"),
  tick: require("../assets/sounds/tick.mp3"),
  timeout: require("../assets/sounds/timeout.mp3"),
}

export const usePlaySound = (url: string) => {
  const environment = React.useContext(EnvironmentContext)
  const [playSound] = useSound(url)
  const [playIt, setPlayIt] = React.useState(false)

  const play = () => {
    setPlayIt(true)
  }

  React.useEffect(() => {
    if (environment.config.soundOn && playIt) {
      playSound()
    }
    setPlayIt(false)
  }, [environment.config.soundOn, playSound, playIt])

  return [play]
}
