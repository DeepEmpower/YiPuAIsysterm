<template>
  <div class="training-plan-container">
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>培训方案设计</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="generatePlan" :loading="isGenerating">
          生成方案
        </el-button>
        <el-button type="success" @click="savePlan" :disabled="!planContent">
          保存方案
        </el-button>
        <el-button type="warning" @click="exportPlan" :disabled="!planContent">
          导出方案
        </el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="config-section">
        <el-form :model="trainingConfig" label-width="120px">
          <el-form-item label="培训主题" required>
            <el-input v-model="trainingConfig.title" placeholder="请输入培训主题"></el-input>
          </el-form-item>

          <el-form-item label="培训对象" required>
            <el-select v-model="trainingConfig.target" placeholder="请选择培训对象">
              <el-option label="新员工" value="new"></el-option>
              <el-option label="基层员工" value="junior"></el-option>
              <el-option label="中层管理" value="middle"></el-option>
              <el-option label="高层管理" value="senior"></el-option>
              <el-option label="全体员工" value="all"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="培训类型" required>
            <el-select v-model="trainingConfig.type" placeholder="请选择培训类型">
              <el-option label="入职培训" value="onboarding"></el-option>
              <el-option label="专业技能" value="professional"></el-option>
              <el-option label="管理能力" value="management"></el-option>
              <el-option label="企业文化" value="culture"></el-option>
              <el-option label="合规培训" value="compliance"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="培训形式">
            <el-checkbox-group v-model="trainingConfig.methods">
              <el-checkbox label="lecture">课堂讲授</el-checkbox>
              <el-checkbox label="workshop">工作坊</el-checkbox>
              <el-checkbox label="online">在线学习</el-checkbox>
              <el-checkbox label="practice">实践演练</el-checkbox>
              <el-checkbox label="mentoring">导师指导</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="培训周期">
            <el-select v-model="trainingConfig.duration" placeholder="请选择培训周期">
              <el-option label="1天" value="1d"></el-option>
              <el-option label="2-3天" value="2-3d"></el-option>
              <el-option label="1周" value="1w"></el-option>
              <el-option label="2周" value="2w"></el-option>
              <el-option label="1个月" value="1m"></el-option>
              <el-option label="3个月" value="3m"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="培训规模">
            <el-input-number 
              v-model="trainingConfig.size" 
              :min="1" 
              :max="1000"
              :step="1"
              placeholder="请输入培训人数"
            ></el-input-number>
          </el-form-item>

          <el-form-item label="培训目标" required>
            <el-input
              v-model="trainingConfig.goals"
              type="textarea"
              :rows="4"
              placeholder="请输入培训目标，如知识技能提升点、预期达成效果等"
            ></el-input>
          </el-form-item>

          <el-form-item label="补充说明">
            <el-input
              v-model="trainingConfig.additional"
              type="textarea"
              :rows="4"
              placeholder="请输入补充说明，如特殊要求、资源限制等"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="preview-section">
        <div class="preview-header">
          <h2>方案预览</h2>
          <div class="preview-actions">
            <el-button type="primary" @click="copyPlanContent" :icon="DocumentCopy">复制内容</el-button>
          </div>
        </div>
        <div class="preview-content" v-loading="isGenerating">
          <div v-if="planContent" v-html="formattedContent"></div>
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
import { marked } from 'marked'

const router = useRouter()
const isGenerating = ref(false)
const planContent = ref('')

const trainingConfig = ref({
  title: '',
  target: '',
  type: '',
  methods: ['lecture', 'online'],
  duration: '1w',
  size: 30,
  goals: '',
  additional: ''
})

const formattedContent = computed(() => {
  if (!planContent.value) return ''
  return marked(planContent.value)
})

const generatePlan = async () => {
  if (!trainingConfig.value.title || !trainingConfig.value.target || !trainingConfig.value.type || !trainingConfig.value.goals) {
    ElMessage.warning('请填写必填项')
    return
  }

  isGenerating.value = true
  try {
    // TODO: 调用API生成培训方案
    planContent.value = '这是示例培训方案内容...'
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    ElMessage.error('生成培训方案失败')
  } finally {
    isGenerating.value = false
  }
}

const savePlan = () => {
  ElMessage.success('保存成功')
}

const exportPlan = () => {
  const blob = new Blob([planContent.value], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `培训方案-${trainingConfig.value.title}.md`
  link.click()
  window.URL.revokeObjectURL(url)
}

const copyPlanContent = async () => {
  try {
    await navigator.clipboard.writeText(planContent.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
.training-plan-container {
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