export const localApi = {
  irnPort: 5000,
  irnUrl: "http://localhost",
}

export const productionApi = {
  irnPort: undefined,
  irnUrl: "https://xxx.herokuapp.com",
}

export const developmentConfig = {
  ...localApi,
}

export const productionConfig = {
  ...productionApi,
}

export const config = developmentConfig
