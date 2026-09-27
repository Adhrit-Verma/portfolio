#!/bin/sh
# Renders every artifact, then post.py writes art/renders/<slug>.webp (used by the
# Remotion share cards in video/).
# BLENDER overrides the path; default is the Windows 5.2 install.
cd "$(dirname "$0")"
B="${BLENDER:-/c/Program Files/Blender Foundation/Blender 5.2/blender.exe}"
O="$(pwd -W 2>/dev/null || pwd)/out"
mkdir -p out ../renders
for s in ${@:-gdc tablefox contrast clauseguard jimmy tasx}; do
  "$B" -b -P render.py -- "$s" "$O/$s.png" | grep -iE "saved|error"
  python post.py "out/$s.png" "../renders/$s.webp"
done
