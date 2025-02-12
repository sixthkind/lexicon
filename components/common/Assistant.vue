<template>
  <div>

      <!-- Input Area -->
      <div v-if="!hasFirstMessage" class="input-container animated fadeInUp">
        <button 
          @click="sendMessage" 
          class="send-button"
          :disabled="!newMessage.trim()"
        >
          <Icon name="lucide:feather" size="1.4em" class="text-primary" />
        </button>

        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          type="text" 
          placeholder="What would you like to know?" 
          class="message-input placeholder:text-slate-500"
          ref="messageInput"
          autofocus
        >
      </div>

    <!-- Chat Messages -->
    <div class="messages-container" ref="messagesContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
      >
        <div 
          class="message-wrapper animated fadeInUp"
          v-if="message.role !== 'system' && message.role !== 'user'" 
          :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']"
        >
          <div class="markdown-wrapper">
            <vue-markdown :source="message.content" />
          </div>
        </div>
      </div>
      <div v-if="isTyping" class="message-wrapper animated fadeInUp">
        <div class="message assistant-message">
          <Icon name="lucide:feather" size="1.4em" class="text-primary typing-icon" />
          <div class="typing-indicator">
            <span class="bg-primary"></span>
            <span class="bg-primary"></span>
            <span class="bg-primary"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import prompt from './prompt'
import VueMarkdown from 'vue-markdown-render'

const config = useRuntimeConfig();
const openrouterApiKey = String(config.public.openrouterApiKey);
import OpenAI from 'openai'
const API_KEY = openrouterApiKey;

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': '_lexicon'
  },
  defaultQuery: { },
  fetch: (url, init) => {
    delete init.headers['x-stainless-timeout'];
    delete init.headers['x-stainless-async'];
    return fetch(url, init);
  }
})

const messagesContainer = ref(null)
const newMessage = ref('')
// const isTyping = ref(true)
const isTyping = ref(false)
const messages = ref(prompt)
const hasFirstMessage = ref(false)

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(
  messages,
  () => scrollToBottom(),
  { deep: true }
)

async function sendMessage() {
  if (!newMessage.value.trim()) return

  // Set hasFirstMessage to true when first message is sent
  hasFirstMessage.value = true

  // Add user message
  messages.value.push({ role: 'user', content: newMessage.value })
  const userMessage = newMessage.value
  newMessage.value = ''
  isTyping.value = true

  try {
    const stream = await openai.chat.completions.create({
      messages: messages.value.map(m => ({ role: m.role, content: m.content })),
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
    })

    let assistantMessage = ''
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      assistantMessage += content
      
      // Update the message in real-time
      if (messages.value[messages.value.length - 1].role === 'assistant') {
        messages.value[messages.value.length - 1].content = assistantMessage
      } else {
        messages.value.push({ role: 'assistant', content: assistantMessage })
      }
    }
  } catch (error) {
    console.error('Error:', error)
    console.error('Error:', error.message);
    messages.value.push({ role: 'assistant', content: 'I apologize, but I encountered an error. Please try again.' })
  } finally {
    isTyping.value = false
  }
}

function goBack() {
  window.history.back()
}

onMounted(scrollToBottom)
</script>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.messages-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.assistant-message {
  color: #3a4251;
}

.message {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 0.95rem;
}

.input-container {
  padding: 16px;
  display: flex;
  position: sticky;
  bottom: 0;
  border-radius: 25px;
}

.message-input {
  flex: 1;
  padding: 12px;
  border-radius: 25px;
  border: none;
  background: rgba(255, 255, 255, 0.6);
  outline: none;
}

.send-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.typing-icon {
  margin-left: -30px;
  margin-top: 10px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  margin-top: -14px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* Add these new styles for markdown content */
:deep(.markdown-body) {
  line-height: 1.6;
}

:deep(.markdown-body p) {
  margin: 1em 0;
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3),
:deep(.markdown-body h4),
:deep(.markdown-body h5),
:deep(.markdown-body h6) {
  margin-top: 1.5em;
  margin-bottom: 1em;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  margin: 1em 0;
  padding-left: 2em;
}

:deep(.markdown-body li) {
  margin: 0.5em 0;
}

:deep(.markdown-body pre) {
  margin: 1em 0;
  padding: 1em;
  background-color: #f6f8fa;
  border-radius: 6px;
}

:deep(.markdown-body code) {
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

.markdown-wrapper :deep(p) {
  margin: 1em 0;
}

.markdown-wrapper :deep(h1),
.markdown-wrapper :deep(h2),
.markdown-wrapper :deep(h3),
.markdown-wrapper :deep(h4),
.markdown-wrapper :deep(h5),
.markdown-wrapper :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 1em;
}

.markdown-wrapper :deep(ul),
.markdown-wrapper :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.markdown-wrapper :deep(li) {
  margin: 0.5em 0;
}

.markdown-wrapper :deep(pre) {
  margin: 1em 0;
  padding: 1em;
  background-color: #f6f8fa;
  border-radius: 6px;
}

.markdown-wrapper :deep(code) {
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}
</style>
