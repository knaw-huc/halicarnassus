# Halicarnassus
A React component for visualizing spatial and temporal data

## Prerequisites
- Docker
- Docker Compose

## Development
- `npm run start:dev` will run docker-compose and launch a couple of containers: one for the express server, one for the postgis database, one for psql and two containers with watchers (one TypeScript for the express server and one Webpack/Typescript for the client).

- If you want to use psql, just log in to the psql container `docker exec -ti civslog_psql_1 /bin/sh` and start `psql -U <user> -h db`. Change to the database: `\c timeline` and your good to go.


