#!/bin/bash

docker run -d -p 27017:27017 -v $PWD/data/mongo:/data/db mongo

