# AI Chatbot (TypeScript)

A complete web-based AI chatbot built with **TypeScript**, using **Vercel serverless
functions** for the backend and **Google's Gemini API** for the AI brain.

This is a full migration of an original Python/Flask version into TypeScript, ready
to deploy to **Vercel** with zero configuration.

## Features

- 💬 Real-time chat interface with a modern, responsive design
- 🤖 Powered by Google's Gemini AI model
- 🎨 Clean, gradient-based UI with smooth animations
- ⌨️ Enter to send, Shift+Enter for new line
- 🔄 Typing indicator while the AI is responding
- 🗑️ Clear conversation button
- 📱 Fully responsive - works on desktop, tablet, and mobile
- 🧠 Conversation context preserved across messages (history sent from the client)

## Project Structure

```
ai-chatbot/
├── api/                  # Vercel serverless functions (TypeScript backend)
│   ├── chat.ts           # POST /api/chat - sends a message to Gemini
│   ├── reset.ts          # POST /api/reset - clears the conversation
│   ├── health.ts         # GET  /api/health - health check / status
│   └── lib/
│       └── gemini.ts     # Shared Gemini client + model setup
├── public/               # Static frontend served at the root
│   ├── index.html        # Frontend HTML
│   ├── style.css         # Frontend styling
│   └── script.js         # Compiled output (generated from src/script.ts)
├── src/
│   └── script.ts         # Frontend logic in TypeScript (compiled to public/)
├── package.json          # Dependencies + build scripts
├── tsconfig.json         # TypeScript config for the serverless functions
├── tsconfig.client.json  # TypeScript config for the frontend build
├── vercel.json           # Vercel build & routing config
├── .env.example          # Template for environment variables
└── README.md
```

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- The [Vercel CLI](https://vercel.com/docs/cli)

### 1. Get a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in, then click **"Get API key"** → **"Create API key"**
3. Copy the generated key

### 2. Configure the API key

Create a `.env.local` file in the project root (Vercel CLI reads this automatically):

```
GEMINI_API_KEY=your_api_key_here
```

Or copy the template: `copy .env.example .env.local`

### 3. Install dependencies

```bash
npm install
```

### 4. Run locally

```bash
npm run dev
```

`npm run dev` compiles the frontend TypeScript, then starts `vercel dev` so the
serverless functions and static files run locally. Open **http://localhost:3000**.

## Building the frontend

The frontend lives in TypeScript (`src/script.ts`) and is compiled to `public/script.js`:

```bash
npm run build
```

Type-check everything:

```bash
npm run typecheck
```

## Deploy to Vercel

### Option 1: Deploy with the Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts, then:

```bash
vercel --prod
```

### Option 2: Deploy from GitHub (recommended)

1. Push this repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New"** →
   **"Project"**.
3. Import your Git repository. Vercel auto-detects the build command
   (`npm run build`), output directory (`public`), and the serverless functions
   in `api/`.
4. In the project **Settings → Environment Variables**, add:

   | Name            | Value                    |
   |-----------------|--------------------------|
   | `GEMINI_API_KEY`| (your actual API key)    |
   | `GEMINI_MODEL`  | `gemini-3.6-flash` (current default) |

5. Click **"Deploy"**. Vercel builds and deploys automatically.
6. Your app is live at `https://<your-project>.vercel.app`.

### Notes on the serverless architecture

- Vercel functions are **stateless**. Instead of keeping conversation history in
  server memory, the frontend stores it locally and sends the last 10 messages
  with each `/api/chat` request so the model retains context.
- The API key is read from the `GEMINI_API_KEY` environment variable at runtime.
  Never commit your real key.

## API Endpoints

| Method | Endpoint      | Description                             |
|--------|---------------|-----------------------------------------|
| GET    | `/`           | Serves the chat interface               |
| POST   | `/api/chat`   | Sends a message (and history) to Gemini |
| POST   | `/api/reset`  | Clears the conversation                 |
| GET    | `/api/health` | Health check / status                   |

### POST /api/chat

**Request body:**
```json
{
  "message": "Hello, how are you?",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "model", "content": "Hello! How can I help?" }
  ]
}
```

**Response:**
```json
{
  "response": "I'm doing well, thank you! How can I help you today?"
}
```

## Troubleshooting

- **"API key not configured"** - Add the `GEMINI_API_KEY` environment variable in
  the Vercel dashboard (or `.env.local` locally) and redeploy.
- **"Invalid API key"** - Double-check that you copied the key correctly from
  Google AI Studio.
- **Only the static site loads but `/api/chat` 404s** - Make sure the files are in
  the `api/` directory at the repo root and committed.

## License

This project is for educational purposes. Use responsibly and follow Google's
[Gemini API Terms of Service](https://ai.google.dev/terms).