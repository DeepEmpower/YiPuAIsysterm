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
        <el-dropdown @command="handleExport" :disabled="!state.content">
          <el-button type="warning">
            导出结果<el-icon class="el-icon--right"><arrow-down /></el-icon>
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
                <el-button type="link" @click="loadHistory(item)">加载</el-button>
                <el-button type="link" @click="deleteHistory(item.id)">删除</el-button>
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
import { ArrowLeft, DocumentCopy, Loading, ArrowDown } from '@element-plus/icons-vue'
import { marked } from 'marked'
import { useResumeScreening } from '@/api/resumeScreening'
import { exportToWord } from '@/api/docExport'

const router = useRouter()
const { state, config, generateResumeScreening } = useResumeScreening()

const formattedContent = computed(() => {
  if (!state.value.content) {
    console.log('No content available')
    return ''
  }
  try {
    console.log('Content before formatting:', state.value.content)
    const formatted = marked(state.value.content, {
      breaks: true,
      gfm: true
    })
    console.log('Formatted content:', formatted)
    return formatted
  } catch (error) {
    console.error('Markdown formatting error:', error)
    return state.value.content
  }
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

  try {
    console.log('Starting report generation with config:', config.value)
    await generateResumeScreening(config.value)
    console.log('Generated content:', state.value.content)
    if (!state.value.content) {
      ElMessage.warning('生成的内容为空，请重试')
    }
  } catch (error) {
    console.error('Error generating report:', error)
    ElMessage.error('生成报告失败，请重试')
  }
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

const handleExport = async (type: string) => {
  if (!state.value.content) {
    ElMessage.warning('没有可导出的内容')
    return
  }

  const title = `${config.value.title}简历筛选结果`
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

      :deep(.el-button) {
        padding: 0;
        height: auto;
        
        .el-icon {
          margin-right: 4px;
        }
      }

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
        position: relative;
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #ffffff;
        border-radius: 4px;
        margin: 0;
        min-height: 200px;
        color: #303133;
        font-size: 14px;
        line-height: 1.6;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

        .generating-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: 8px;
          color: #409EFF;
          font-size: 14px;

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

:deep(.el-form-item__label) {
  font-weight: 500;
}

.history-section {
  .history-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;

    :deep(.el-button) {
      padding: 0;
      height: auto;
    }
  }

  .el-timeline {
    padding: 0;
    
    :deep(.el-timeline-item__node) {
      background-color: #409EFF;
    }

    :deep(.el-card) {
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      h4 {
        margin: 0;
        font-size: 14px;
        color: #303133;
      }
    }
  }
}
</style> 