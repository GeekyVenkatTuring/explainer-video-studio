#!/bin/sh
# contact sheet of the 9 p=0.72 QA stills for one IPO -> /tmp/<key>_sheet.png
k=$1; cd /Users/appuram/Developer/explainer-forge/projects/ipo-28sep-$k/qa || exit 1
set -- $(ls ${k}_*_72.png)
ffmpeg -y -v error -i $1 -i $2 -i $3 -i $4 -i $5 -i $6 -i $7 -i $8 -i $9 -filter_complex "$(for i in 0 1 2 3 4 5 6 7 8; do printf "[$i:v]scale=960:540[v$i];"; done)[v0][v1][v2][v3][v4][v5][v6][v7][v8]xstack=inputs=9:layout=0_0|960_0|1920_0|0_540|960_540|1920_540|0_1080|960_1080|1920_1080" /tmp/${k}_sheet.png
