import { ref } from 'vue'

// 定义请求接口
export interface IndustryStandardRequest {
  inputs: Record<string, any>
  query: string
  response_mode: 'streaming' | 'blocking'
  conversation_id: string
  user: string
}

// 定义响应接口
export interface IndustryStandardResponse {
  event: string
  conversation_id: string
  message_id: string
  created_at: number
  task_id: string
  id: string
  answer: string
  from_variable_selector: null | string
}

// 定义状态接口
export interface IndustryStandardState {
  isGenerating: boolean
  error: string | null
  content: string
  conversationId: string
}

// 创建响应式状态
const state = ref<IndustryStandardState>({
  isGenerating: false,
  error: null,
  content: '',
  conversationId: ''
})

// 发送聊天消息的函数
export const sendIndustryStandardChat = async (
  query: string,
  onProgress?: (content: string) => void
): Promise<IndustryStandardResponse> => {
  state.value.isGenerating = true
  state.value.error = null
  state.value.content = ''
  
  try {
    // 使用代理服务器解决CORS问题
    const response = await fetch('/api/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: 'streaming',
        conversation_id: state.value.conversationId,
        user: 'abc-123'
      })
    })

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }

    let accumulatedContent = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      // 将Uint8Array转换为字符串
      const chunk = new TextDecoder().decode(value)
      
      // 处理SSE格式的数据
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.answer) {
              accumulatedContent += data.answer
              state.value.content = accumulatedContent
              state.value.conversationId = data.conversation_id
              
              // 调用进度回调
              if (onProgress) {
                onProgress(accumulatedContent)
              }
            }
          } catch (e) {
            console.error('解析响应数据失败:', e)
          }
        }
      }
    }
    
    return {
      event: 'message',
      conversation_id: state.value.conversationId,
      message_id: '',
      created_at: Math.floor(Date.now() / 1000),
      task_id: '',
      id: '',
      answer: accumulatedContent,
      from_variable_selector: null
    }
  } catch (error) {
    state.value.error = error instanceof Error ? error.message : '请求失败'
    throw error
  } finally {
    state.value.isGenerating = false
  }
}

// 导出状态和函数
export const useIndustryStandardChat = () => {
  return {
    state,
    sendIndustryStandardChat
  }
} 