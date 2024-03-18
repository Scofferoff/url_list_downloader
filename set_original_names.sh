#!/bin/bash

# Check if download.log file exists
if [ ! -f "download.log" ]; then
    echo "Error: download.log file not found."
    exit 1
fi

# Read download.log line by line
while IFS= read -r line; do
    # Extract the URL and destination from each line
    url=$(echo "$line" | awk -F 'Saved: ' '{print $2}' | awk '{print $1}')
    destination=$(echo "$line" | awk -F 'to ' '{print $2}')

    # Extract original filename from the URL
    filename=$(basename "$url")

    # Check if the destination file already exists
    if [ -f "$destination" ]; then
        # If file exists, generate a unique filename
        extension="${filename##*.}"  # Get the extension
        filename="${filename%.*}"    # Get the filename without extension
        counter=2
        while [ -f "$(dirname "$destination")/$filename-$counter.$extension" ]; do
            counter=$((counter + 1))
        done
        new_filename="$filename-$counter.$extension"
        echo "Conflict: File already exists - $destination. Renaming to $new_filename"
        mv "$destination" "$(dirname "$destination")/$new_filename"
        echo "Renamed: $destination to $(dirname "$destination")/$new_filename"
    else
        # If file doesn't exist, simply rename it to its original name
        mv "$destination" "$(dirname "$destination")/$filename"
        echo "Renamed: $destination to $(dirname "$destination")/$filename"
    fi
done < "download.log"

# Thanks chatGPT