<template>
  <div class="resume-screening-container">
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>简历筛选助手</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="generateReport" :loading="state.isGenerating">
          开始筛选
        </el-button>
        <el-button type="success" @click="saveReport" :disabled="!state.content">
          保存结果
        </el-button>
        <el-button type="warning" @click="exportReport" :disabled="!state.content">
          导出结果
        </el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="config-section">
        <el-form :model="config" label-width="120px">
          <el-form-item label="职位名称" required>
            <el-input v-model="config.title" placeholder="请输入职位名称"></el-input>
          </el-form-item>
          
          <el-form-item label="职位要求" required>
            <el-input
              v-model="config.requirements"
              type="textarea"
              :rows="4"
              placeholder="请详细描述职位要求，包括：工作职责、任职要求、技能要求、经验要求、学历要求等"
            ></el-input>
          </el-form-item>

          <el-form-item label="简历上传">
            <el-upload
              class="resume-uploader"
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :limit="10"
              multiple
            >
              <el-button type="primary">选择简历文件</el-button>
              <template #tip>
                <div class="el-upload__tip">支持 PDF、Word 格式，可多选，单个文件不超过10MB</div>
              </template>
            </el-upload>
          </el-form-item>

          <el-form-item label="补充说明">
            <el-input
              v-model="config.additional"
              type="textarea"
              :rows="2"
              placeholder="请输入补充说明，如特殊要求、注意事项等"
            ></el-input>
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

      <div class="preview-section">
        <div class="preview-header">
          <h2>筛选结果</h2>
          <div class="preview-actions">
            <el-button type="primary" @click="copyReportContent" :icon="DocumentCopy">复制内容</el-button>
          </div>
        </div>
        <div class="preview-content" v-loading="state.isGenerating">
          <div v-if="state.content" v-html="formattedContent"></div>
          <el-empty v-else description="暂无内容"></el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, DocumentCopy } from '@element-plus/icons-vue'
import { marked } from 'marked'
import { useResumeScreening } from '@/api/resumeScreening'

const router = useRouter()
const { state, config, generateResumeScreening } = useResumeScreening()

const formattedContent = computed(() => {
  if (!state.value.content) return ''
  return marked(state.value.content)
})

const handleFileChange = (file: any) => {
  if (config.value.files.length >= 10) {
    ElMessage.warning('最多只能上传10份简历')
    return
  }
  config.value.files.push(file)
}

const generateReport = async () => {
  if (!config.value.title || !config.value.requirements) {
    ElMessage.warning('请填写必填项')
    return
  }

  if (config.value.files.length === 0) {
    ElMessage.warning('请上传简历文件')
    return
  }

  if (state.value.content) {
    try {
      await ElMessageBox.confirm('生成新结果将覆盖当前内容，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }
  }

  await generateResumeScreening(config.value)
}

const saveReport = () => {
  if (!state.value.content) {
    ElMessage.warning('没有可保存的内容')
    return
  }

  const title = `${config.value.title}简历筛选结果`
  state.value.history.unshift({
    id: Date.now().toString(),
    title,
    content: state.value.content,
    timestamp: new Date().toLocaleString()
  })

  localStorage.setItem('resumeScreeningHistory', JSON.stringify(state.value.history))
  ElMessage.success('保存成功')
}

const exportReport = () => {
  if (!state.value.content) {
    ElMessage.warning('没有可导出的内容')
    return
  }

  const blob = new Blob([state.value.content], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${config.value.title}简历筛选结果.md`
  link.click()
  window.URL.revokeObjectURL(url)
}

const copyReportContent = async () => {
  if (!state.value.content) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(state.value.content)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 加载历史记录
const loadHistory = (item: any) => {
  config.value = {
    title: item.title.replace('简历筛选结果', ''),
    requirements: '',
    additional: '',
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
    localStorage.setItem('resumeScreeningHistory', JSON.stringify(state.value.history))
    ElMessage.success('删除成功')
  })
}
</script>

<style scoped lang="scss">
.resume-screening-container {
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
    display: flex;
    flex: 1;
    overflow: hidden;

    .config-section {
      width: 40%;
      border-right: 1px solid #e4e7ed;
      background-color: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 20px;

      :deep(.el-form) {
        flex: 0 0 auto;
        margin-bottom: 10px;

        .el-form-item {
          margin-bottom: 12px;
        }

        .el-form-item__label {
          padding-bottom: 4px;
        }
      }

      .history-section {
        flex: 1;
        margin-top: 0;
        padding-top: 10px;
        border-top: 1px solid #e4e7ed;
        display: flex;
        flex-direction: column;
        
        h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .el-timeline {
          flex: 1;
          overflow-y: auto;
          padding-right: 10px;
        }
      }
    }

    .preview-section {
      flex: 1;
      background: white;
      padding: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;

        h2 {
          margin: 0;
          color: #333;
          font-size: 18px;
        }
      }

      .preview-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 4px;
        margin: 0;

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
        }

        :deep(ul), :deep(ol) {
          margin: 10px 0;
          padding-left: 20px;
        }

        :deep(li) {
          margin: 5px 0;
        }

        :deep(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }

        :deep(th), :deep(td) {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        :deep(th) {
          background-color: #f5f7fa;
          font-weight: bold;
        }

        :deep(strong) {
          color: #409EFF;
          font-weight: 600;
        }
      }
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style> 