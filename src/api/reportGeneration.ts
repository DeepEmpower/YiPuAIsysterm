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
  data: any
  message?: string
}

// 定义生成状态接口
export interface GenerationState {
  isGenerating: boolean
  error: string | null
  previewContent: any
}

// 创建响应式状态
const state = ref<GenerationState>({
  isGenerating: false,
  error: null,
  previewContent: null
})

// 生成报表的函数
export const generateReport = async (params: GenerateReportRequest): Promise<GenerateReportResponse> => {
  state.value.isGenerating = true
  state.value.error = null
  
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

    const data = await response.json()
    console.log('生成报表API返回数据:', data)
    
    // 更新预览内容
    state.value.previewContent = data.data
    return data
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