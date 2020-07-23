import React from "react"
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
  const {
    config: { soundOn },
    useSound,
  } = React.useContext(EnvironmentContext)
  const [playSound] = useSound(url)
  const [playIt, setPlayIt] = React.useState(false)

  const play = () => {
    setPlayIt(true)
  }

  React.useEffect(() => {
    if (soundOn && playIt) {
      playSound()
    }
    setPlayIt(false)
  }, [playIt, playSound, soundOn])

  return play
}
