#!/bin/bash

# Function to list files and their contents
list_files_with_content() {
  local directory=$1
  
  # Loop through each file in the directory and its subdirectories
  find "$directory" -type f | while read -r file; do
    echo "File Name: $file"
    echo "Content:"
    cat "$file"
    echo "========================================"
  done
}

# Specify the directory you want to list files from
directory="/home/hm/repo/AIApp/src"

list_files_with_content "$directory" | xclip -selection clipboard
