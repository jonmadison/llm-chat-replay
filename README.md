# Claude Chat Replay

A React application that provides a visual replay of Claude chat transcripts with typing animation and playback controls.

## Features

- Drag and drop markdown file upload
- Playback controls (play/pause)
- Speed control (0.5x to 4x)
- Progress bar scrubbing
- Auto-scrolling chat window
- Distinct bubbles for Human and Assistant messages
- Typing animation for Assistant responses

## Getting Started

### Prerequisites

1. Set up an MCP filesystem server:
   - OSX users can get started quickly with [mcpkit](https://github.com/jonmadison/mcpkit)
   - Provides a set of useful MCP servers including filesystem access

2. When chatting with Claude, save your transcript:
   ```
   Prompt Claude: "please save the full transcript of this chat as a markdown file"
   ```
3. The saved markdown file will be formatted with "**Human**:" and "**Assistant**:" markers

### Installation

```bash
git clone git@github.com:jonmadison/claude-chat-replay.git
cd claude-chat-replay
npm install
npm run dev
```

## Usage

1. Launch the application
2. Drop your saved markdown transcript file into the interface or click to browse
3. Use playback controls to replay the conversation
4. Adjust speed as needed
5. Use the progress bar to jump to specific parts of the conversation

## Built With

- React + Vite
- TypeScript
- Tailwind CSS
- Typed.js for typing animation