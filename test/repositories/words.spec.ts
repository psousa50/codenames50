import { MongoMemoryServer } from "mongodb-memory-server"
import { connect } from "../../src/mongodb/main"
import { gamesRepository } from "../../src/repositories/games"
import { wordsRepository } from "../../src/repositories/words"
import { getRight } from "../helpers"
import { gamesMongoDb } from "../../src/mongodb/games"
import { wordsMongoDb } from "../../src/mongodb/words"

it("getByLanguage", async () => {
  const mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getUri()

  const dbClient = await connect(mongoUri)

  const mongoAdapter = {
    gamesMongoDb,
    wordsMongoDb,
    adapters: {
      dbClient,
    },
  }

  const repositoriesAdapter = {
    gamesRepository,
    wordsRepository,
    adapters: {
      mongoAdapter,
    },
  }

  const wordsEn = {
    language: "en",
    words: ["word1", "word2"],
  }

  const wordsPt = {
    language: "pt",
    words: ["word1", "word2"],
  }

  await getRight(wordsRepository.insert(wordsEn)(repositoriesAdapter))()
  await getRight(wordsRepository.insert(wordsPt)(repositoriesAdapter))()

  const wPt = await getRight(wordsRepository.getByLanguage("pt")(repositoriesAdapter))()
  const wEn = await getRight(wordsRepository.getByLanguage("en")(repositoriesAdapter))()

  mongoServer.stop()

  expect(wPt).toEqual(wordsPt)
  expect(wEn).toEqual(wordsEn)
})
