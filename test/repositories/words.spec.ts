import { MongoMemoryServer } from "mongodb-memory-server"
import { getRightAction } from "../helpers"
import { connect } from "../../src/mongodb/main"
import { wordsRepository } from "../../src/repositories/words"

it("getByLanguage", async () => {
  const mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getUri()

  const dbClient = await connect(mongoUri)
  const environment = {
    dbClient,
  } as any

  const wordsEn = {
    language: "en",
    words: ["word1", "word2"],
  }

  const wordsPt = {
    language: "pt",
    words: ["word1", "word2"],
  }

  await getRightAction(wordsRepository.insert(wordsEn), environment)
  await getRightAction(wordsRepository.insert(wordsPt), environment)

  const wPt = await getRightAction(wordsRepository.getByLanguage("pt"), environment)
  const wEn = await getRightAction(wordsRepository.getByLanguage("en"), environment)

  mongoServer.stop()

  expect(wPt).toEqual(wordsPt)
  expect(wEn).toEqual(wordsEn)
})
