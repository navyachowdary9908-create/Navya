// Chat functionality
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const resetBtn = document.getElementById('resetBtn');
const typingIndicator = document.getElementById('typingIndicator');

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Send message on Enter (Shift+Enter for new line)
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Reset conversation
resetBtn.addEventListener('click', resetConversation);

// Send message function
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';
    userInput.focus();

    // Add user message to chat
    addMessage(message, 'user');

    // Show typing indicator
    showTypingIndicator();

    // Disable input while waiting
    setInputState(false);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        // Hide typing indicator
        hideTypingIndicator();

        // Add bot response
        addMessage(data.response, 'bot');
    } catch (error) {
        // Hide typing indicator
        hideTypingIndicator();

        // Show error message
        addMessage('Sorry, I encountered an error: ' + error.message, 'bot');
    } finally {
        // Re-enable input
        setInputState(true);
        userInput.focus();
    }
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = sender === 'user' ? '👤' : '🤖';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.classList.add('hidden');
}

// Scroll to bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Set input state
function setInputState(enabled) {
    userInput.disabled = !enabled;
    sendBtn.disabled = !enabled;
}

// Reset conversation
async function resetConversation() {
    try {
        const response = await fetch('/api/reset', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to reset conversation');
            
        }

        // Clear chat messages
        chatMessages.innerHTML = '';

        // Add welcome message
        addMessage('Hello! I\'m your AI assistant. How can I help you today?', 'bot');
    } catch (error) {
        addMessage('Failed to reset conversation: ' + error.message, 'bot');
    }
}

// Initialize
window.addEventListener('load', () => {
    userInput.focus();
});
