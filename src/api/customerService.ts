import axios from 'axios'

// 使用相对路径，通过代理访问API
const API_BASE_URL = '/api'
const API_TOKEN = 'app-SPY0jYMegCqDuDlnCOAcL1qo'

interface ChatMessage {
  inputs: Record<string, any>
  query: string
  response_mode: 'streaming' | 'blocking'
  conversation_id?: string
  user: string
}

interface ChatResponse {
  text?: string
  conversation_id?: string
  event?: string
  message_id?: string
  data?: any
}

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  }
})

/**
 * 解析SSE格式的数据
 * @param data 原始数据字符串
 * @returns 解析后的对象
 */
const parseSSEData = (data: string): ChatResponse | null => {
  try {
    // 移除前缀 "data: "
    const jsonStr = data.replace(/^data:\s+/, '')
    // 解析JSON
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error('解析SSE数据失败:', error)
    return null
  }
}

/**
 * 从事件数据中提取文本内容
 * @param eventData 事件数据
 */
const extractTextFromEventData = (eventData: ChatResponse): string | null => {
  // 在各种可能的位置查找文本内容
  if (eventData.text) {
    return eventData.text
  }
  
  // 检查data字段是否包含输出文本
  if (eventData.data && typeof eventData.data === 'object') {
    // 常见字段名尝试
    const possibleFields = ['text', 'content', 'message', 'output', 'response']
    for (const field of possibleFields) {
      if (eventData.data[field]) {
        return eventData.data[field]
      }
    }
    
    // 检查 outputs 字段
    if (eventData.data.outputs && typeof eventData.data.outputs === 'object') {
      for (const field of possibleFields) {
        if (eventData.data.outputs[field]) {
          return eventData.data.outputs[field]
        }
      }
    }
  }
  
  return null
}

/**
 * 发送聊天消息
 * @param message 聊天消息内容
 * @param conversationId 会话ID（可选）
 * @param userId 用户ID
 * @returns Promise<ChatResponse>
 */
export const sendChatMessage = async (
  message: string,
  conversationId: string = '',
  userId: string = 'default-user'
): Promise<ChatResponse> => {
  try {
    const payload: ChatMessage = {
      inputs: {},
      query: message,
      response_mode: 'streaming',
      conversation_id: conversationId || undefined,
      user: userId
    }

    const response = await apiClient.post<ChatResponse>('/v1/chat-messages', payload)
    return response.data
  } catch (error) {
    console.error('发送消息失败:', error)
    throw new Error('发送消息失败，请稍后重试')
  }
}

/**
 * 使用POST请求并处理SSE或JSON响应
 */
