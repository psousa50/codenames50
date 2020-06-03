import React from "react"
import useSound from "use-sound"

export const sounds = {
  success: require("../assets/sounds/success.mp3"),
  failure: require("../assets/sounds/failure.mp3"),
  hintAlert: require("../assets/sounds/hintAlert.mp3"),
  assassin: require("../assets/sounds/assassin.mp3"),
  endGame: require("../assets/sounds/endGame.mp3"),
}

export const usePlaySound = (url: string) => {
  const [playSound] = useSound(url)
  const [playTrigger, setPlayTrigger] = React.useState(0)

  const play = (soundOn: boolean) => {
    if (soundOn) {
      setPlayTrigger(p => p + 1)
    }
  }

  React.useEffect(() => {
    if (playTrigger > 0) {
      playSound()
    }
  }, [playSound, playTrigger])

  return [play]
}
