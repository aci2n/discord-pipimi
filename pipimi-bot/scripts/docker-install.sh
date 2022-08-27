#!/bin/sh

script_dir=$(cd -- "$(dirname -- "$0")" && pwd)
"$script_dir/docker-build.sh"
"$script_dir/docker-push.sh"
"$script_dir/docker-remote-pull.sh"