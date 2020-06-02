import React, { memo } from "react"
import Sound from "react-sound"

interface PlaySoundProps {
  soundOn: boolean
  url: string
  playWhen: boolean
}

export const PlaySound: React.FC<PlaySoundProps> = memo(({ soundOn, url, playWhen }) => (
  <Sound url={url} playStatus={playWhen && soundOn ? "PLAYING" : "STOPPED"} />
))
