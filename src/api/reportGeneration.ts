import { ref } from 'vue'

// 定义生成报表的请求接口
export interface GenerateReportRequest {
  prompt: string
  TableList: string[]
  do_recom: boolean
}

// 定义生成报表的响应接口
export interface GenerateReportResponse {
  status: string
  data: string
  message?: string
}

// 定义生成状态接口
export interface GenerationState {
  isGenerating: boolean
  error: string | null
  previewContent: string | null
}

// 创建响应式状态
const state = ref<GenerationState>({
  isGenerating: false,
  error: null,
  previewContent: null
})

// 生成报表的函数
export const generateReport = async (
  params: GenerateReportRequest,
  onProgress?: (content: string) => void
): Promise<GenerateReportResponse> => {
  state.value.isGenerating = true
  state.value.error = null
  state.value.previewContent = ''
  
  try {
    const response = await fetch('/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      throw new Error('生成报表请求失败')
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
      accumulatedContent += chunk
      
      // 更新预览内容
      state.value.previewContent = accumulatedContent
      
      // 调用进度回调
      if (onProgress) {
        onProgress(accumulatedContent)
      }
    }
    
    // 返回最终结果
    return {
      status: 'success',
      data: accumulatedContent
    }
  } catch (error) {
    state.value.error = error instanceof Error ? error.message : '生成报表失败'
    throw error
  } finally {
    state.value.isGenerating = false
  }
}

// 导出状态和函数
export const useReportGeneration = () => {
  return {
    state,
    generateReport
  }
} 