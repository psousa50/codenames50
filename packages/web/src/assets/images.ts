import enFlag from "./images/en.png"
import ptFlag from "./images/pt.png"
import logoImg from "./images/logo.png"

const flagsImages: Record<string, string> = {
  en: enFlag,
  pt: ptFlag,
}

export const getFlagImage = (language: string) => flagsImages[language]

export const logoImage = logoImg
