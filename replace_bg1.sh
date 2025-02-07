#!/bin/bash
find . -type f -print0 | while IFS= read -r -d $'\0' file; do
  sed -i 's/--color-background-primary/--color-background-primary/g' 
done
