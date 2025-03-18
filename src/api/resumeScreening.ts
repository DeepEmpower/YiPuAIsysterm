import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 定义状态接口
interface ResumeScreeningState {
  isGenerating: boolean
  content: string
  history: Array<{
    id: string
    title: string
    content: string
    timestamp: string
  }>
}

// 定义配置接口
interface ResumeScreeningConfig {
  title: string
  requirements: string
  additional: string
  files: any[]
}

// 创建状态
const state = ref<ResumeScreeningState>({
  isGenerating: false,
  content: '',
  history: []
})

// 创建配置
const config = ref<ResumeScreeningConfig>({
  title: '',
  requirements: '',
  additional: '',
  files: []
})

// 上传文件到服务器并获取文件ID
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file, file.name)  // 添加文件名
  formData.append('user', 'abc-123')  // 添加用户信息
  
  try {
    const response = await fetch('/dify-api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-XJWYvw9yq3Y2aGQgtFPICi1B'  // 更新token
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('文件上传失败:', errorData)
      throw new Error(errorData.message || '文件上传失败')
    }

    const result = await response.json()
    console.log('文件上传结果:', result)
    if (!result.id) {
      throw new Error('文件上传成功但未返回文件ID')
    }
    return result.id
  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}

// 生成简历筛选结果
export const generateResumeScreening = async (screeningConfig: ResumeScreeningConfig) => {
  if (state.value.isGenerating) {
    ElMessage.warning('正在生成中，请稍候...')
    return
  }

  if (!screeningConfig.title || !screeningConfig.requirements) {
    ElMessage.warning('请填写必要信息')
    return
  }

  if (screeningConfig.files.length === 0) {
    ElMessage.warning('请上传简历文件')
    return
  }

  try {
    state.value.isGenerating = true
    state.value.content = ''

    // 先上传所有文件
    const uploadPromises = screeningConfig.files.map(file => uploadFile(file.raw))
    const fileIds = await Promise.all(uploadPromises)
    console.log('上传的文件IDs:', fileIds)

    // 准备文件列表数据
    const x_list = fileIds.map(id => ({
      type: 'document',
      transfer_method: 'local_file',
      upload_file_id: id  // 改回 upload_file_id
    }))

    // 构建请求数据
    const requestData = {
      inputs: {
        x_list
      },
      query: `职位名称：${screeningConfig.title}\n职位要求：${screeningConfig.requirements}${screeningConfig.additional ? '\n补充说明：' + screeningConfig.additional : ''}`,
      response_mode: 'streaming',
      conversation_id: '',
      user: 'abc-123'
    }

    console.log('发送的请求数据:', requestData)

    // 发送请求
    const response = await fetch('/dify-api/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-XJWYvw9yq3Y2aGQgtFPICi1B',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API请求失败:', errorData)
      throw new Error(errorData.message || 'API请求失败')
    }

    // 处理流式响应
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (reader) {
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        buffer += chunk

        // 处理 SSE 格式的数据
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6) // 移除 'data: ' 前缀
              const data = JSON.parse(jsonStr)
              console.log('Received SSE message:', data)
              
              if (data.event === 'message' && data.answer) {
                state.value.content += data.answer
                console.log('Updated content:', state.value.content)
              }
            } catch (e) {
              console.error('Error parsing SSE message:', e)
            }
          }
        }
      }
    }

    // 检查是否生成了内容
    if (!state.value.content) {
      console.warn('No content was generated')
      throw new Error('未能生成内容，请重试')
    }

    // 添加到历史记录
    state.value.history.unshift({
      id: Date.now().toString(),
      title: `${screeningConfig.title}简历筛选结果`,
      content: state.value.content,
      timestamp: new Date().toLocaleString()
    })
    
    // 保存到本地存储
    localStorage.setItem('resumeScreeningHistory', JSON.stringify(state.value.history))

  } catch (error) {
    console.error('生成简历筛选报告失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '筛选失败，请重试')
    throw error
  } finally {
    state.value.isGenerating = false
  }
}

// 从本地存储加载历史记录
const loadHistoryFromStorage = () => {
  const saved = localStorage.getItem('resumeScreeningHistory')
  if (saved) {
    try {
      state.value.history = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse history from storage', e)
    }
  }
}

// 导出状态和配置
export const useResumeScreening = () => {
  loadHistoryFromStorage()
  return {
    state,
    config,
    generateResumeScreening
  }
} 