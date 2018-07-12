#!/usr/bin/env bash

webpack --mode development
tsc
docker-compose -p civslog -f docker-compose-dev.yml up --build