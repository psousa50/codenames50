import React, { memo } from "react"
import Sound from "react-sound"

const PlaySoundAlways: React.FC<{ url: string; play: boolean }> = ({ url, play }) => {
  console.log("RENDER=====>")
  return <Sound url={url} playStatus={play ? "PLAYING" : "STOPPED"} />
}

export const PlaySound = memo(PlaySoundAlways)
