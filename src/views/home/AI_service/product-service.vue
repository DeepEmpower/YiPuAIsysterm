<template>
  <div class="product-service-container">
    <!-- 顶部标题和操作栏 -->
    <div class="header-section">
      <div class="title-area">
        <div class="title-text">
          <el-icon><Back /></el-icon>
          <a href="#" @click.prevent="goBack">返回AI客服团队</a>
          <span class="divider">|</span>
          <span class="page-title">产品客服助手</span>
        </div>
      </div>
      <div class="action-area">
        <el-tooltip content="清空对话记录" placement="top">
          <el-button type="danger" link @click="handleClearChat">
            <el-icon><Delete /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 主内容区域 - 左右两栏结构 -->
    <div class="content-wrapper">
      <!-- 左侧栏：聊天记录 -->
      <div class="left-column">
        <div class="chat-section">
          <div class="chat-content" ref="chatAreaRef">
            <!-- 欢迎消息 -->
            <div class="welcome-message">
              <div class="assistant-avatar">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="35" r="25" fill="#409EFF" />
                  <path d="M90,100H10C10,70 40,65 50,65C60,65 90,70 90,100Z" fill="#409EFF" />
                </svg>
              </div>
              <div class="welcome-content">
                <h3>您好！我是您的产品客服助手 👋</h3>
                <p>我可以帮您：</p>
                <ul>
                  <li>解答产品使用问题</li>
                  <li>提供技术支持指导</li>
                  <li>处理产品相关咨询</li>
                  <li>推荐适合的解决方案</li>
                </ul>
                <p>请问有什么可以帮您？</p>
              </div>
            </div>

            <!-- 消息列表 -->
            <div class="message-list">
              <div 
                v-for="(msg, index) in messages" 
                :key="index"
                :class="['message', msg.role === 'user' ? 'user-message' : 'assistant-message']"
              >
                <div class="message-avatar">
                  <template v-if="msg.role === 'user'">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="35" r="25" fill="#FFB940" />
                      <path d="M90,100H10C10,70 40,65 50,65C60,65 90,70 90,100Z" fill="#FFB940" />
                    </svg>
                  </template>
                  <template v-else>
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="35" r="25" fill="#409EFF" />
                      <path d="M90,100H10C10,70 40,65 50,65C60,65 90,70 90,100Z" fill="#409EFF" />
                    </svg>
                  </template>
                </div>
                <div class="message-body">
                  <div class="message-content" v-html="formatMessage(msg.content)"></div>
                  <div class="message-meta">{{ formatTime(msg.timestamp) }}</div>
                </div>
              </div>

              <!-- 加载状态 -->
              <div v-if="isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user'" 
                   class="message assistant-message">
                <div class="message-avatar">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="35" r="25" fill="#409EFF" />
                    <path d="M90,100H10C10,70 40,65 50,65C60,65 90,70 90,100Z" fill="#409EFF" />
                  </svg>
                </div>
                <div class="message-body">
                  <div class="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-section">
          <div class="input-wrapper">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="3"
              :placeholder="isLoading ? '正在回复中...' : '请输入您的问题（Shift + Enter 换行，Enter 发送）'"
              resize="none"
              @keydown.enter.prevent="handleEnterPress"
            />
            <el-button 
              type="primary" 
              :disabled="!userInput.trim() || isLoading"
              @click="handleSendMessage"
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

      <!-- 右侧栏：产品信息 -->
      <div class="right-column">
        <div class="product-info-section">
          <div class="section-title">
            <h3>产品信息</h3>
          </div>
          <div class="product-details">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="产品名称">示例产品</el-descriptions-item>
              <el-descriptions-item label="产品版本">v1.0.0</el-descriptions-item>
              <el-descriptions-item label="产品类型">软件服务</el-descriptions-item>
              <el-descriptions-item label="支持平台">Web/移动端</el-descriptions-item>
              <el-descriptions-item label="更新时间">2024-03-19</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <div class="quick-actions-section">
          <div class="section-title">
            <h3>快捷操作</h3>
          </div>
          <div class="quick-actions">
            <el-button-group>
              <el-button type="primary" plain>
                <el-icon><Document /></el-icon>
                查看文档
              </el-button>
              <el-button type="primary" plain>
                <el-icon><VideoPlay /></el-icon>
                视频教程
              </el-button>
              <el-button type="primary" plain>
                <el-icon><QuestionFilled /></el-icon>
                常见问题
              </el-button>
            </el-button-group>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Back, Delete, Position, InfoFilled, Document, VideoPlay, QuestionFilled } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { sendStreamingMessage } from '@/api/customerService'

