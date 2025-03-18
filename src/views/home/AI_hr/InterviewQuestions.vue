<template>
  <div class="interview-questions-container">
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>面试问题生成</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="generateQuestions" :loading="isGenerating">
          生成问题
        </el-button>
        <el-button type="success" @click="saveQuestions" :disabled="!questionsContent">
          保存问题
        </el-button>
        <el-button type="warning" @click="exportQuestions" :disabled="!questionsContent">
          导出问题
        </el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="config-section">
        <el-form :model="interviewConfig" label-width="120px">
          <el-form-item label="职位名称" required>
            <el-input v-model="interviewConfig.position" placeholder="请输入职位名称"></el-input>
          </el-form-item>

          <el-form-item label="职位类型" required>
            <el-select v-model="interviewConfig.type" placeholder="请选择职位类型">
              <el-option label="技术类" value="technical"></el-option>
              <el-option label="管理类" value="management"></el-option>
              <el-option label="市场类" value="marketing"></el-option>
              <el-option label="运营类" value="operations"></el-option>
              <el-option label="行政类" value="administrative"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="面试轮次">
            <el-select v-model="interviewConfig.round" placeholder="请选择面试轮次">
              <el-option label="初试" value="first"></el-option>
              <el-option label="复试" value="second"></el-option>
              <el-option label="终试" value="final"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="问题类型" required>
            <el-checkbox-group v-model="interviewConfig.questionTypes">
              <el-checkbox label="professional">专业能力</el-checkbox>
              <el-checkbox label="experience">工作经验</el-checkbox>
              <el-checkbox label="personality">性格特征</el-checkbox>
              <el-checkbox label="scenario">情景模拟</el-checkbox>
              <el-checkbox label="logic">逻辑思维</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="问题数量">
            <el-input-number 
              v-model="interviewConfig.questionCount" 
              :min="5" 
              :max="20"
              :step="1"
            ></el-input-number>
          </el-form-item>

          <el-form-item label="补充说明">
            <el-input
              v-model="interviewConfig.additional"
              type="textarea"
              :rows="4"
              placeholder="请输入补充说明，如特定技能考察点、项目经验要求等"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="preview-section">
        <div class="preview-header">
          <h2>问题预览</h2>
          <div class="preview-actions">
            <el-button type="primary" @click="copyQuestionsContent" :icon="DocumentCopy">复制内容</el-button>
          </div>
        </div>
        <div class="preview-content" v-loading="isGenerating">
          <div v-if="questionsContent" v-html="formattedContent"></div>
          <el-empty v-else description="暂无内容"></el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import * as marked from 'marked'

const router = useRouter()
const isGenerating = ref(false)
const questionsContent = ref('')

const interviewConfig = ref({
  position: '',
  type: '',
  round: 'first',
  questionTypes: ['professional', 'experience'],
  questionCount: 10,
  additional: ''
})

const formattedContent = computed(() => {
  if (!questionsContent.value) return ''
  return marked.parse(questionsContent.value)
})

const generateQuestions = async () => {
  if (!interviewConfig.value.position || !interviewConfig.value.type || interviewConfig.value.questionTypes.length === 0) {
    ElMessage.warning('请填写必填项')
    return
  }

  isGenerating.value = true
  try {
    // TODO: 调用API生成面试问题
    questionsContent.value = '这是示例面试问题内容...'
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    ElMessage.error('生成面试问题失败')
  } finally {
    isGenerating.value = false
  }
}

const saveQuestions = () => {
  ElMessage.success('保存成功')
}

const exportQuestions = () => {
  const blob = new Blob([questionsContent.value], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `面试问题-${interviewConfig.value.position}.md`
  link.click()
  window.URL.revokeObjectURL(url)
}

const copyQuestionsContent = async () => {
  try {
    await navigator.clipboard.writeText(questionsContent.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
.interview-questions-container {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 20px;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    gap: 20px;
    min-height: 0;

    .config-section {
      flex: 0 0 400px;
      background: white;
      border-radius: 8px;
      padding: 20px;
      overflow-y: auto;
    }

    .preview-section {
      flex: 1;
      background: white;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      min-width: 0;

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
          margin: 0;
          font-size: 18px;
        }
      }

      .preview-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 4px;
      }
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style> 