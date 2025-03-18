import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 定义状态接口
interface PersonnelDeploymentState {
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
interface PersonnelDeploymentConfig {
  department: string
  currentStaff: string
  targetStaff: string
  businessNeeds: string
  skillRequirements: string[]
  deploymentPeriod: string
  additionalInfo: string
}

// 创建状态
const state = ref<PersonnelDeploymentState>({
  isGenerating: false,
  content: '',
  history: []
})

// 创建配置
const config = ref<PersonnelDeploymentConfig>({
  department: '',
  currentStaff: '',
  targetStaff: '',
  businessNeeds: '',
  skillRequirements: [],
  deploymentPeriod: '',
  additionalInfo: ''
})

// 构建查询
const buildQuery = (config: PersonnelDeploymentConfig): string => {
  const query = `请根据以下信息生成一份详细的人员调派方案：

部门：${config.department}
当前人员配置：${config.currentStaff}
目标人员配置：${config.targetStaff}
业务需求：${config.businessNeeds}
技能要求：${config.skillRequirements.join('、')}
调派周期：${config.deploymentPeriod}
${config.additionalInfo ? `补充信息：${config.additionalInfo}` : ''}

请生成一份完整的人员调派方案，包含以下内容：
1. 现状分析
2. 需求分析
3. 人员匹配
4. 调派计划
5. 培训安排
6. 风险控制
7. 效果评估

请确保方案具有可操作性和实用性。`
  return query
}

// 生成人员调派方案
export const generatePersonnelDeployment = async (deploymentConfig: PersonnelDeploymentConfig) => {
  if (state.value.isGenerating) {
    ElMessage.warning('正在生成中，请稍候...')
    return
  }

  if (!deploymentConfig.department || !deploymentConfig.currentStaff || !deploymentConfig.targetStaff) {
    ElMessage.warning('请填写必要信息')
    return
  }

  state.value.isGenerating = true
  state.value.content = ''

  try {
    const query = buildQuery(deploymentConfig)
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
        title: `${deploymentConfig.department}人员调派方案`,
        content: response.data.answer,
        timestamp: new Date().toLocaleString()
      })
      
      // 保存到本地存储
      localStorage.setItem('personnelDeploymentHistory', JSON.stringify(state.value.history))
    }
  } catch (error) {
    console.error('生成人员调派方案失败:', error)
    ElMessage.error('生成失败，请重试')
  } finally {
    state.value.isGenerating = false
  }
}

// 从本地存储加载历史记录
const loadHistoryFromStorage = () => {
  const saved = localStorage.getItem('personnelDeploymentHistory')
  if (saved) {
    try {
      state.value.history = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse history from storage', e)
    }
  }
}

// 导出状态和配置
export const usePersonnelDeployment = () => {
  loadHistoryFromStorage()
  return {
    state,
    config,
    generatePersonnelDeployment
  }
} 