const flagsImages: Record<string, string> = {
  en: require("./images/en.png"),
  pt: require("./images/pt.png"),
}

export const getFlagImage = (language: string) => flagsImages[language]

export const logoImage = require("./images/logo.png")
