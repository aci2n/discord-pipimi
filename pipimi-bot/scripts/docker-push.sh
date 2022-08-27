#!/bin/sh

docker tag pipimi:latest aci2n/pipimi:latest
docker login
docker push aci2n/pipimi:latest