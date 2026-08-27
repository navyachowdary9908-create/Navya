# AI Chatbot

A complete web-based AI chatbot built with Python Flask backend and a clean, responsive HTML/CSS/JavaScript frontend. The chatbot uses the **Google Gemini API** for its AI brain.

## Features

- 💬 Real-time chat interface with a modern, responsive design
- 🤖 Powered by Google's Gemini AI model
- 🎨 Clean, gradient-based UI with smooth animations
- ⌨️ Enter to send, Shift+Enter for new line
- 🔄 Typing indicator while the AI is responding
- 🗑️ Clear conversation button
- 📱 Fully responsive - works on desktop, tablet, and mobile

## Project Structure

```
ai-chatbot/
├── app.py              # Flask backend with Gemini API integration
├── requirements.txt    # Python dependencies
├── .env                # Your API key (create this file)
├── .env.example        # Template for the .env file
├── README.md           # This file
├── templates/
│   └── index.html      # Frontend HTML
└── static/
    ├── style.css       # Frontend styling
    └── script.js       # Frontend JavaScript logic
```

## Setup Instructions

### 1. Get a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API Key"** in the left sidebar
4. Click **"Create API key"** and copy the generated key

### 2. Configure the API Key

Create a file named `.env` in the `ai-chatbot` directory (or edit the existing one) and add:

```
GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key.

### 3. Install Dependencies

```bash
cd ai-chatbot
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

Then open your browser and go to: **http://127.0.0.1:5000**

## Usage

- Type your message in the input box and press **Enter** (or click the send button)
- Press **Shift+Enter** to add a new line in the input
- Click the **trash icon** in the header to clear the conversation
- The chatbot will respond using Google's Gemini AI

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serves the chat interface |
| POST | `/api/chat` | Sends a message to Gemini and returns the response |

### POST /api/chat

**Request body:**
```json
{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "response": "I'm doing well, thank you! How can I help you today?"
}
```

## Deploy to Render (Free Cloud Hosting)

This project is configured for one-click deployment to [Render](https://render.com).

### Option 1: Deploy via Render Dashboard (Recommended)

1. **Push this code to a GitHub repository** (see instructions below)
2. Go to [Render.com](https://render.com) and sign up (free tier available)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` config and use the correct settings
6. In the **"Environment"** section, add the environment variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** `your_actual_gemini_api_key`
7. Click **"Create Web Service"**
8. Render will build and deploy your app automatically
9. Once deployed, you'll get a URL like `https://your-app-name.onrender.com`

### Option 2: Deploy via render.yaml (Blueprint)

The included `render.yaml` file configures:
- **Service type:** Web Service
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `gunicorn app:app`
- **Runtime:** Python 3.11

### Push Code to GitHub

```bash
cd ai-chatbot
git init
git add .
git commit -m "Initial commit - AI Chatbot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-chatbot.git
git push -u origin main
```

### Important: API Key on Render

- **Never** commit your real `.env` file (it's in `.gitignore`)
- Add `GEMINI_API_KEY` as an **environment variable** in Render's dashboard
- The app reads the key from the environment variable at runtime

## Troubleshooting

- **"API key not configured"** - Make sure your `.env` file exists and contains a valid `GEMINI_API_KEY`
- **"Invalid API key"** - Double-check that you copied the API key correctly from Google AI Studio
- **Port already in use** - Change the port in `app.py` (line: `app.run(debug=True, port=5000)`)

## License

This project is for educational purposes. Use responsibly and follow Google's [Gemini API Terms of Service](https://ai.google.dev/terms).