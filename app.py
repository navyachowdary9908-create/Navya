import os
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in .env file. Please add your API key.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model
MODEL_NAME = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
model = None
if GEMINI_API_KEY:
    try:
        model = genai.GenerativeModel(MODEL_NAME)
    except Exception as e:
        print(f"Error initializing model: {e}")

# Store conversation history
conversation_history = []

# System prompt to define the chatbot's behavior
SYSTEM_PROMPT = """You are a helpful, friendly, and knowledgeable AI assistant. 
You provide clear, accurate, and concise responses. 
You can help with a wide range of topics including general knowledge, coding, writing, analysis, and more.
Always be polite and professional in your responses."""


@app.route('/')
def index():
    """Serve the main chat interface."""
    return render_template('index.html')


@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages from the frontend."""
    if not GEMINI_API_KEY:
        return jsonify({'error': 'API key not configured. Please add your GEMINI_API_KEY to the .env file.'}), 500

    if not model:
        return jsonify({'error': 'Model not initialized. Check your API key and model configuration.'}), 500

    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400

        user_message = data['message'].strip()
        if not user_message:
            return jsonify({'error': 'Empty message'}), 400

        # Build the conversation context
        messages = [{'role': 'user', 'parts': [SYSTEM_PROMPT]}]

        # Add conversation history (last 10 messages for context)
        for msg in conversation_history[-10:]:
            messages.append({
                'role': msg['role'],
                'parts': [msg['content']]
            })

        # Add the current user message
        messages.append({'role': 'user', 'parts': [user_message]})

        # Generate response
        response = model.generate_content(messages)
        bot_response = response.text.strip()

        # Store in conversation history
        conversation_history.append({'role': 'user', 'content': user_message})
        conversation_history.append({'role': 'model', 'content': bot_response})

        return jsonify({'response': bot_response})

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/api/reset', methods=['POST'])
def reset_conversation():
    """Reset the conversation history."""
    global conversation_history
    conversation_history = []
    return jsonify({'status': 'success', 'message': 'Conversation reset'})


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    status = {
        'status': 'ok',
        'api_key_configured': bool(GEMINI_API_KEY),
        'model': MODEL_NAME if GEMINI_API_KEY else None
    }
    return jsonify(status)


if __name__ == '__main__':
    # Use PORT environment variable for Render, default to 5000 for local dev
    port = int(os.getenv('PORT', 5000))
    # Disable debug mode in production
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=port)
