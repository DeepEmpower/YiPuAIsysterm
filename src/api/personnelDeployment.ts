import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export interface PersonnelDeploymentConfig {
  department: string
  businessNeeds: string
  additionalInfo: string
  files: any[]
}

interface PersonnelDeploymentState {
  content: string
  isGenerating: boolean
  history: Array<{
    id: string
    title: string
    content: string
    timestamp: string
  }>
}

// 上传文件到服务器并获取文件ID
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file, file.name)
  formData.append('user', 'abc-125')
  
  try {
    const response = await fetch('/api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-XJWYvw9yq3Y2aGQgtFPICi1B'
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
    return result.id
  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}

export function usePersonnelDeployment() {
  const state = ref<PersonnelDeploymentState>({
    content: '',
    isGenerating: false,
    history: JSON.parse(localStorage.getItem('personnelDeploymentHistory') || '[]')
  })

  const config = ref<PersonnelDeploymentConfig>({
    department: '',
    businessNeeds: '',
    additionalInfo: '',
    files: []
  })

  // 生成调派方案
  const generatePersonnelDeployment = async (deploymentConfig: PersonnelDeploymentConfig) => {
    if (!deploymentConfig.department || !deploymentConfig.businessNeeds || !deploymentConfig.files.length) {
      ElMessage.warning('请填写必要信息并上传人员档案')
      return
    }

    try {
      state.value.isGenerating = true
      state.value.content = ''

      // 先上传所有文件
      const uploadPromises = deploymentConfig.files.map(file => uploadFile(file.raw))
      const fileIds = await Promise.all(uploadPromises)
      console.log('上传的文件IDs:', fileIds)

      // 构建请求数据
      const requestData = {
        inputs: {
          x_list: fileIds.map(id => ({
            type: "document",
            transfer_method: "local_file",
            upload_file_id: id
          }))
        },
        query: deploymentConfig.businessNeeds,
        response_mode: "streaming",
        conversation_id: "",
        user: "abc-125"
      }

      console.log('发送的请求数据:', requestData)

      // 发送请求
      const response = await fetch('http://115.190.30.196:2001/v1/chat-messages', {
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
      let buffer = ''
      let content = ''

      if (reader) {
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
                
                // 检查各种可能的响应字段
                const text = data.answer || data.text || (data.data && data.data.text) || ''
                if (text) {
                  content += text
                  state.value.content = content
                }
              } catch (e) {
                console.error('Error parsing SSE message:', e)
              }
            }
          }
        }
      }

      // 检查是否生成了内容
      if (!content) {
        throw new Error('未能生成内容，请重试')
      }

      // 保存到历史记录
      const historyItem = {
        id: Date.now().toString(),
        title: `${deploymentConfig.department}人员调派方案`,
        content: content,
        timestamp: new Date().toLocaleString()
      }
      state.value.history.unshift(historyItem)
      localStorage.setItem('personnelDeploymentHistory', JSON.stringify(state.value.history))

      ElMessage.success('生成成功')
    } catch (error) {
      console.error('生成调派方案失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '生成失败，请重试')
    } finally {
      state.value.isGenerating = false
    }
  }

  return {
    state,
    config,
    generatePersonnelDeployment
  }
} 