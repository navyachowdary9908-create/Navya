// Chat functionality (TypeScript)

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

interface ChatResponse {
  response?: string;
  error?: string;
}

const chatMessages = document.getElementById("chatMessages") as HTMLDivElement;
const userInput = document.getElementById("userInput") as HTMLTextAreaElement;
const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
const typingIndicator = document.getElementById(
  "typingIndicator"
) as HTMLDivElement;

// Conversation history lives on the client because Vercel serverless
// functions are stateless. It is sent with each chat request for context.
let conversationHistory: ChatMessage[] = [];

// Auto-resize textarea
userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
});

// Send message on Enter (Shift+Enter for a new line)
userInput.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    void sendMessage();
  }
});

// Send message on button click
sendBtn.addEventListener("click", () => void sendMessage());

// Reset conversation
resetBtn.addEventListener("click", () => void resetConversation());

async function sendMessage(): Promise<void> {
  const message = userInput.value.trim();
  if (!message) return;

  userInput.value = "";
  userInput.style.height = "auto";
  userInput.focus();

  addMessage(message, "user");
  showTypingIndicator();
  setInputState(false);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: conversationHistory,
      }),
    });

    const data: ChatResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    const botResponse = data.response || "";
    // Store both turns in local history for context on the next message.
    conversationHistory.push({ role: "user", content: message });
    conversationHistory.push({ role: "model", content: botResponse });

    hideTypingIndicator();
    addMessage(botResponse, "bot");
  } catch (error) {
    hideTypingIndicator();
    addMessage(
      "Sorry, I encountered an error: " +
        (error instanceof Error ? error.message : String(error)),
      "bot"
    );
  } finally {
    setInputState(true);
    userInput.focus();
  }
}

function addMessage(text: string, sender: "user" | "bot"): void {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}-message`;

  const avatarDiv = document.createElement("div");
  avatarDiv.className = "message-avatar";
  avatarDiv.textContent = sender === "user" ? "👤" : "🤖";

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.textContent = text;

  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);

  scrollToBottom();
}

function showTypingIndicator(): void {
  typingIndicator.classList.remove("hidden");
  scrollToBottom();
}

function hideTypingIndicator(): void {
  typingIndicator.classList.add("hidden");
}

function scrollToBottom(): void {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setInputState(enabled: boolean): void {
  userInput.disabled = !enabled;
  sendBtn.disabled = !enabled;
}

async function resetConversation(): Promise<void> {
  try {
    const response = await fetch("/api/reset", { method: "POST" });

    if (!response.ok) {
      throw new Error("Failed to reset conversation");
    }

    conversationHistory = [];
    chatMessages.innerHTML = "";
    addMessage("Hello! I'm your AI assistant. How can I help you today?", "bot");
  } catch (error) {
    addMessage(
      "Failed to reset conversation: " +
        (error instanceof Error ? error.message : String(error)),
      "bot"
    );
  }
}

window.addEventListener("load", () => {
  userInput.focus();
});