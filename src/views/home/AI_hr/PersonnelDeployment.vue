<template>
  <div class="personnel-deployment-container">
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>人员调派助手</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleGenerate" :loading="state.isGenerating">
          生成方案
        </el-button>
        <el-button type="success" @click="handleSave" :disabled="!state.content">
          保存结果
        </el-button>
        <el-dropdown @command="handleExport" :disabled="!state.content">
          <el-button type="warning">
            导出方案<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="word">导出为Word</el-dropdown-item>
              <el-dropdown-item command="markdown">导出为Markdown</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧配置区域 -->
      <div class="config-section">
        <el-form :model="config" label-width="120px">
          <el-form-item label="部门名称" required>
            <el-input v-model="config.department" placeholder="请输入部门名称" />
          </el-form-item>

          <el-form-item label="业务需求" required>
            <el-input
              v-model="config.businessNeeds"
              type="textarea"
              :rows="4"
              placeholder="请详细描述业务发展需求和人员调配要求"
            />
          </el-form-item>

          <el-form-item label="人员档案" required>
            <el-upload
              class="upload-section"
              action="/dify-api/v1/files/upload"
              :headers="{
                Authorization: 'Bearer app-XJWYvw9yq3Y2aGQgtFPICi1B'
              }"
              :data="{
                user: 'abc-123'
              }"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="handleBeforeUpload"
              :on-exceed="handleExceed"
              :file-list="config.files"
              multiple
              :limit="5"
              accept=".pdf,.doc,.docx"
            >
              <el-button type="primary">
                <el-icon><Upload /></el-icon>
                上传档案
              </el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持 PDF、Word 格式文件，单个文件不超过10MB，最多上传5个文件
                </div>
              </template>
            </el-upload>
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
                <el-button type="link" @click="loadHistory(item)">加载</el-button>
                <el-button type="link" @click="deleteHistory(item.id)">删除</el-button>
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
            <el-button type="primary" @click="handleCopy">
              <el-icon><DocumentCopy /></el-icon>
              复制内容
            </el-button>
          </div>
        </div>
        <div class="preview-content">
          <template v-if="state.content">
            <div class="markdown-content" v-html="formattedContent"></div>
          </template>
          <template v-else-if="state.isGenerating">
            <div class="generating-indicator">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>正在生成内容...</span>
            </div>
          </template>
          <template v-else>
            <el-empty description="暂无内容"></el-empty>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, DocumentCopy, Loading, ArrowDown, Upload } from '@element-plus/icons-vue'
import { marked } from 'marked'
import { usePersonnelDeployment } from '@/api/personnelDeployment'
import { exportToWord } from '@/api/docExport'

const router = useRouter()
const { state, config, generatePersonnelDeployment } = usePersonnelDeployment()

// 文件上传相关
const uploadUrl = import.meta.env.VITE_API_BASE_URL + '/files/upload'
const uploadHeaders = {
  Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`
}
const fileList = ref([])

// 上传前校验
const handleBeforeUpload = (file: File) => {
  const isValidType = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传PDF或Word文件！')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB！')
    return false
  }
  return true
}

// 上传成功回调
const handleUploadSuccess = (response: any, file: any, fileList: any[]) => {
  console.log('文件上传成功:', response)
  ElMessage.success(`${file.name} 上传成功`)
  config.value.files = fileList
}

// 上传失败回调
const handleUploadError = (error: any, file: any) => {
  console.error('文件上传失败:', error)
  ElMessage.error(`${file.name} 上传失败`)
}

// 超出数量限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传5个文件')
}

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

// 格式化内容
const formattedContent = computed(() => {
  if (!state.value.content) return ''
  try {
    return marked(state.value.content, {
      breaks: true,
      gfm: true
    })
  } catch (error) {
    console.error('Markdown formatting error:', error)
    return state.value.content
  }
})

// 生成方案
const handleGenerate = async () => {
  if (!config.value.department || !config.value.businessNeeds || !config.value.files?.length) {
    ElMessage.warning('请填写必要信息并上传人员档案')
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
    businessNeeds: '',
    additionalInfo: '',
    files: []
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

// 导出功能
const handleExport = async (type: string) => {
  if (!state.value.content) {
    ElMessage.warning('没有可导出的内容')
    return
  }

  const title = `${config.value.department}人员调派方案`
  const content = state.value.content

  try {
    if (type === 'word') {
      // 导出为Word文档
      await exportToWord(title, content, title)
      ElMessage.success('导出Word文档成功')
    } else {
      // 导出为Markdown文件
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title}.md`
      link.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出Markdown文件成功')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 复制内容
const handleCopy = () => {
  if (!state.value.content) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  navigator.clipboard.writeText(state.value.content)
    .then(() => ElMessage.success('复制成功'))
    .catch(() => ElMessage.error('复制失败，请手动复制'))
}
</script>

<style scoped lang="scss">
.personnel-deployment-container {
  padding: 0;
  background-color: #f0f2f5;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .page-header {
    padding: 10px 20px;
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e4e7ed;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }

    .header-right {
      display: flex;
      gap: 10px;
    }
  }

  .main-content {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 20px;
    overflow: hidden;

    .config-section {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      overflow-y: auto;

      .upload-section {
        :deep(.el-upload-list) {
          margin-top: 10px;
        }

        :deep(.el-upload__tip) {
          margin-top: 8px;
          font-size: 12px;
          color: #909399;
        }
      }

      .history-section {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e4e7ed;

        h3 {
          margin-bottom: 15px;
          color: #303133;
        }
      }
    }

    .preview-section {
      background-color: white;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .preview-header {
        padding: 15px 20px;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        justify-content: space-between;
        align-items: center;

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
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background: #ffffff;
        color: #303133;
        font-size: 14px;
        line-height: 1.6;

        .generating-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #409EFF;
          font-size: 14px;
          height: 100%;
          min-height: 200px;

          .el-icon {
            font-size: 20px;
          }
        }

        .markdown-content {
          white-space: pre-wrap;
          word-break: break-word;

          :deep(*) {
            max-width: 100%;
            color: #303133;
          }

          :deep(h1) {
            font-size: 24px;
            margin: 20px 0 15px;
            color: #1a1a1a;
            border-bottom: 2px solid #409EFF;
            padding-bottom: 10px;
          }

          :deep(h2) {
            font-size: 20px;
            margin: 18px 0 12px;
            color: #2c3e50;
          }

          :deep(h3) {
            font-size: 16px;
            margin: 15px 0 10px;
            color: #34495e;
          }

          :deep(p) {
            margin: 10px 0;
            text-align: justify;
            line-height: 1.6;
            color: #303133;
          }

          :deep(ul), :deep(ol) {
            margin: 10px 0;
            padding-left: 20px;
            color: #303133;
          }

          :deep(li) {
            margin: 5px 0;
            color: #303133;
          }

          :deep(table) {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            color: #303133;
          }

          :deep(th), :deep(td) {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            color: #303133;
          }

          :deep(th) {
            background-color: #f5f7fa;
            font-weight: bold;
          }

          :deep(strong) {
            color: #409EFF;
            font-weight: 600;
          }

          :deep(code) {
            background-color: #f5f7fa;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
            color: #303133;
          }

          :deep(pre) {
            background-color: #f5f7fa;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 10px 0;
            color: #303133;
          }

          :deep(blockquote) {
            border-left: 4px solid #409EFF;
            margin: 10px 0;
            padding: 10px 15px;
            background-color: #f5f7fa;
            color: #303133;
          }
        }
      }
    }
  }
}
</style> 