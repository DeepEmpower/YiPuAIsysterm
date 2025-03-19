<template>
  <div class="chat-container">
    <!-- 顶部导航栏 -->
    <div class="chat-header">
      <div class="header-left">
        <el-button @click="goBack" text>
          <el-icon><Back /></el-icon>
          返回
        </el-button>
        <h2>产品客服助手</h2>
      </div>
      <div class="header-right">
        <el-button @click="clearChat" text type="danger">
          <el-icon><Delete /></el-icon>
          清空对话
        </el-button>
      </div>
    </div>

    <!-- 聊天内容区域 -->
    <div class="chat-content" ref="chatContentRef">
      <!-- 欢迎消息 -->
      <div class="message system-message">
        <div class="message-content">
          <p>👋 您好！我是您的产品客服助手。我可以：</p>
          <ul>
            <li>解答产品使用问题</li>
            <li>提供技术支持指导</li>
            <li>处理产品相关咨询</li>
            <li>推荐适合的解决方案</li>
          </ul>
          <p>请问有什么可以帮您？</p>
        </div>
      </div>

      <!--对话消息列表-->
      <div 
        v-for="(message, index) in chatMessages" 
        :key="index" 
        :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']"
      >
        <div class="message-avatar">
          <img 
            :src="message.role === 'user' ? userAvatar : assistantAvatar" 
            :alt="message.role === 'user' ? '用户' : '助手'"
          >
        </div>
        <div class="message-content">
          <div class="message-text" v-html="formatMessage(message.content)"></div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div class="message assistant-message" v-if="isLoading">
        <div class="message-avatar">
          <img :src="assistantAvatar" alt="助手">
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input">
      <div class="input-container">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题（Shift + Enter 换行，Enter 发送）"
          resize="none"
          @keydown.enter.prevent="handleEnterPress"
        />
        <el-button 
          type="primary" 
          :disabled="!userInput.trim() || isLoading"
          @click="sendMessage"
        >
          <el-icon><Position /></el-icon>
          发送
        </el-button>
      </div>
      <div class="input-tips">
        <el-icon><InfoFilled /></el-icon>
        <span>支持多轮对话，AI会记住上下文</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Back, Delete, Position, InfoFilled } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt()

const router = useRouter()
const chatContentRef = ref<HTMLElement | null>(null)
const userInput = ref('')
const isLoading = ref(false)
const chatMessages = ref<Array<{
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}>>([])

// 头像图片路径
const userAvatar = '/src/assets/images/avatars/user.png'
const assistantAvatar = '/src/assets/images/avatars/avatar6.png'

// 返回上一页
const goBack = () => {
  router.back()
}

// 清空对话
const clearChat = () => {
  ElMessageBox.confirm(
    '确定要清空所有对话记录吗？',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    chatMessages.value = []
    ElMessage.success('对话已清空')
  })
}

// 处理消息发送
const sendMessage = async () => {
  const message = userInput.value.trim()
  if (!message || isLoading.value) return

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: message,
    timestamp: Date.now()
  })

  // 清空输入框
  userInput.value = ''

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 设置加载状态
  isLoading.value = true

  try {
    // TODO: 调用API发送消息
    // const response = await sendMessageToAPI(message)
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockResponse = `感谢您的咨询！我理解您的问题，让我为您详细说明：

1. 首先，请确认您遇到的具体情况
2. 我会根据产品类型提供相应解决方案
3. 如果需要，我可以提供更详细的操作指南

您可以随时告诉我更多细节，我会为您提供更精准的帮助。`

    // 添加助手回复
    chatMessages.value.push({
      role: 'assistant',
      content: mockResponse,
      timestamp: Date.now()
    })

  } catch (error) {
    ElMessage.error('消息发送失败，请重试')
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

// 处理Enter键按下
const handleEnterPress = (e: KeyboardEvent) => {
  if (e.shiftKey) return // Shift + Enter 换行
  sendMessage()
}

// 格式化消息内容（支持Markdown）
const formatMessage = (content: string) => {
  const html = md.render(content)
  return DOMPurify.sanitize(html)
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 滚动到底部
const scrollToBottom = () => {
  if (chatContentRef.value) {
    chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
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
  height: 100vh;
  background-color: #f5f7fa;

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    z-index: 1;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      h2 {
        margin: 0;
        font-size: 18px;
        color: #303133;
      }
    }
  }

  .chat-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    
    .message {
      display: flex;
      margin-bottom: 24px;
      
      .message-avatar {
        width: 40px;
        height: 40px;
        margin-right: 16px;
        flex-shrink: 0;
        
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
      }
      
      .message-content {
        flex: 1;
        max-width: 80%;
        
        .message-text {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.6;
          
          :deep(p) {
            margin: 0 0 10px;
            &:last-child {
              margin-bottom: 0;
            }
          }
          
          :deep(ul) {
            margin: 8px 0;
            padding-left: 20px;
          }
        }
        
        .message-time {
          margin-top: 4px;
          font-size: 12px;
          color: #909399;
        }
      }
    }
    
    .user-message {
      flex-direction: row-reverse;
      
      .message-avatar {
        margin-right: 0;
        margin-left: 16px;
      }
      
      .message-content {
        .message-text {
          background-color: #409eff;
          color: #fff;
        }
        
        .message-time {
          text-align: right;
        }
      }
    }
    
    .assistant-message {
      .message-content {
        .message-text {
          background-color: #fff;
          color: #303133;
        }
      }
    }

    .system-message {
      .message-content {
        max-width: 100%;
        
        .message-text {
          background-color: #f4f4f5;
          color: #606266;
        }
      }
    }
  }

  .chat-input {
    padding: 16px 24px;
    background-color: #fff;
    border-top: 1px solid #ebeef5;
    
    .input-container {
      display: flex;
      gap: 16px;
      
      .el-input {
        flex: 1;
      }
      
      .el-button {
        height: auto;
      }
    }
    
    .input-tips {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
    }
  }
}

// 打字动画
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 8px;
  
  span {
    width: 8px;
    height: 8px;
    background-color: #dcdfe6;
    border-radius: 50%;
    animation: typing 1s infinite;
    
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
</style> 