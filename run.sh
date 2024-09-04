#!/bin/bash

# Check if byobu is installed
if ! command -v byobu &> /dev/null
then
    echo "byobu could not be found. Please install byobu."
    exit 1
fi

# Create a new byobu session named 'julia-react-app'
byobu new-session -d -s julia-react-app -n 'Julia-React' \; split-window -h

# Select the left pane (pane 0) and run the Julia server
byobu select-pane -t 0
byobu send-keys "cd ../AISHServer && git ls-files | entr -r julia server.jl" C-m

# Select the right pane (pane 1) and run the React frontend
byobu select-pane -t 1
byobu send-keys "cd ../AISHApp && npm start" C-m

byobu select-pane -t 0

# Attach to the byobu session
byobu attach-session -t julia-react-app


# This traps SIGINT (ctrl+C) and ensures the byobu session is killed
trap "byobu kill-session -t julia-react-app" SIGINT SIGTERM EXIT