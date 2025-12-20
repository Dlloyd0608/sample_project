#!/bin/bash

################################################################################
# Non-Docker Build Script for Sample Project
# Creates production-ready distribution for local development
# (This is a symlink or copy of docker/build.sh)
################################################################################

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if docker/build.sh exists
DOCKER_BUILD_SCRIPT="$PROJECT_ROOT/docker/build.sh"

if [ -f "$DOCKER_BUILD_SCRIPT" ]; then
    echo "Running build script from docker/build.sh..."
    bash "$DOCKER_BUILD_SCRIPT" "$@"
else
    echo "Error: docker/build.sh not found at $DOCKER_BUILD_SCRIPT"
    exit 1
fi
