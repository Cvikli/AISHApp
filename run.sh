#!/bin/bash

# Function to open a new terminal window and run a command
open_terminal_and_run() {
    local title="$1"
    local command="$2"
    gnome-terminal --title="$title" -- bash -c "$command; exec bash"
}

# Start the Julia server in a new terminal
open_terminal_and_run "Julia Server" "cd ../AISHServer && git ls-files | entr -r julia server.jl"

# Start the React frontend in another new terminal
open_terminal_and_run "React Frontend" "cd ../AISHApp && npm start"

# Exit the script
exit 0