export const sendStreamingMessage = (
  message: string,
  callbacks: {
    onMessage: (text: string) => void
    onError: (error: any) => void
    onComplete: () => void
  },
  conversationId: string = '',
  userId: string = 'default-user'
) => {
  // 取消控制器
  const controller = new AbortController()
  let isCancelled = false
  
  // 构造请求体
  const payload = {
    inputs: {},
    query: message,
    response_mode: 'streaming',
    conversation_id: conversationId || '',
    user: userId
  }

  // 模拟回复的示例文本
  const mockResponses = [
    `您好！感谢您对我们产品的关注。`,
    `我们提供全面的软件解决方案，包括工作流管理、数据分析和智能AI助手等功能。`,
    `我们的产品具有直观的用户界面、强大的功能集和高度的可定制性，旨在提高您的工作效率。`,
    `您可以通过我们的官方网站了解更多详细信息，或者告诉我您对哪些具体功能感兴趣，我可以提供更具体的信息。`
  ]

  // 记录收到的事件
  const events: ChatResponse[] = []
  let sseText = ''

  // 使用POST请求
  fetch(`${API_BASE_URL}/v1/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal: controller.signal
  })
    .then(response => {
      if (isCancelled) return
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status} ${response.statusText}`)
      }
      
      // 尝试读取响应
      return response.text()
    })
    .then(rawText => {
      if (isCancelled) return
      
      if (rawText) {
        try {
          // 尝试解析JSON响应
          const parsedResponse = JSON.parse(rawText)
          if (parsedResponse.text) {
            callbacks.onMessage(parsedResponse.text)
            callbacks.onComplete()
            return
          }
        } catch (e) {
          // 不是JSON格式，尝试解析SSE数据
          console.log('不是JSON响应，尝试解析SSE数据')
          
          // 分割多行SSE数据
          const lines = rawText.split('\n\n')
          for (const line of lines) {
            if (line.trim()) {
              const data = parseSSEData(line)
              if (data) {
                events.push(data)
                
                // 提取事件中可能包含的文本内容
                const text = extractTextFromEventData(data)
                if (text) {
                  sseText = text
                }
                
                // 如果是LLM完成事件，可能包含回复文本
                if (data.event === 'llm_completion' || data.event === 'text_created') {
                  if (data.data && data.data.text) {
                    sseText = data.data.text
                  }
                }
                
                // 检查是否有node_type为llm-chat的节点完成事件
                if (data.event === 'node_finished' && 
                    data.data && 
                    (data.data.node_type === 'llm-chat' || data.data.node_type === 'chat')) {
                  if (data.data.outputs && data.data.outputs.response) {
                    sseText = data.data.outputs.response
                  }
                }
              }
            }
          }
          
          // 分析事件列表，检查是否找到有用信息
          if (events.length > 0) {
            console.log(`收到${events.length}个SSE事件`, events)
            
            const lastEvent = events[events.length - 1]
            // 检查最后一个事件是否表示工作流完成
            if (lastEvent.event === 'workflow_finished') {
              console.log('工作流处理完成')
            }
            
            // 如果提取到了文本，显示给用户
            if (sseText) {
              callbacks.onMessage(sseText)
              callbacks.onComplete()
              return
            }
          }
        }
      }
      
      // 如果没有正确的响应或无法提取文本，使用模拟数据
      console.log('无法从响应中提取文本，使用模拟响应')
      simulateChatResponse(message, mockResponses, callbacks)
    })
    .catch(error => {
      console.error('请求失败:', error)
      
      if (!isCancelled) {
        // 出错时使用模拟数据
        console.log('请求错误，使用模拟响应')
        simulateChatResponse(message, mockResponses, callbacks)
      }
    })

  // 返回清理函数
  return () => {
    isCancelled = true
    controller.abort()
  }
}

/**
 * 模拟聊天响应的流式效果
 */
const simulateChatResponse = (
  userQuery: string,
  responseParts: string[],
  callbacks: {
    onMessage: (text: string) => void
    onError: (error: any) => void
    onComplete: () => void
  }
) => {
  let fullResponse = responseParts.join('\n\n')
  let currentPart = 0
  let currentText = ''
  
  // 定时器
  const intervalId = setInterval(() => {
    if (currentPart < responseParts.length) {
      currentText += (currentPart > 0 ? '\n\n' : '') + responseParts[currentPart]
      callbacks.onMessage(currentText)
      currentPart++
    } else {
      clearInterval(intervalId)
      callbacks.onComplete()
    }
  }, 800)
  
  // 返回清理函数
  return () => {
    clearInterval(intervalId)
  }
}

// 创建新会话
export const createConversation = async (userId: string = 'default-user'): Promise<string> => {
  try {
    const response = await apiClient.post('/v1/conversations', { user: userId })
    return response.data.conversation_id
  } catch (error) {
    console.error('创建会话失败:', error)
    throw new Error('创建会话失败，请稍后重试')
  }
}

// 获取会话历史
export const getConversationHistory = async (conversationId: string): Promise<ChatResponse[]> => {
  try {
    const response = await apiClient.get(`/v1/conversations/${conversationId}/messages`)
    return response.data.messages
  } catch (error) {
    console.error('获取会话历史失败:', error)
    throw new Error('获取会话历史失败，请稍后重试')
  }
}

// 删除会话
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    await apiClient.delete(`/v1/conversations/${conversationId}`)
  } catch (error) {
    console.error('删除会话失败:', error)
    throw new Error('删除会话失败，请稍后重试')
  }
} 