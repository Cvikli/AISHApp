# AI-Powered Shell (AISH) Web Interface

This project is a React-based web interface for an AI-powered shell environment, providing an interactive way to communicate with AI language models.

## Demo


https://github.com/user-attachments/assets/28a4e0d5-48a5-474c-a492-d8ce116722b6

*Of course it can do a lot more then this! Basically it wrote most of his own codebase*


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

- [ ] diff is the internal... and visualization generated from this.
- [ ] also currently it just doesn't generate itself.
- [ ] insert_deletion and char_insert_deletion... the AI forgot about that we have these classes... so ex: insert_deletion-background instead of insertion-background...


## TODO
- [ ] rerender bugs
- [ ] height hugging monaco
- [ ] live edit monaco
- [ ] mergeing with monaco
- [ ] streamed content refresh
- [ ] correct parsing
- [ ] height hugging
- [ ] cache timeout counter!
- [ ] speech recognition
- [x] error print isn't a message and it can cause problem like user, user sequence... also it can go visual glitch till it isn't resolved as it is attached to wrong object intead of messages
- [x] When there is no server then we need to show a prompt how to set up. Also a button to refresh the page
  - [x] Conversation is actually selected as we can see it from the URL!
  - [x] Save should be automatic, not with button. 
  - [x] Also the ip and server should be inline.
  - [x] Also the port and ip in the text should be in sync.
- [x] multiline usermessage
- [x] Don't remove the project_path if new conversation selected
- [x] Voice activation of speech recognition. THINK ABOUT how to close the conversation via speech (Or the AI will guess a solution for this)!
- [x] Jump to bottom
- [x] lists formatting is wrong
- [x] Multiline handling with the user messages too
- [x] History empty bar should be removed... 
- [x] new conversation should go to the header...
- [x] Also the open close button should be boxed like the "new conversation" 
- [x] History visually not appealing

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
