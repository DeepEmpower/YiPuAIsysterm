<template>
  <div class="personnel-deployment-container">
    <!-- 头部导航 -->
    <div class="header-section">
      <el-button @click="goBack" icon="ArrowLeft">返回</el-button>
      <div class="header-actions">
        <el-button 
          type="primary" 
          :loading="state.isGenerating"
          @click="handleGenerate"
        >
          生成方案
        </el-button>
        <el-button @click="handleSave">保存</el-button>
        <el-button @click="handleExport">导出</el-button>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧配置区域 -->
      <div class="config-section">
        <el-form :model="config" label-width="120px">
          <el-form-item label="部门名称" required>
            <el-input v-model="config.department" placeholder="请输入部门名称" />
          </el-form-item>

          <el-form-item label="当前人员配置" required>
            <el-input
              v-model="config.currentStaff"
              type="textarea"
              :rows="3"
              placeholder="请描述当前部门的人员配置情况"
            />
          </el-form-item>

          <el-form-item label="目标人员配置" required>
            <el-input
              v-model="config.targetStaff"
              type="textarea"
              :rows="3"
              placeholder="请描述期望的人员配置情况"
            />
          </el-form-item>

          <el-form-item label="业务需求">
            <el-input
              v-model="config.businessNeeds"
              type="textarea"
              :rows="3"
              placeholder="请描述业务发展需求"
            />
          </el-form-item>

          <el-form-item label="技能要求">
            <el-select
              v-model="config.skillRequirements"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入技能要求"
            >
              <el-option
                v-for="skill in skillOptions"
                :key="skill"
                :label="skill"
                :value="skill"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="调派周期">
            <el-input v-model="config.deploymentPeriod" placeholder="请输入调派周期" />
          </el-form-item>

          <el-form-item label="补充信息">
            <el-input
              v-model="config.additionalInfo"
              type="textarea"
              :rows="3"
              placeholder="请输入其他补充信息"
            />
          </el-form-item>
        </el-form>

        <!-- 历史记录 -->
        <div class="history-section">
          <h3>历史记录</h3>
          <el-timeline>
            <el-timeline-item
              v-for="item in state.history"
              :key="item.id"
              :timestamp="item.timestamp"
              placement="top"
            >
              <el-card>
                <h4>{{ item.title }}</h4>
                <el-button type="text" @click="loadHistory(item)">加载</el-button>
                <el-button type="text" @click="deleteHistory(item.id)">删除</el-button>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <!-- 右侧预览区域 -->
      <div class="preview-section">
        <div class="preview-header">
          <h3>方案预览</h3>
          <div class="preview-actions">
            <el-button type="primary" @click="handleCopy">复制内容</el-button>
            <el-button @click="handleExport">导出方案</el-button>
          </div>
        </div>
        <div class="preview-content" v-loading="state.isGenerating">
          <div v-if="state.content" v-html="formatContent(state.content)"></div>
          <div v-else class="empty-state">
            <el-empty description="暂无内容，请填写配置并生成方案" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePersonnelDeployment } from '@/api/personnelDeployment'

const router = useRouter()
const { state, config, generatePersonnelDeployment } = usePersonnelDeployment()

// 技能选项
const skillOptions = [
  '项目管理',
  '技术开发',
  '产品设计',
  '市场营销',
  '客户服务',
  '数据分析',
  '团队管理',
  '沟通协调'
]

// 返回上一页
const goBack = () => {
  router.back()
}

// 生成方案
const handleGenerate = async () => {
  if (!config.value.department || !config.value.currentStaff || !config.value.targetStaff) {
    ElMessage.warning('请填写必要信息')
    return
  }

  if (state.value.content) {
    try {
      await ElMessageBox.confirm('生成新方案将覆盖当前内容，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }
  }

  await generatePersonnelDeployment(config.value)
}

// 加载历史记录
const loadHistory = (item: any) => {
  config.value = {
    department: item.title.replace('人员调派方案', ''),
    currentStaff: '',
    targetStaff: '',
    businessNeeds: '',
    skillRequirements: [],
    deploymentPeriod: '',
    additionalInfo: ''
  }
  state.value.content = item.content
}

// 删除历史记录
const deleteHistory = (id: string) => {
  ElMessageBox.confirm('确定要删除这条历史记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    state.value.history = state.value.history.filter(item => item.id !== id)
    localStorage.setItem('personnelDeploymentHistory', JSON.stringify(state.value.history))
    ElMessage.success('删除成功')
  })
}

// 保存方案
const handleSave = () => {
  if (!state.value.content) {
    ElMessage.warning('没有可保存的内容')
    return
  }

  const title = `${config.value.department}人员调派方案`
  state.value.history.unshift({
    id: Date.now().toString(),
    title,
    content: state.value.content,
    timestamp: new Date().toLocaleString()
  })

  localStorage.setItem('personnelDeploymentHistory', JSON.stringify(state.value.history))
  ElMessage.success('保存成功')
}

// 导出方案
const handleExport = () => {
  if (!state.value.content) {
    ElMessage.warning('没有可导出的内容')
    return
  }

  const blob = new Blob([state.value.content], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${config.value.department}人员调派方案.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// 复制内容
const handleCopy = () => {
  if (!state.value.content) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  navigator.clipboard.writeText(state.value.content)
    .then(() => ElMessage.success('复制成功'))
    .catch(() => ElMessage.error('复制失败'))
}

// 格式化内容
const formatContent = (content: string) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/#{1,6}\s+(.+)/g, (match, p1) => {
      const level = match.match(/^#+/)[0].length
      return `<h${level}>${p1}</h${level}>`
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')
    .replace(/\|(.+?)\|/g, '<td>$1</td>')
    .replace(/(<td>.*<\/td>)/s, '<tr>$1</tr>')
    .replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>')
}
</script>

<style scoped lang="scss">
.personnel-deployment-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    .config-section {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

      .history-section {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #ebeef5;

        h3 {
          margin-bottom: 15px;
          color: #303133;
        }
      }
    }

    .preview-section {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      overflow: hidden;

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #ebeef5;

        h3 {
          margin: 0;
          color: #303133;
        }

        .preview-actions {
          display: flex;
          gap: 10px;
        }
      }

      .preview-content {
        padding: 20px;
        min-height: 500px;
        max-height: calc(100vh - 300px);
        overflow-y: auto;

        :deep(h1) {
          font-size: 24px;
          color: #303133;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #409eff;
        }

        :deep(h2) {
          font-size: 20px;
          color: #303133;
          margin: 20px 0 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #ebeef5;
        }

        :deep(h3) {
          font-size: 18px;
          color: #303133;
          margin: 15px 0 10px;
        }

        :deep(p) {
          line-height: 1.6;
          color: #606266;
          margin-bottom: 15px;
        }

        :deep(ul), :deep(ol) {
          padding-left: 20px;
          margin-bottom: 15px;

          li {
            line-height: 1.6;
            color: #606266;
            margin-bottom: 8px;
          }
        }

        :deep(table) {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;

          td {
            padding: 8px;
            border: 1px solid #ebeef5;
            color: #606266;
          }
        }

        :deep(code) {
          background-color: #f5f7fa;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
        }

        :deep(a) {
          color: #409eff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }

        .empty-state {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
      }
    }
  }
}
</style> 