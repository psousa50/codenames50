#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"

$DIR/build-packages.sh

if [ "$BUILD_ENV" = "api" ]; then
  yarn workspace codenames50-server exec yarn build
elif [ "$BUILD_ENV" = "web" ]; then
  yarn workspace codenames50-react exec yarn build
fi
yarn workspace codenames50-server start:dev
