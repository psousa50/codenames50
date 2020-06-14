#!/bin/bash

yarn workspace @psousa50/shared exec yarn build
yarn workspace codenames50-core exec yarn build
yarn workspace codenames50-server exec yarn build
yarn workspace codenames50-react exec yarn build