// 初始化markdown解析器
const md = new MarkdownIt({
  breaks: true,
  linkify: true
})

// 状态管理
const router = useRouter()
const chatAreaRef = ref<HTMLElement | null>(null)
const userInput = ref('')
const isLoading = ref(false)
const messages = ref<Array<{
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}>>([])

// 用户标识
const userId = ref(`user-${Date.now()}`)
const conversationId = ref('')

// 返回上一页
const goBack = () => router.back()

// 清空对话
const handleClearChat = () => {
  ElMessageBox.confirm(
    '确定要清空所有对话记录吗？',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    messages.value = []
    conversationId.value = ''
    ElMessage.success('对话已清空')
  }).catch(() => {})
}

// 发送消息
const handleSendMessage = async () => {
  const content = userInput.value.trim()
  if (!content || isLoading.value) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content,
    timestamp: Date.now()
  })

  // 清空输入框并滚动到底部
  userInput.value = ''
  await nextTick()
  scrollToBottom()

  // 设置加载状态
  isLoading.value = true

  try {
    // 使用流式响应
    const cleanup = sendStreamingMessage(
      content,
      {
        onMessage: (text) => {
          // 检查是否已经有助手的回复消息
          const lastMessage = messages.value[messages.value.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            // 更新现有消息
            lastMessage.content = text
          } else {
            // 添加新的助手消息
            messages.value.push({
              role: 'assistant',
              content: text,
              timestamp: Date.now()
            })
          }
          scrollToBottom()
        },
        onError: (error) => {
          console.error('消息发送失败:', error)
          ElMessage.error('消息发送失败，请重试')
          isLoading.value = false
        },
        onComplete: () => {
          isLoading.value = false
          scrollToBottom()
        }
      },
      conversationId.value,
      userId.value
    )

    // 组件卸载时清理
    onUnmounted(() => {
      cleanup()
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('消息发送失败，请重试')
    isLoading.value = false
  }
}

// 处理回车键
const handleEnterPress = (e: KeyboardEvent) => {
  if (e.shiftKey) return
  handleSendMessage()
}

// 格式化消息内容
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
  if (chatAreaRef.value) {
    chatAreaRef.value.scrollTop = chatAreaRef.value.scrollHeight
  }
}

