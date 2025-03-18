<template>
  <div class="ai-hr-container">
    <div class="ai-team-header">
      <h2>我的AI人力团队</h2>
    </div>

    <!-- 标签分类 -->
    <div class="team-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="招聘助手" name="recruitment"></el-tab-pane>
        <el-tab-pane label="培训助手" name="training"></el-tab-pane>
        <el-tab-pane label="绩效助手" name="performance"></el-tab-pane>
        <el-tab-pane label="自定义助手" name="custom"></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 当前分类标题 -->
    <div class="category-title" v-if="activeTab !== 'all'">
      {{ getCategoryTitle() }}
    </div>

    <!-- AI助手卡片列表 -->
    <div class="ai-cards-container">
      <!-- 职位描述编写 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'recruitment'" @click="navigateToAssistant('job-description')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar1.png" alt="职位描述编写">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">职位描述编写</h3>
          <p class="assistant-desc">快速生成专业的职位描述，包含岗位职责、任职要求等完整内容。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">96%</span></span>
            <span class="stat-item">提效 <span class="highlight">35倍</span></span>
          </div>
        </div>
      </div>

      <!-- 面试问题生成 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'recruitment'" @click="navigateToAssistant('interview-questions')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar2.png" alt="面试问题生成">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">面试问题生成</h3>
          <p class="assistant-desc">智能生成针对性面试问题，覆盖专业能力、通用素质等多个维度。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">92%</span></span>
            <span class="stat-item">提效 <span class="highlight">28倍</span></span>
          </div>
        </div>
      </div>

      <!-- 培训方案设计 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'training'" @click="navigateToAssistant('training-plan')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar3.png" alt="培训方案设计">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">培训方案设计</h3>
          <p class="assistant-desc">定制化培训计划制定，包含课程体系、培训方式、效果评估等。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">94%</span></span>
            <span class="stat-item">提效 <span class="highlight">32倍</span></span>
          </div>
        </div>
      </div>

      <!-- 绩效考核方案 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'performance'" @click="navigateToAssistant('performance-evaluation')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar4.png" alt="绩效考核方案">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">绩效考核方案</h3>
          <p class="assistant-desc">生成完整的绩效考核方案，包含KPI设定、评估标准等内容。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">95%</span></span>
            <span class="stat-item">提效 <span class="highlight">30倍</span></span>
          </div>
        </div>
      </div>

      <!-- 自定义助手卡片列表 -->
      <div 
        v-for="(assistant, index) in customAssistants" 
        :key="'custom-' + index" 
        class="ai-card custom-assistant-card"
        v-if="activeTab === 'all' || activeTab === 'custom'"
        @click="openAssistant(assistant.id)"
      >
        <div class="card-avatar">
          <img :src="assistant.avatar || '@/assets/images/avatars/custom.png'" :alt="assistant.title">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">{{ assistant.title }}</h3>
          <p class="assistant-desc">{{ assistant.description }}</p>
          <div class="efficiency-stats">
            <span class="stat-item">自定义助手</span>
            <span class="custom-actions">
              <el-button 
                type="text" 
                icon="Edit" 
                @click.stop="editCustomAssistant(assistant, index)"
              ></el-button>
              <el-button 
                type="text" 
                icon="Delete" 
                @click.stop="deleteCustomAssistant(index)"
              ></el-button>
            </span>
          </div>
        </div>
      </div>

      <!-- 添加自定义助手卡片 -->
      <div class="ai-card add-assistant-card" v-if="activeTab === 'custom' || activeTab === 'all'" @click="navigateToAssistant('custom-assistant')">
        <div class="add-content">
          <el-icon class="add-icon"><Plus /></el-icon>
          <h3>创建自定义AI助手</h3>
          <p>定制专属领域的AI人力助手，上传知识库，打造私人助理</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const activeTab = ref('all')
const customAssistants = ref([])

// 获取分类标题
const getCategoryTitle = () => {
  const titles = {
    recruitment: '招聘助手',
    training: '培训助手',
    performance: '绩效助手',
    custom: '自定义助手'
  }
  return titles[activeTab.value] || ''
}

const navigateToAssistant = (type: string) => {
  router.push(`/home/AI_hr/${type}`)
}

const openAssistant = (id: string) => {
  // TODO: 实现打开自定义助手的逻辑
}

const editCustomAssistant = (assistant: any, index: number) => {
  // TODO: 实现编辑自定义助手的逻辑
}

const deleteCustomAssistant = (index: number) => {
  ElMessageBox.confirm(
    '确定要删除这个自定义助手吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      customAssistants.value.splice(index, 1)
      saveCustomAssistantsToStorage()
      ElMessage.success('已删除自定义助手')
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 保存到本地存储
const saveCustomAssistantsToStorage = () => {
  localStorage.setItem('customAssistants', JSON.stringify(customAssistants.value))
}

// 从本地存储加载
const loadCustomAssistantsFromStorage = () => {
  const saved = localStorage.getItem('customAssistants')
  if (saved) {
    try {
      customAssistants.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse custom assistants from storage', e)
    }
  }
}

// 组件挂载时加载自定义助手
onMounted(() => {
  loadCustomAssistantsFromStorage()
})
</script>

<style scoped lang="scss">
.ai-hr-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
  
  .ai-team-header {
    margin-bottom: 20px;
    
    h2 {
      font-size: 24px;
      color: #303133;
      margin: 0;
    }
  }
  
  .team-tabs {
    margin-bottom: 20px;
    
    :deep(.el-tabs__nav) {
      background-color: #fff;
      border-radius: 8px;
      padding: 0 15px;
    }
  }
  
  .category-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 15px;
    padding-left: 10px;
    border-left: 4px solid #409eff;
  }
  
  .ai-cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
    
    .ai-card {
      display: flex;
      background-color: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
      
      .card-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 20px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .card-content {
        flex: 1;
        
        .assistant-name {
          font-size: 18px;
          margin: 0 0 10px;
          color: #303133;
        }
        
        .assistant-desc {
          font-size: 14px;
          color: #606266;
          margin-bottom: 15px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .efficiency-stats {
          display: flex;
          gap: 15px;
          font-size: 14px;
          color: #909399;
          
          .highlight {
            color: #f56c6c;
            font-weight: 600;
          }

          .custom-actions {
            margin-left: auto;
            display: flex;
            gap: 5px;
          }
        }
      }
    }
  }

  .add-assistant-card {
    border: 2px dashed #DCDFE6;
    background-color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s;
    
    &:hover {
      border-color: #409EFF;
      background-color: rgba(236, 245, 255, 0.7);
    }
    
    .add-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      text-align: center;
      
      .add-icon {
        font-size: 36px;
        color: #409EFF;
        margin-bottom: 15px;
      }

      h3 {
        margin: 0 0 10px;
        font-size: 18px;
        color: #303133;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #606266;
        line-height: 1.5;
      }
    }
  }

  .custom-assistant-card {
    border: 2px solid #e6f7ff;
    
    &:hover {
      border-color: #409EFF;
    }
  }
}
</style> 