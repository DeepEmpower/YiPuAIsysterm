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
        <el-button type="primary" @click="generateReport" :loading="isGenerating">
          开始筛选
        </el-button>
        <el-button type="success" @click="saveReport" :disabled="!reportContent">
          保存结果
        </el-button>
        <el-button type="warning" @click="exportReport" :disabled="!reportContent">
          导出结果
        </el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="config-section">
        <el-form :model="jobConfig" label-width="120px">
          <el-form-item label="职位名称" required>
            <el-input v-model="jobConfig.title" placeholder="请输入职位名称"></el-input>
          </el-form-item>
          
          <el-form-item label="职位类型" required>
            <el-select v-model="jobConfig.type" placeholder="请选择职位类型">
              <el-option label="技术类" value="technical"></el-option>
              <el-option label="管理类" value="management"></el-option>
              <el-option label="市场类" value="marketing"></el-option>
              <el-option label="运营类" value="operations"></el-option>
              <el-option label="行政类" value="administrative"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="职位级别" required>
            <el-select v-model="jobConfig.level" placeholder="请选择职位级别">
              <el-option label="初级" value="junior"></el-option>
              <el-option label="中级" value="intermediate"></el-option>
              <el-option label="高级" value="senior"></el-option>
              <el-option label="专家" value="expert"></el-option>
              <el-option label="总监" value="director"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="工作年限要求">
            <el-select v-model="jobConfig.experience" placeholder="请选择工作年限要求">
              <el-option label="应届生" value="fresh"></el-option>
              <el-option label="1-3年" value="1-3"></el-option>
              <el-option label="3-5年" value="3-5"></el-option>
              <el-option label="5-10年" value="5-10"></el-option>
              <el-option label="10年以上" value="10+"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="学历要求">
            <el-select v-model="jobConfig.education" placeholder="请选择学历要求">
              <el-option label="大专" value="college"></el-option>
              <el-option label="本科" value="bachelor"></el-option>
              <el-option label="硕士" value="master"></el-option>
              <el-option label="博士" value="phd"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="工作地点">
            <el-input v-model="jobConfig.location" placeholder="请输入工作地点"></el-input>
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

          <el-form-item label="筛选重点">
            <el-checkbox-group v-model="jobConfig.screeningFocus">
              <el-checkbox label="education">教育背景</el-checkbox>
              <el-checkbox label="experience">工作经验</el-checkbox>
              <el-checkbox label="skills">技能匹配</el-checkbox>
              <el-checkbox label="projects">项目经历</el-checkbox>
              <el-checkbox label="certificates">证书资质</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="补充说明">
            <el-input
              v-model="jobConfig.additional"
              type="textarea"
              :rows="4"
              placeholder="请输入补充说明，如特殊技能要求、证书要求等"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="preview-section">
        <div class="preview-header">
          <h2>筛选结果</h2>
          <div class="preview-actions">
            <el-button type="primary" @click="copyReportContent" :icon="DocumentCopy">复制内容</el-button>
          </div>
        </div>
        <div class="preview-content" v-loading="isGenerating">
          <div v-if="reportContent" v-html="formattedContent"></div>
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
const reportContent = ref('')

const jobConfig = ref({
  title: '',
  type: '',
  level: '',
  experience: '',
  education: '',
  location: '',
  additional: '',
  screeningFocus: ['education', 'experience', 'skills'],
  files: []
})

const formattedContent = computed(() => {
  if (!reportContent.value) return ''
  return marked(reportContent.value)
})

const handleFileChange = (file: any) => {
  jobConfig.value.files.push(file)
}

const generateReport = async () => {
  if (!jobConfig.value.title || !jobConfig.value.type || !jobConfig.value.level) {
    ElMessage.warning('请填写必填项')
    return
  }

  if (jobConfig.value.files.length === 0) {
    ElMessage.warning('请上传简历文件')
    return
  }

  isGenerating.value = true
  try {
    // TODO: 调用API进行简历筛选
    reportContent.value = '这是一个示例筛选结果...'
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    ElMessage.error('简历筛选失败')
  } finally {
    isGenerating.value = false
  }
}

const saveReport = () => {
  ElMessage.success('保存成功')
}

const exportReport = () => {
  const blob = new Blob([reportContent.value], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `简历筛选结果-${jobConfig.value.title}.md`
  link.click()
  window.URL.revokeObjectURL(url)
}

const copyReportContent = async () => {
  try {
    await navigator.clipboard.writeText(reportContent.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
.resume-screening-container {
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

      .resume-uploader {
        :deep(.el-upload__tip) {
          color: #909399;
          font-size: 12px;
          margin-top: 8px;
        }
      }
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
</style> 