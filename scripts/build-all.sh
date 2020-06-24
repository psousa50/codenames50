#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"

$DIR/build-packages.sh

yarn workspace codenames50-server exec yarn build
yarn workspace codenames50-react exec yarn build