// 组件挂载时初始化
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped lang="scss">
.product-service-container {
  padding: 0;
  background-color: #f0f2f5;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .header-section {
    padding: 10px 20px;
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e4e7ed;
    
    .title-text {
      display: flex;
      align-items: center;
      font-size: 14px;
      
      a {
        color: #409EFF;
        text-decoration: none;
        margin-left: 5px;
        
        &:hover {
          text-decoration: underline;
        }
      }
      
      .divider {
        margin: 0 10px;
        color: #dcdfe6;
      }
      
      .page-title {
        font-weight: 600;
        color: #303133;
      }
    }
  }
  
  .content-wrapper {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .left-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: white;
    border-right: 1px solid #e4e7ed;
  }
  
  .right-column {
    width: 300px;
    background-color: white;
    overflow-y: auto;
    padding: 20px;
  }
  
  .chat-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .chat-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(144, 147, 153, 0.3);
      border-radius: 2px;

      &:hover {
        background: rgba(144, 147, 153, 0.5);
      }
    }

    .welcome-message {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;

      .assistant-avatar {
        width: 48px;
        height: 48px;
        border-radius: 24px;
        overflow: hidden;
        flex-shrink: 0;
        background: #fff;
        padding: 2px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        svg {
          width: 100%;
          height: 100%;
        }
      }

      .welcome-content {
        flex: 1;

        h3 {
          margin: 0 0 12px;
          font-size: 16px;
          color: #303133;
        }

        p {
          margin: 8px 0;
          color: #606266;
        }

        ul {
          margin: 12px 0;
          padding-left: 20px;
          color: #606266;

          li {
            margin-bottom: 6px;
            position: relative;

            &::before {
              content: '';
              position: absolute;
              left: -12px;
              top: 8px;
              width: 4px;
              height: 4px;
              background: currentColor;
              border-radius: 50%;
              opacity: 0.6;
            }
          }
        }
      }
    }

    .message-list {
      .message {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
        opacity: 0;
        transform: translateY(10px);
        animation: messageIn 0.3s ease forwards;

        @keyframes messageIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 18px;
          overflow: hidden;
          flex-shrink: 0;
          background: #fff;
          padding: 2px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          svg {
            width: 100%;
            height: 100%;
          }
        }

        .message-body {
          max-width: 70%;

          .message-content {
            padding: 12px 16px;
            background: #f9f9f9;
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.6;
            color: #303133;

            :deep(p) {
              margin: 0 0 8px;

              &:last-child {
                margin-bottom: 0;
              }
            }

            :deep(ul) {
              margin: 8px 0;
              padding-left: 16px;
            }
          }

          .message-meta {
            margin-top: 4px;
            font-size: 12px;
            color: #909399;
            opacity: 0.8;
          }
        }

        &.user-message {
          flex-direction: row-reverse;

          .message-body {
            .message-content {
              background: #409eff;
              color: #fff;
            }

            .message-meta {
              text-align: right;
            }
          }
        }
      }
    }
  }
  
  .input-section {
    padding: 20px;
    border-top: 1px solid #e4e7ed;
    background-color: white;

    .input-wrapper {
      display: flex;
      gap: 12px;

      :deep(.el-textarea__inner) {
        min-height: 72px !important;
        padding: 12px;
        font-size: 14px;
        border-radius: 8px;
        resize: none;
        border-color: #dcdfe6;
        transition: all 0.3s;

        &:hover {
          border-color: #c0c4cc;
        }

        &:focus {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
        }
      }

      .el-button {
        height: 72px;
        padding: 0 24px;
        font-size: 14px;

        .el-icon {
          margin-right: 4px;
          font-size: 16px;
        }
      }
    }

    .input-tips {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
      opacity: 0.8;

      .el-icon {
        font-size: 14px;
        color: #409eff;
      }
    }
  }

  .section-title {
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .product-info-section {
    margin-bottom: 30px;
  }

  .quick-actions-section {
    .quick-actions {
      .el-button-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
        
        .el-button {
          width: 100%;
          justify-content: flex-start;
          
          .el-icon {
            margin-right: 8px;
          }
        }
      }
    }
  }
}

.typing-indicator {
  display: inline-flex;
  gap: 4px;
  padding: 12px 16px;
  background: #f9f9f9;
  border-radius: 8px;

  span {
    width: 6px;
    height: 6px;
    background: #409eff;
    border-radius: 50%;
    opacity: 0.6;
    animation: typing 1s infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(-4px); opacity: 1; }
}

@media (max-width: 768px) {
  .product-service-container {
    .content-wrapper {
      flex-direction: column;
    }
    
    .right-column {
      width: 100%;
      height: 200px;
    }
    
    .left-column {
      flex: 1;
    }
  }
}
</style> 