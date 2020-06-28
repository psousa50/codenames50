#!/bin/bash

yarn clean
yarn build

./scripts/start-server.sh
