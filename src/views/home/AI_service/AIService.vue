<template>
  <div class="ai-service-container">
    <div class="ai-team-header">
      <h2>我的AI客服团队</h2>
    </div>

    <!-- 标签分类 -->
    <div class="team-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="咨询助手" name="consultation"></el-tab-pane>
        <el-tab-pane label="售后助手" name="aftersales"></el-tab-pane>
        <el-tab-pane label="投诉处理" name="complaint"></el-tab-pane>
        <el-tab-pane label="自定义助手" name="custom"></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 当前分类标题 -->
    <div class="category-title" v-if="activeTab !== 'all'">
      {{ getCategoryTitle() }}
    </div>

    <!-- AI助手卡片列表 -->
    <div class="ai-cards-container">
        <!-- 产品客服助手 -->
        <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'aftersales'" @click="navigateToAssistant('product-service')">
          <div class="card-avatar">
            <img src="@/assets/images/avatars/avatar6.png" alt="产品客服助手">
          </div>
        <div class="card-content">
          <h3 class="assistant-name">产品客服助手</h3>
          <p class="assistant-desc">专业解答产品使用问题，提供技术支持和操作指导，确保用户获得最佳产品体验。</p>
          <div class="efficiency-stats">
            <span class="stat-item">响应速度 <span class="highlight">1分钟</span></span>
            <span class="stat-item">解决率 <span class="highlight">94%</span></span>
          </div>
        </div>
      </div>
      <!-- 智能问答助手 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'consultation'" @click="navigateToAssistant('smart-qa')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar1.png" alt="智能问答助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">智能问答助手</h3>
          <p class="assistant-desc">快速回答客户常见问题，提供准确的产品和服务信息，提升客户满意度。</p>
          <div class="efficiency-stats">
            <span class="stat-item">响应时间 <span class="highlight">3秒</span></span>
            <span class="stat-item">准确率 <span class="highlight">95%</span></span>
          </div>
        </div>
      </div>

      <!-- 售后服务助手 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'aftersales'" @click="navigateToAssistant('after-sales')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar2.png" alt="售后服务助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">售后服务助手</h3>
          <p class="assistant-desc">处理产品使用问题，提供故障诊断和解决方案，跟进维修进度。</p>
          <div class="efficiency-stats">
            <span class="stat-item">解决率 <span class="highlight">92%</span></span>
            <span class="stat-item">满意度 <span class="highlight">4.8分</span></span>
          </div>
        </div>
      </div>

      <!-- 投诉处理助手 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'complaint'" @click="navigateToAssistant('complaint-handling')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar3.png" alt="投诉处理助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">投诉处理助手</h3>
          <p class="assistant-desc">快速响应客户投诉，分析问题根源，提供解决方案和补偿建议。</p>
          <div class="efficiency-stats">
            <span class="stat-item">处理时效 <span class="highlight">10分钟</span></span>
            <span class="stat-item">满意度 <span class="highlight">90%</span></span>
          </div>
        </div>
      </div>

      <!-- 客户分析助手 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'consultation'" @click="navigateToAssistant('customer-analysis')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar4.png" alt="客户分析助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">客户分析助手</h3>
          <p class="assistant-desc">分析客户行为和需求特征，提供个性化服务建议，提升客户体验。</p>
          <div class="efficiency-stats">
            <span class="stat-item">分析准确率 <span class="highlight">96%</span></span>
            <span class="stat-item">转化率提升 <span class="highlight">35%</span></span>
          </div>
        </div>
      </div>

      <!-- 自动回访助手 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'aftersales'" @click="navigateToAssistant('auto-followup')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar5.png" alt="自动回访助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">自动回访助手</h3>
          <p class="assistant-desc">定期进行客户满意度回访，收集反馈意见，持续改进服务质量。</p>
          <div class="efficiency-stats">
            <span class="stat-item">覆盖率 <span class="highlight">98%</span></span>
            <span class="stat-item">反馈率 <span class="highlight">85%</span></span>
          </div>
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
    consultation: '咨询助手',
    aftersales: '售后助手',
    complaint: '投诉处理',
    custom: '自定义助手'
  }
  return titles[activeTab.value] || ''
}

const navigateToAssistant = (type: string) => {
  router.push(`/home/AI_service/${type}`)
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
  localStorage.setItem('customServiceAssistants', JSON.stringify(customAssistants.value))
}

// 从本地存储加载
const loadCustomAssistantsFromStorage = () => {
  const saved = localStorage.getItem('customServiceAssistants')
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
.ai-service-container {
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