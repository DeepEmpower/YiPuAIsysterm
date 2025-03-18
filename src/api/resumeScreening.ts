import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

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

// 构建查询
const buildQuery = (config: ResumeScreeningConfig): string => {
  const query = `请根据以下招聘要求对简历进行筛选：

职位名称：${config.title}

职位要求：
${config.requirements}

${config.additional ? `补充说明：${config.additional}` : ''}

请对上传的简历进行筛选，并给出详细的筛选结果，包括：
1. 候选人基本信息
2. 教育背景评估
3. 工作经验评估
4. 技能匹配度分析
5. 项目经历评估
6. 证书资质评估
7. 综合评分
8. 筛选建议

请确保筛选结果客观公正，并给出具体的筛选理由。`
  return query
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

  state.value.isGenerating = true
  state.value.content = ''

  try {
    const query = buildQuery(screeningConfig)
    const response = await axios.post(
      'http://115.190.30.196:2001/v1/chat-messages',
      {
        query,
        user: 'abc-123',
        response_mode: 'streaming',
        conversation_id: '',
      },
      {
        headers: {
          'Authorization': 'Bearer app-X7YkTKQgqHD0KcZmIVFCRDeK',
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data && response.data.answer) {
      state.value.content = response.data.answer
      
      // 添加到历史记录
      state.value.history.unshift({
        id: Date.now().toString(),
        title: `${screeningConfig.title}简历筛选结果`,
        content: response.data.answer,
        timestamp: new Date().toLocaleString()
      })
      
      // 保存到本地存储
      localStorage.setItem('resumeScreeningHistory', JSON.stringify(state.value.history))
    }
  } catch (error) {
    console.error('简历筛选失败:', error)
    ElMessage.error('筛选失败，请重试')
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