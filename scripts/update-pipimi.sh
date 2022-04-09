#!/bin/bash

# this scripts runs in the remote server

export PIPIMI_API_KEY=PIPIMI_API_KEY

docker image pull aci2n/pipimi

docker container stop pipimi
docker container rm pipimi
docker container run -d -e PIPIMI_API_KEY=$PIPIMI_API_KEY --name pipimi aci2n/pipimi
docker container ls