#!/bin/bash
currentDateTs=$(date -j -f "%d.%m.%Y" $1 "+%s")
endDateTs=$(date -j -f "%d.%m.%Y" $2 "+%s")
offset=86400*7

while [ "$currentDateTs" -le "$endDateTs" ]
do
  date=$(date -j -f "%s" $currentDateTs "+%d.%m.%Y")
  echo $date
  currentDateTs=$(($currentDateTs+$offset))
done
