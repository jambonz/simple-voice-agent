# default-stt-tts

A jambonz voice agent using the platform's default STT/TTS providers with OpenAI GPT-4.1 mini for conversation.

## Overview

This application creates a WebSocket-based voice agent that uses:
- **STT**: Deepgram nova-3 (jambonz platform default)
- **LLM**: OpenAI GPT-4.1 mini
- **TTS**: Cartesia (jambonz platform default)
- **Turn Detection**: Krisp

## Requirements

- Node.js 18+
- A jambonz account with the application configured to use WebSocket transport
- OpenAI API key configured in your jambonz account

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

The server listens on port 3000 by default. Set the `PORT` environment variable to change this.

## Configuration

The following environment variables can be configured in the jambonz portal when creating an application:

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4.1-mini` |
| `SYSTEM_PROMPT` | System prompt for the voice agent | (friendly assistant prompt) |

## How It Works

1. When a call arrives, jambonz connects to this WebSocket server
2. The app sends an `agent` verb configured with the LLM and turn detection settings
3. The agent handles the conversation, with events emitted for each turn
4. When the agent completes (user hangs up or conversation ends), the call is terminated

## License

MIT
