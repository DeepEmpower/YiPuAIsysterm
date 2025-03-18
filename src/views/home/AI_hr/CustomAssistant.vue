<template>
  <div class="custom-assistant-container">
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>自定义AI助手</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="createAssistant">
          <el-icon><Plus /></el-icon>
          创建助手
        </el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="assistants-list" v-loading="isLoading">
        <el-empty v-if="assistants.length === 0" description="暂无自定义助手">
          <el-button type="primary" @click="createAssistant">立即创建</el-button>
        </el-empty>
        <div v-else class="assistants-grid">
          <div v-for="assistant in assistants" :key="assistant.id" class="assistant-card">
            <div class="card-header">
              <div class="assistant-icon" :style="{ backgroundColor: assistant.color }">
                {{ assistant.name.charAt(0) }}
              </div>
              <div class="assistant-info">
                <h3>{{ assistant.name }}</h3>
                <p>{{ assistant.description }}</p>
              </div>
              <el-dropdown trigger="click" @command="handleCommand($event, assistant)">
                <el-button type="primary" text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="card-content">
              <div class="content-item">
                <span class="label">领域：</span>
                <span>{{ assistant.domain }}</span>
              </div>
              <div class="content-item">
                <span class="label">创建时间：</span>
                <span>{{ formatDate(assistant.createTime) }}</span>
              </div>
              <div class="content-item">
                <span class="label">知识库：</span>
                <span>{{ assistant.knowledgeBase || '暂无' }}</span>
              </div>
            </div>
            <div class="card-footer">
              <el-button type="primary" @click="useAssistant(assistant)">使用助手</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="删除确认"
      width="400px"
    >
      <p>确定要删除该AI助手吗？删除后无法恢复。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, MoreFilled } from '@element-plus/icons-vue'
import { format } from 'date-fns'

const router = useRouter()
const isLoading = ref(false)
const deleteDialogVisible = ref(false)
const currentAssistant = ref(null)

// 示例数据
const assistants = ref([
  {
    id: 1,
    name: '招聘流程助手',
    description: '帮助优化招聘流程，提供面试评估和候选人筛选建议',
    domain: '招聘管理',
    createTime: new Date('2024-01-15'),
    knowledgeBase: '公司招聘制度.pdf',
    color: '#409EFF'
  },
  {
    id: 2,
    name: '员工关系助手',
    description: '协助处理员工关系问题，提供政策解读和建议',
    domain: '员工关系',
    createTime: new Date('2024-02-01'),
    knowledgeBase: '员工手册.pdf',
    color: '#67C23A'
  }
])

const formatDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}

const createAssistant = () => {
  router.push('/home/AI_hr/custom-creation')
}

const handleCommand = (command: string, assistant: any) => {
  switch (command) {
    case 'edit':
      router.push({
        path: '/home/AI_hr/custom-creation',
        query: { id: assistant.id }
      })
      break
    case 'delete':
      currentAssistant.value = assistant
      deleteDialogVisible.value = true
      break
  }
}

const confirmDelete = async () => {
  try {
    // TODO: 调用API删除助手
    await new Promise(resolve => setTimeout(resolve, 1000))
    assistants.value = assistants.value.filter(item => item.id !== currentAssistant.value?.id)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  } finally {
    deleteDialogVisible.value = false
    currentAssistant.value = null
  }
}

const useAssistant = (assistant: any) => {
  // TODO: 跳转到助手使用页面
  ElMessage.info('功能开发中')
}
</script>

<style scoped lang="scss">
.custom-assistant-container {
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
  }

  .main-content {
    flex: 1;
    min-height: 0;

    .assistants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      padding: 20px 0;
    }

    .assistant-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

      .card-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16px;

        .assistant-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
          margin-right: 12px;
        }

        .assistant-info {
          flex: 1;
          min-width: 0;

          h3 {
            margin: 0 0 4px;
            font-size: 16px;
            color: #303133;
          }

          p {
            margin: 0;
            font-size: 12px;
            color: #909399;
            line-height: 1.4;
          }
        }
      }

      .card-content {
        padding: 16px 0;
        border-top: 1px solid #ebeef5;
        border-bottom: 1px solid #ebeef5;

        .content-item {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            color: #909399;
            margin-right: 8px;
          }
        }
      }

      .card-footer {
        padding-top: 16px;
        text-align: right;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 