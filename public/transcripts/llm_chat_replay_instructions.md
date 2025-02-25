# LLM Chat Replay Instructions

**Human**: remember that llm chat replay tool we wrote? will you explain how to use it?

**Assistant**: Based on my memory, I can see that we've worked on a chat replay tool that allows users to upload markdown transcript files to replay conversations with a typing animation effect. Let me explain how to use it:

## How to Use the LLM Chat Replay Tool

1. **Launch the application**:
   ```bash
   cd /Users/jon/src/ai_projects/llm-chat-replay
   npm run dev
   ```

2. **Upload a transcript**:
   - **Drag and drop method**: Simply drag a markdown (.md) file from your computer onto the interface where it says "Drop a markdown file to play"
   - **Click to browse**: Alternatively, click on the upload icon to open a file browser and select your markdown file

3. **Transcript format requirements**:
   - The file should be in markdown format (.md)
   - Messages should be formatted with `**Human**:` and `**Assistant**:` markers
   - Example format:
     ```markdown
     # Title of Conversation

     **Human**: Your question or prompt here
     
     **Assistant**: The assistant's response here
     ```

4. **Playback controls**:
   - **Play/Pause**: Start or pause the conversation playback
   - **Speed control**: Adjust the typing speed (0.5x to 4x)
   - **Progress bar**: Drag to skip to different parts of the conversation
   - **Reset**: Restart the entire playback or upload a different file

5. **Features during playback**:
   - Human messages appear instantly
   - Assistant messages have a typing animation effect
   - Auto-scrolling follows the conversation
   - Different styling for each speaker's messages

The tool is particularly useful for:
- Reviewing past conversations with AI assistants
- Creating demo recordings of AI interactions
- Sharing interesting conversations with others

Note that the tool automatically parses the first line of your markdown file as the conversation title. If your transcript has a meaningful title at the top (formatted as a markdown heading with `#`), it will display that title instead of the default "Drop a markdown file to play" message.

**Human**: thanks! will you save this as "llm_chat_replay_instructions" in your transcript folder? also, save a README.md file i can use in the code project.