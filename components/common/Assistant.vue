<template>
  <!-- Input Area -->
  <div v-if="!hasFirstMessage"
    class="input-container animated fadeInUp">
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

  <div v-if="hasFirstMessage"
    class="title-container animated fadeInUp">
      <h1 class="title">{{ title }}</h1> 
  </div>

  <div v-if="hasFirstMessage" 
    class="photo-search-container animated fadeInUp">
      <CommonPhotoSearch :input="title" @select="selectImage" />
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
          <vue-markdown class="markdown-body" :source="message.content" />
        </div>
      </div>
    </div>
    <div v-if="isTyping" class="message-wrapper animated fadeInUp">
      <div class="message assistant-message">
        <Icon name="lucide:feather" size="1.4em" class="text-primary typing-icon" />
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import prompt from './prompt'
import VueMarkdown from 'vue-markdown-render'
import { sendChatMessage, generateTitle } from '~/utils/ai'
import { addNote, getNotes } from '~/utils/notes'
import { useRoute } from 'vue-router'

const route = useRoute()
const messagesContainer = ref(null)
const newMessage = ref('')
const isTyping = ref(false)
const messages = ref([{ role: 'system', content: prompt }])
const hasFirstMessage = ref(false)
const title = ref('')

async function loadExistingNote() {
  const noteId = route.params.id
  if (noteId) {
    const notes = getNotes()
    const existingNote = notes.find(note => note.id === noteId)
    if (existingNote) {
      hasFirstMessage.value = true
      title.value = existingNote.title
      messages.value = [{ role: 'system', content: prompt }];
      messages.value.push({ role: 'assistant', content: existingNote.note })
    }
  }
}

loadExistingNote()

async function sendMessage() {
  if (!newMessage.value.trim()) return

  isTyping.value = true
  if (!hasFirstMessage.value) {
    hasFirstMessage.value = true
    title.value = await generateTitle(newMessage.value);
  }
  messages.value.push({ role: 'user', content: newMessage.value })
  // const userMessage = newMessage.value
  newMessage.value = ''

  try {
    const stream = await sendChatMessage(messages.value.map(m => ({ role: m.role, content: m.content })))

    let assistantMessage = ''
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      assistantMessage += content
      
      if (messages.value[messages.value.length - 1].role === 'assistant') {
        messages.value[messages.value.length - 1].content = assistantMessage
      } else {
        messages.value.push({ role: 'assistant', content: assistantMessage })
      }
    }

    addNote(title.value, assistantMessage);
    
  } catch (error) {
    console.error('Error:', error)
    console.error('Error:', error.message)
    messages.value.push({ role: 'assistant', content: 'I apologize, but I encountered an error. Please try again.' })
  } finally {
    isTyping.value = false
  }
}

function selectImage(image) {
  console.log(image)
}

</script>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 0px 40px 20px 40px;
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
  @apply bg-primary;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.title-container {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  padding: 12px 40px;
  z-index: 10;
  border-radius: 0 25px 0 0;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
}
</style>
