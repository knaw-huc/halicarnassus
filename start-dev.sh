#!/usr/bin/env bash

webpack --mode development
tsc
docker-compose -p civslog up --build