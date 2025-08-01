#!/bin/bash
cd /Users/wilson/Desktop/voicesoncanvas/frontend/public/images
i=1
for f in *.jpg; do
  mv "$f" "art$i.jpg"
  i=$((i+1))
done