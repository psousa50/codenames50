#!/bin/bash

yarn clean
yarn build

yarn workspace @codenames50/server test
yarn workspace @codenames50/web test

./scripts/start-server.sh
