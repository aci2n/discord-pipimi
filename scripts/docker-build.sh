#!/bin/sh

script_dir=$(cd -- "$(dirname -- "$0")" && pwd)
docker build -t pipimi:latest "$script_dir/.."