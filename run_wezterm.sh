#!/bin/bash

# Function to check if wezterm is available and set the command
set_wezterm_command() {
    if command -v wezterm &> /dev/null; then
        WEZTERM_CMD="wezterm"
    elif flatpak list | grep -q org.wezfurlong.wezterm; then
        WEZTERM_CMD="flatpak run org.wezfurlong.wezterm"
    elif alias wezterm &> /dev/null; then
        WEZTERM_CMD="$(alias wezterm | sed "s/alias wezterm='\(.*\)'/\1/")"
    else
        echo "wezterm could not be found. Please install wezterm or set up an alias."
        exit 1
    fi
}

# Set the wezterm command
set_wezterm_command

# Start the Julia server in a new tab
$WEZTERM_CMD start --cwd ../AISHServer -- bash -c '
    echo "Starting Julia server..."
    git ls-files | entr -r julia server.jl
    exec $SHELL
' &

# Start the React frontend in another new tab
$WEZTERM_CMD start --cwd ../AISHApp -- bash -c '
    echo "Starting React frontend..."
    npm start
    exec $SHELL
'

# Disown both background processes
disown -a

# Exit the script
exit 0
