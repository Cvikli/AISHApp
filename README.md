# AI-Powered Shell (AISH) Web Interface

This project is a React-based web interface for an AI-powered shell environment, providing an interactive way to communicate with AI language models.

## Demo
<iframe width="560" height="315" src="[https://www.youtube.com/embed/VIDEO_ID](https://youtu.be/a4R6D86oBjw)" frameborder="0" allowfullscreen></iframe>
*Very basic example but it can do a lot more! It actually created itself so you can imagine.*

<iframe width="560" height="315" src="https://www.youtube.com/embed/a4R6D86oBjw" frameborder="0" allowfullscreen></iframe>
*Caption: SpaceX Starship Flight Test*
<iframe width="560" height="315" src="https://www.youtube.com/embed/a4R6D86oBjw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


## Features

- Interactive chat interface with AI
- Dark/Light mode toggle
- Sidebar for conversation management
- System prompt customization
- Project path setting and refresh functionality

## Project Structure

- `src/`: React components and application logic
  - `components/`: Reusable React components
  - `contexts/`: React context for state management
  - `App.js`: Main application component
  - `ChatComponent.js`: Core chat interface
  - `api.js`: API interaction functions
  - `streamAPI.js`: Streaming API functions
  - `theme.js`: Theme definitions
- `public/`: Public assets and HTML template

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   apt install byobu
   ```
3. Start the backend server and the frontend immediately:
   ```
   ./run.sh
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## TODO
- [ ] Don't remove the project_path if new conversation selected
- [ ] History visually not appealing
- [ ] error print isn't a message and it can cause problem like user, user sequence... also it can go visual glitch till it isn't resolved as it is attached to wrong object intead of messages

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
