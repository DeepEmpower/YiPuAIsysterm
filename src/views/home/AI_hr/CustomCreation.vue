<template>
  <div class="custom-creation-container">
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>{{ isEdit ? '编辑助手' : '创建助手' }}</h2>
      </div>
      <div class="header-right">
        <el-button @click="router.back()">取消</el-button>
        <el-button type="primary" @click="saveAssistant" :loading="isSaving">保存</el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="form-section">
        <el-form 
          ref="formRef"
          :model="assistantForm"
          :rules="formRules"
          label-width="120px"
        >
          <el-form-item label="助手名称" prop="name">
            <el-input v-model="assistantForm.name" placeholder="请输入助手名称"></el-input>
          </el-form-item>

          <el-form-item label="所属领域" prop="domain">
            <el-select v-model="assistantForm.domain" placeholder="请选择所属领域">
              <el-option label="招聘管理" value="recruitment"></el-option>
              <el-option label="培训发展" value="training"></el-option>
              <el-option label="绩效管理" value="performance"></el-option>
              <el-option label="员工关系" value="relationship"></el-option>
              <el-option label="薪酬福利" value="compensation"></el-option>
              <el-option label="其他" value="other"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="助手描述" prop="description">
            <el-input
              v-model="assistantForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入助手描述，包括主要功能和使用场景"
            ></el-input>
          </el-form-item>

          <el-form-item label="知识库">
            <div class="upload-area">
              <el-upload
                class="upload-component"
                drag
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
              >
                <el-icon class="el-icon--upload"><Upload /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 PDF、Word、TXT 等文档格式，单个文件不超过10MB
                  </div>
                </template>
              </el-upload>
            </div>
          </el-form-item>

          <el-form-item label="提示词模板" prop="prompt">
            <el-input
              v-model="assistantForm.prompt"
              type="textarea"
              :rows="6"
              placeholder="请输入提示词模板，用于指导AI助手的回答方向和风格"
            ></el-input>
          </el-form-item>

          <el-form-item label="参考示例">
            <div class="examples-section">
              <div v-for="(example, index) in assistantForm.examples" :key="index" class="example-item">
                <div class="example-header">
                  <h4>示例 {{ index + 1 }}</h4>
                  <el-button type="danger" link @click="removeExample(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-input
                  v-model="example.question"
                  placeholder="输入问题"
                  class="example-input"
                ></el-input>
                <el-input
                  v-model="example.answer"
                  type="textarea"
                  :rows="3"
                  placeholder="输入答案"
                  class="example-input"
                ></el-input>
              </div>
              <el-button type="primary" link @click="addExample">
                <el-icon><Plus /></el-icon>
                添加示例
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Upload, Delete, Plus } from '@element-plus/icons-vue'
import type { FormInstance, UploadFile } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const isSaving = ref(false)
const isEdit = ref(false)

const assistantForm = ref({
  name: '',
  domain: '',
  description: '',
  knowledgeBase: [] as UploadFile[],
  prompt: '',
  examples: [
    { question: '', answer: '' }
  ]
})

const formRules = {
  name: [
    { required: true, message: '请输入助手名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  domain: [
    { required: true, message: '请选择所属领域', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入助手描述', trigger: 'blur' },
    { min: 10, max: 200, message: '长度在 10 到 200 个字符', trigger: 'blur' }
  ],
  prompt: [
    { required: true, message: '请输入提示词模板', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

onMounted(() => {
  const id = route.query.id
  if (id) {
    isEdit.value = true
    // TODO: 获取助手详情
    loadAssistantDetail(id as string)
  }
})

const loadAssistantDetail = async (id: string) => {
  try {
    // TODO: 调用API获取助手详情
    const detail = {
      name: '招聘流程助手',
      domain: 'recruitment',
      description: '帮助优化招聘流程，提供面试评估和候选人筛选建议',
      prompt: '作为一个专业的招聘顾问...',
      examples: [
        {
          question: '如何评估应聘者的文化匹配度？',
          answer: '可以从以下几个方面评估...'
        }
      ]
    }
    Object.assign(assistantForm.value, detail)
  } catch (error) {
    ElMessage.error('获取助手详情失败')
  }
}

const handleFileChange = (file: UploadFile) => {
  assistantForm.value.knowledgeBase.push(file)
}

const handleFileRemove = (file: UploadFile) => {
  const index = assistantForm.value.knowledgeBase.indexOf(file)
  if (index > -1) {
    assistantForm.value.knowledgeBase.splice(index, 1)
  }
}

const addExample = () => {
  assistantForm.value.examples.push({ question: '', answer: '' })
}

const removeExample = (index: number) => {
  assistantForm.value.examples.splice(index, 1)
}

const saveAssistant = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      isSaving.value = true
      try {
        // TODO: 调用API保存助手
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('保存成功')
        router.back()
      } catch (error) {
        ElMessage.error('保存失败')
      } finally {
        isSaving.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.custom-creation-container {
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
    min-height: 0;
    background: white;
    border-radius: 8px;
    padding: 20px;
    overflow-y: auto;

    .form-section {
      max-width: 800px;
      margin: 0 auto;
    }
  }

  .upload-area {
    .upload-component {
      width: 100%;
    }
  }

  .examples-section {
    .example-item {
      margin-bottom: 20px;
      padding: 16px;
      border: 1px solid #ebeef5;
      border-radius: 4px;

      .example-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h4 {
          margin: 0;
          font-size: 14px;
          color: #606266;
        }
      }

      .example-input {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style> 