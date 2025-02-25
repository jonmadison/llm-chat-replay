# LLM Chat Replay

A React application that provides a visual replay of LLM chat transcripts with typing animation and playback controls. Created for AI assistant conversations (like Claude), but works with any markdown chat export using the specified format.

## Features

- Drag and drop markdown file upload
- Playback controls (play/pause)
- Speed control (0.5x to 4x)
- Progress bar scrubbing
- Auto-scrolling chat window with smart scroll behavior
- Distinct bubbles for Human and Assistant messages
- Typing animation for Assistant responses
- Automatically extracts and displays conversation title

## Demo

Drop any markdown transcript with the following format:

```markdown
# Title of Conversation

**Human**: Your question or prompt here

**Assistant**: The assistant's response here
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
git clone https://github.com/yourusername/llm-chat-replay.git
cd llm-chat-replay
npm install
npm run dev
```

## Usage

1. Launch the application using `npm run dev`
2. Drop your saved markdown transcript file into the interface or click to browse
3. Use playback controls to replay the conversation
4. Adjust speed as needed using the controls below the chat
5. Use the progress bar to jump to specific parts of the conversation

### Creating Compatible Transcripts

When chatting with AI assistants, you can typically request a transcript export:

```
Ask the assistant: "please save the full transcript of this chat as a markdown file"
```

Ensure the saved markdown file is formatted with "**Human**:" and "**Assistant**:" markers at the beginning of each message.

#### Pre-prompt for Consistent Transcript Formatting

For best results, add this pre-prompt to your AI assistant's settings to ensure properly formatted transcripts:

```
Here are instructions when asked to write a transcript or save a chat:

Please save a complete, properly formatted transcript of our conversation to the filesystem using tools. When creating this transcript:

1. Format with "**Human**:" and "**Assistant**:" prefixes exactly as shown
2. Preserve all original text formatting, but avoid special characters that might break markdown
3. For any file paths or code:
   - Place them on their own lines when possible
   - Wrap them in backticks like `this`
   - Avoid ending lines with underscores or other markdown-sensitive characters
4. For function calls and results:
   - Format them as [Function call: relevant information]
   - Format them as [Function result: relevant information]
   - Ensure they're on their own lines
   - If the chat seems like it will be long, you can omit the function results and replace with "..."
5. Maintain proper spacing between paragraphs
6. Use standard markdown for any lists or formatting
7. Save the file with a descriptive name in the format: chat_YYYYMMDD_topic_name.md

Please ensure the transcript contains our complete conversation with all content preserved, and ready to be played back in the chat replay tool.
Example filename patterns:

- chat_20240219_chat_thing.md
- chat_20240219_this_conversation.md
- chat_20240219_update_config.md
```

## Built With

- React + Vite
- TypeScript
- Tailwind CSS
- Typed.js for typing animation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.