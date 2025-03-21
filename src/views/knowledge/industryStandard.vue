<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>出版规范助手</h2>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" 
           :class="['message', message.type]">
        <div class="message-content">
          {{ message.content }}
        </div>
      </div>
      
      <div v-if="isGenerating" class="message assistant">
        <div class="message-content">
          {{ currentResponse }}
          <span class="cursor">|</span>
        </div>
      </div>
    </div>
    
    <div class="chat-input">
      <el-input
        v-model="userInput"
        type="textarea"
        :rows="3"
        placeholder="请输入您的出版规范问题..."
        @keyup.enter.ctrl="sendMessage"
        :disabled="isGenerating"
      />
      <el-button 
        type="primary" 
        @click="sendMessage"
        :loading="isGenerating"
        :disabled="!userInput.trim() || isGenerating"
      >
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useIndustryStandardChat } from '@/api/industryStandard'
import { ElMessage } from 'element-plus'

interface Message {
  type: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([])
const userInput = ref('')
const currentResponse = ref('')
const isGenerating = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const { state, sendIndustryStandardChat } = useIndustryStandardChat()

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isGenerating.value) return
  
  const query = userInput.value.trim()
  messages.value.push({
    type: 'user',
    content: query
  })
  
  userInput.value = ''
  currentResponse.value = ''
  isGenerating.value = true
  
  try {
    await sendIndustryStandardChat(query, (content) => {
      currentResponse.value = content
      scrollToBottom()
    })
    
    messages.value.push({
      type: 'assistant',
      content: currentResponse.value
    })
    
    currentResponse.value = ''
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 组件挂载时滚动到底部
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
  
  .chat-header {
    padding: 16px;
    background-color: white;
    border-bottom: 1px solid #e4e7ed;
    
    h2 {
      margin: 0;
      font-size: 18px;
      color: #303133;
    }
  }
  
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    
    .message {
      margin-bottom: 20px;
      max-width: 80%;
      
      &.user {
        margin-left: auto;
        
        .message-content {
          background-color: #409EFF;
          color: white;
          border-radius: 12px 12px 0 12px;
        }
      }
      
      &.assistant {
        margin-right: auto;
        
        .message-content {
          background-color: white;
          color: #303133;
          border-radius: 12px 12px 12px 0;
        }
      }
      
      .message-content {
        padding: 12px 16px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        
        .cursor {
          display: inline-block;
          width: 2px;
          height: 16px;
          background-color: #409EFF;
          margin-left: 4px;
          animation: blink 1s infinite;
        }
      }
    }
  }
  
  .chat-input {
    padding: 16px;
    background-color: white;
    border-top: 1px solid #e4e7ed;
    display: flex;
    gap: 12px;
    
    .el-input {
      flex: 1;
    }
    
    .el-button {
      align-self: flex-end;
    }
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
