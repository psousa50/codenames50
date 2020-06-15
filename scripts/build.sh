#!/bin/bash

yarn workspace @psousa50/shared exec yarn build
yarn workspace codenames50-core exec yarn build

if [ "$BUILD_ENV" = "api" ]; then
  yarn workspace codenames50-server exec yarn build
elif [ "$BUILD_ENV" = "web" ]; then
  yarn workspace codenames50-react exec yarn build
fi
