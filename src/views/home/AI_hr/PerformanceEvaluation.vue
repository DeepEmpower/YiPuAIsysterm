<template>
  <div class="performance-evaluation-container">
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>绩效考核方案</h2>
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
        <el-form :model="evaluationConfig" label-width="120px">
          <el-form-item label="考核对象" required>
            <el-select v-model="evaluationConfig.target" placeholder="请选择考核对象">
              <el-option label="基层员工" value="junior"></el-option>
              <el-option label="技术人员" value="technical"></el-option>
              <el-option label="销售人员" value="sales"></el-option>
              <el-option label="中层管理" value="middle"></el-option>
              <el-option label="高层管理" value="senior"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="考核周期" required>
            <el-select v-model="evaluationConfig.period" placeholder="请选择考核周期">
              <el-option label="月度" value="monthly"></el-option>
              <el-option label="季度" value="quarterly"></el-option>
              <el-option label="半年" value="half-year"></el-option>
              <el-option label="年度" value="yearly"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="考核维度" required>
            <el-checkbox-group v-model="evaluationConfig.dimensions">
              <el-checkbox label="performance">工作业绩</el-checkbox>
              <el-checkbox label="ability">工作能力</el-checkbox>
              <el-checkbox label="attitude">工作态度</el-checkbox>
              <el-checkbox label="potential">发展潜力</el-checkbox>
              <el-checkbox label="teamwork">团队协作</el-checkbox>
              <el-checkbox label="innovation">创新能力</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="考核方式">
            <el-checkbox-group v-model="evaluationConfig.methods">
              <el-checkbox label="self">自我评价</el-checkbox>
              <el-checkbox label="superior">上级评价</el-checkbox>
              <el-checkbox label="peer">同级评价</el-checkbox>
              <el-checkbox label="subordinate">下级评价</el-checkbox>
              <el-checkbox label="customer">客户评价</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="评分制度" required>
            <el-select v-model="evaluationConfig.scoring" placeholder="请选择评分制度">
              <el-option label="百分制" value="percentage"></el-option>
              <el-option label="五分制" value="five-point"></el-option>
              <el-option label="等级制" value="grade"></el-option>
              <el-option label="KPI指标" value="kpi"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="关键指标" required>
            <el-input
              v-model="evaluationConfig.kpi"
              type="textarea"
              :rows="4"
              placeholder="请输入关键绩效指标，如销售目标、项目完成率等"
            ></el-input>
          </el-form-item>

          <el-form-item label="激励措施">
            <el-checkbox-group v-model="evaluationConfig.incentives">
              <el-checkbox label="bonus">绩效奖金</el-checkbox>
              <el-checkbox label="promotion">晋升机会</el-checkbox>
              <el-checkbox label="training">培训发展</el-checkbox>
              <el-checkbox label="recognition">荣誉表彰</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="补充说明">
            <el-input
              v-model="evaluationConfig.additional"
              type="textarea"
              :rows="4"
              placeholder="请输入补充说明，如特殊考核要求、评估重点等"
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

const evaluationConfig = ref({
  target: '',
  period: 'quarterly',
  dimensions: ['performance', 'ability', 'attitude'],
  methods: ['self', 'superior'],
  scoring: 'percentage',
  kpi: '',
  incentives: ['bonus', 'promotion'],
  additional: ''
})

const formattedContent = computed(() => {
  if (!planContent.value) return ''
  return marked(planContent.value)
})

const generatePlan = async () => {
  if (!evaluationConfig.value.target || !evaluationConfig.value.period || 
      evaluationConfig.value.dimensions.length === 0 || !evaluationConfig.value.scoring || 
      !evaluationConfig.value.kpi) {
    ElMessage.warning('请填写必填项')
    return
  }

  isGenerating.value = true
  try {
    // TODO: 调用API生成绩效考核方案
    planContent.value = '这是示例绩效考核方案内容...'
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    ElMessage.error('生成绩效考核方案失败')
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
  link.download = `绩效考核方案-${evaluationConfig.value.target}.md`
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
.performance-evaluation-container {
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