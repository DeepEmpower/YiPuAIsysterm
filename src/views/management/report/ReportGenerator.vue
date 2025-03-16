<template>
  <div class="report-generator-container fixed-height">
    <!-- 主体内容区域 - 左右两栏布局 -->
    <div class="main-content">
      <!-- 左侧：配置区域 -->
      <div class="config-column">
        <!-- 报表基本配置 -->
        <div class="report-config-section">
          <div class="section-title">
            <h3><el-icon><Document /></el-icon> 报表配置</h3>
          </div>
          
          <el-form :model="reportConfig" label-width="120px">
            <el-form-item label="报表类型">
              <el-select v-model="reportConfig.type" placeholder="请选择报表类型">
                <el-option label="财务报表" value="financial" />
                <el-option label="销售报表" value="sales" />
                <el-option label="人力资源报表" value="hr" />
                <el-option label="生产报表" value="production" />
                <el-option label="客户分析报表" value="customer" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="reportConfig.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
              />
            </el-form-item>
            
            <el-form-item label="数据来源">
              <el-select v-model="reportConfig.dataSource" placeholder="请选择数据来源">
                <el-option label="系统数据库" value="system" />
                <el-option label="Excel导入" value="excel" />
                <el-option label="外部API" value="api" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="报表格式">
              <el-radio-group v-model="reportConfig.format">
                <el-radio label="excel">Excel</el-radio>
                <el-radio label="pdf">PDF</el-radio>
                <el-radio label="word">Word</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 表格配置区域 -->
        <div class="table-guide">
          <div class="guide-content">
            <h3><el-icon><DataAnalysis /></el-icon> 表格配置</h3>
            
            <!-- 数据表配置选择器 -->
            <div class="table-config-selector">
              <!-- 搜索输入框 -->
              <div class="search-input">
                <div class="input-label">
                  <el-icon class="recommendation-icon"><ChatLineRound /></el-icon> AI推荐报表
                </div>
                <el-input 
                  v-model="tableSearchInput"
                  placeholder="输入关键词，AI将为您推荐相关报表"
                  @keyup.enter="handleInputSearch"
                  prefix-icon="Search"
                  size="large"
                  type="textarea"
                  :rows="2"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  clearable
                ></el-input>
              </div>

              <!-- 两栏布局: AI推荐和自定义表格 -->
              <div class="tables-container">
                <!-- 左侧: AI推荐表格 -->
                <div class="table-column ai-recommendations glass-panel">
                  <div class="column-title">
                    <el-icon><ChatLineRound /></el-icon> AI推荐的报表
                  </div>
                  <div class="table-items">
                    <div 
                      v-for="(table, index) in aiRecommendedTables" 
                      :key="index"
                      class="table-item"
                      @click="toggleTableSelection(table)"
                    >
                      <el-checkbox v-model="table.selected"></el-checkbox>
                      <span>{{ table.name }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- 右侧: 用户自定义表格 -->
                <div class="table-column custom-tables glass-panel">
                  <div class="column-title">
                    <el-icon><User /></el-icon> 用户自定义表格
                  </div>
                  <div class="table-items">
                    <div 
                      v-for="(table, index) in customTables" 
                      :key="index"
                      class="table-item"
                      @click="toggleTableSelection(table)"
                    >
                      <el-checkbox v-model="table.selected"></el-checkbox>
                      <span>{{ table.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 自定义和搜索 -->
              <div class="action-row">
                <div class="input-label smaller">
                  <el-icon><Plus /></el-icon> 查找自定义表格
                </div>
                <el-input 
                  v-model="customTableName"
                  placeholder="输入表名关键词进行查找"
                  class="custom-input"
                  @keyup.enter="searchTableByName"
                  prefix-icon="Search"
                ></el-input>
                <el-button type="primary" @click="searchTableByName">查找</el-button>
              </div>
            </div>

            <!-- 搜索结果提示 -->
            <div 
              class="search-result-tip" 
              :class="searchResultMessageType"
              v-if="searchResultMessage"
            >
              {{ searchResultMessage }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：报表预览区域 -->
      <div class="preview-column">
        <div class="report-preview-section glass-panel">
          <div class="section-title">
            <div class="title-content">
              <h3><el-icon><DocumentCopy /></el-icon> 报表预览</h3>
            </div>
            <div class="title-actions">
              <el-button type="primary" @click="generateReport" size="small">
                <el-icon><RefreshRight /></el-icon> 生成报表
              </el-button>
              <el-button @click="exportReport" :disabled="!reportGenerated" size="small">
                <el-icon><Download /></el-icon> 导出报表
              </el-button>
            </div>
          </div>
          
          <!-- 报表内容区域(添加滚动条) -->
          <div class="report-content-wrapper">
            <!-- 报表未生成时显示提示 -->
            <div v-if="!reportGenerated" class="empty-preview">
              <div class="preview-placeholder">
                <el-icon :size="60" class="preview-icon"><DataAnalysis /></el-icon>
                <h4>报表预览区域</h4>
                <p>请完成左侧配置并点击"生成报表"按钮</p>
                <div class="preview-tips">
                  <div class="tip-item">
                    <el-icon><InfoFilled /></el-icon>
                    <span>选择所需的报表类型和时间范围</span>
                  </div>
                  <div class="tip-item">
                    <el-icon><InfoFilled /></el-icon>
                    <span>从AI推荐或自定义表格中选择所需数据表</span>
                  </div>
                  <div class="tip-item">
                    <el-icon><InfoFilled /></el-icon>
                    <span>点击上方"生成报表"按钮查看结果</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 报表已生成时显示预览内容 -->
            <div v-else class="report-content">
              <!-- 根据不同报表类型显示不同的预览组件 -->
              <component :is="currentReportComponent" :data="reportData"></component>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { DocumentCopy, Document, Search, DataAnalysis, ChatLineRound, User, Plus, InfoFilled, RefreshRight, Download } from '@element-plus/icons-vue';
import { ElMessage, ElLoading } from 'element-plus';

// 修正引入路径
import FinancialReport from '@/views/management/report/components/FinancialReport.vue';
import SalesReport from '@/views/management/report/components/SalesReport.vue';
import HRReport from '@/views/management/report/components/HRReport.vue';
import ProductionReport from '@/views/management/report/components/ProductionReport.vue';
import CustomerReport from '@/views/management/report/components/CustomerReport.vue';

// 报表配置
const reportConfig = ref({
  type: 'financial',
  dateRange: [],
  dataSource: 'system',
  format: 'excel'
});

// 报表是否已生成
const reportGenerated = ref(false);

// 报表数据
const reportData = ref(null);

// 根据报表类型选择对应的组件
const currentReportComponent = computed(() => {
  switch (reportConfig.value.type) {
    case 'financial': return FinancialReport;
    case 'sales': return SalesReport;
    case 'hr': return HRReport;
    case 'production': return ProductionReport;
    case 'customer': return CustomerReport;
    default: return FinancialReport;
  }
});

// 表格搜索相关变量
const tableSearchInput = ref('');
const customTableName = ref('');
const searchResultMessage = ref('');

// 计算消息类型
const searchResultMessageType = computed(() => {
  if (!searchResultMessage.value) return '';
  return searchResultMessage.value.includes('未找到') ? 'warning-message' : 'success-message';
});

// AI推荐的表格
const aiRecommendedTables = reactive([
  { id: 1, name: 'AI推荐的表名', selected: false },
  { id: 2, name: '销售数据汇总表', selected: false },
  { id: 3, name: '客户反馈分析', selected: false },
  { id: 4, name: '销售业绩同比分析', selected: false },
  { id: 5, name: '季度销售业绩', selected: false },
  { id: 6, name: '区域销售情况', selected: false },
  { id: 7, name: '产品销量排名', selected: false },
  { id: 8, name: '销售人员业绩', selected: false },
  { id: 9, name: '退货率分析', selected: false },
  { id: 10, name: '客户投诉统计', selected: false },
  { id: 11, name: '销售渠道分析', selected: false },
  { id: 12, name: '产品类别统计', selected: false }
]);

// 用户自定义的表格
const customTables = reactive([
  { id: 101, name: '自定义报表1', selected: false },
  { id: 102, name: '产品库存状态', selected: false },
  { id: 103, name: '员工绩效考核', selected: false },
  { id: 104, name: '市场营销活动', selected: false },
  { id: 105, name: '渠道分销情况', selected: false },
  { id: 106, name: '价格敏感度分析', selected: false },
  { id: 107, name: '供应商评估', selected: false },
  { id: 108, name: '客户满意度调查', selected: false }
]);

// 切换表格选择状态
const toggleTableSelection = (table) => {
  table.selected = !table.selected;
};

// 处理AI推荐报表
const handleInputSearch = () => {
  // 清除搜索结果消息
  searchResultMessage.value = '';
  
  // 调用AI API获取推荐报表
  // 目前仅做UI展示，添加模拟数据
  if (tableSearchInput.value) {
    // 模拟搜索结果
    const searchText = tableSearchInput.value.trim();
    if (searchText) {
      // 清除之前的推荐
      aiRecommendedTables.splice(0, aiRecommendedTables.length);
      
      // 添加模拟推荐结果
      aiRecommendedTables.push(
        { id: Date.now(), name: `${searchText}汇总表`, selected: false },
        { id: Date.now() + 1, name: `${searchText}分析报表`, selected: false },
        { id: Date.now() + 2, name: `${searchText}趋势图`, selected: false }
      );
      
      // 生成推荐后清空输入框
      tableSearchInput.value = '';
    }
  }
};

// 根据表名搜索表格
const searchTableByName = () => {
  // 清除搜索结果消息
  searchResultMessage.value = '';
  
  if (customTableName.value) {
    const tableName = customTableName.value.trim();
    if (tableName) {
      // 模拟查找自定义表格的过程
      const loading = ElLoading.service({
        lock: true,
        text: '正在查找相关表格...',
        background: 'rgba(255, 255, 255, 0.7)'
      });
      
      // 模拟网络延迟
      setTimeout(() => {
        loading.close();
        
        // 随机决定是否找到表格（实际应用中会根据API结果决定）
        const foundRelatedTables = Math.random() > 0.3; // 70%概率找到相关表格
        
        if (foundRelatedTables) {
          // 模拟找到的相关表格
          const searchResults = [
            { id: Date.now(), name: tableName, selected: false },
            { id: Date.now() + 1, name: `${tableName}_明细`, selected: false }
          ];
          
          // 添加到自定义表格列表
          searchResults.forEach(table => {
            customTables.push(table);
          });
          
          searchResultMessage.value = `已找到 ${searchResults.length} 个相关自定义表格`;
        } else {
          // 没有找到相关表格
          searchResultMessage.value = `未找到与"${tableName}"相关的自定义表格，请尝试其他关键词`;
        }
        
        // 清空输入框
        customTableName.value = '';
      }, 1000);
    }
  }
};

// 获取所有选中的表格
const getSelectedTables = () => {
  const selectedTables = [];
  
  // 获取AI推荐中选中的表格
  aiRecommendedTables.forEach(table => {
    if (table.selected) {
      selectedTables.push(table);
    }
  });
  
  // 获取自定义中选中的表格
  customTables.forEach(table => {
    if (table.selected) {
      selectedTables.push(table);
    }
  });
  
  return selectedTables;
};

// 生成报表
const generateReport = async () => {
  if (!reportConfig.value.dateRange || reportConfig.value.dateRange.length < 2) {
    ElMessage.warning('请选择完整的时间范围');
    return;
  }
  
  try {
    // 显示加载状态
    const loading = ElLoading.service({
      lock: true,
      text: '正在生成报表...',
      background: 'rgba(0, 0, 0, 0.7)',
    });
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟报表数据
    reportData.value = {
      title: getReportTitle(),
      period: `${formatDate(reportConfig.value.dateRange[0])} 至 ${formatDate(reportConfig.value.dateRange[1])}`,
      data: generateMockData(),
      charts: ['bar', 'line', 'pie']
    };
    
    reportGenerated.value = true;
    loading.close();
    ElMessage.success('报表生成成功');
  } catch (error) {
    ElMessage.error('报表生成失败，请重试');
    console.error('报表生成错误:', error);
  }
};

// 导出报表
const exportReport = () => {
  ElMessage.success(`报表已导出为${getFormatName(reportConfig.value.format)}格式`);
};

// 获取报表标题
const getReportTitle = () => {
  const typeNames = {
    financial: '财务报表',
    sales: '销售报表',
    hr: '人力资源报表',
    production: '生产报表',
    customer: '客户分析报表'
  };
  return typeNames[reportConfig.value.type] || '企业报表';
};

// 获取格式名称
const getFormatName = (format) => {
  const formatNames = {
    excel: 'Excel',
    pdf: 'PDF',
    word: 'Word'
  };
  return formatNames[format] || format;
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

// 生成模拟数据
const generateMockData = () => {
  // 根据不同报表类型生成不同的模拟数据
  switch (reportConfig.value.type) {
    case 'financial':
      return {
        income: 1250000,
        expense: 980000,
        profit: 270000,
        details: [
          { month: '一月', income: 120000, expense: 95000 },
          { month: '二月', income: 135000, expense: 105000 },
          { month: '三月', income: 145000, expense: 110000 }
        ]
      };
    case 'sales':
      return {
        totalSales: 825000,
        products: [
          { name: '产品A', sales: 320000, percentage: 38.8 },
          { name: '产品B', sales: 250000, percentage: 30.3 },
          { name: '产品C', sales: 185000, percentage: 22.4 },
          { name: '其他产品', sales: 70000, percentage: 8.5 }
        ]
      };
    default:
      return {};
  }
};
</script>

<style scoped lang="scss">
/* 添加过渡动画 */
.table-item,
.el-button,
.glass-panel,
.preview-column {
  transition: all 0.3s ease;
}

/* 固定高度布局 */
.fixed-height {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.report-generator-container {
  padding: 12px;
  background-color: #f5f7fa;
}

/* 玻璃面板效果 */
.glass-panel {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
}

.report-generator-container {
  padding: 12px;
  background-color: #f5f7fa;
  
  .report-config-section {
    background-color: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    max-height: 235px;
    overflow-y: auto;
    
    .section-title h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #4d6fc9;
      
      .el-icon {
        font-size: 20px;
      }
    }
  }
  
  .report-preview-section {
    flex: 1;
    background-color: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    overflow: hidden;
    
    .report-content-wrapper {
      flex: 1;
      overflow-y: auto;
      padding-right: 5px; /* 为滚动条预留空间 */
    }
    
    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .title-content {
        display: flex;
        align-items: center;
      }
      
      .title-actions {
        display: flex;
        gap: 10px;
        
        .el-button {
          transition: all 0.2s ease;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }
    
    .preview-content {
      flex: 1;
      overflow: auto;
      padding: 0;
      
      .empty-preview {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        
        .preview-placeholder {
          text-align: center;
          width: 100%;
          padding: 30px 20px;
          
          .preview-icon {
            color: #c0c4cc;
            margin-bottom: 20px;
          }
          
          h4 {
            font-size: 18px;
            color: #606266;
            margin: 0 0 10px 0;
          }
          
          p {
            color: #909399;
            margin: 0 0 25px 0;
          }
          
          .preview-tips {
            margin-top: 40px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            max-width: 450px;
            margin-left: auto;
            margin-right: auto;
            text-align: left;
            
            .tip-item {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 12px;
              color: #606266;
              
              .el-icon {
                color: #4d6fc9;
                font-size: 16px;
              }
            }
          }
        }
      }
      
      .report-content {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  
  .report-guide {
    flex: 1;
    display: block;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 16px;
    overflow-y: hidden;
    
    .guide-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      
      h3 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 12px 0;
        color: #4d6fc9;
        font-size: 18px;
        
        .el-icon {
          font-size: 20px;
        }
      }
    }
  }

  /* 表格选择器样式 */
  .table-config-selector {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow: hidden;
    max-height: calc(100% - 80px); /* 减小高度，给搜索框留更多空间 */
    
    .search-input {
      margin-bottom: 15px;
      padding: 12px;
      background-color: #f9fafc;
      border-radius: 8px;
      border: 1px solid #e6e9f1;
      display: flex;
      flex-direction: column;
      
      .input-label {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        font-size: 15px;
        font-weight: 500;
        color: #4d6fc9;
        
        .recommendation-icon {
          font-size: 18px;
          margin-right: 6px;
        }
      }
      
      .el-input {
        :deep(.el-input__wrapper) {
          padding: 8px 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        :deep(.el-input__inner) {
          font-size: 14px;
        }
        
        :deep(.el-textarea__inner) {
          padding: 10px 12px;
          font-size: 14px;
          min-height: 60px;
          resize: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border-radius: 6px;
        }
      }
    }
    
    .tables-container {
      flex: 1;
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
      min-height: 0; /* 关键设置：允许flex子项在需要时收缩 */
      
      .table-column {
        flex: 1;
        border-radius: 4px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background-color: #f5f7fa;
        
        .column-title {
          font-weight: 500;
          margin-bottom: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .table-items {
          flex: 1;
          overflow-y: auto;
          max-height: 180px; /* 减小表格高度 */
        }
      }
    }
  }

  .search-result-tip {
    margin-top: 10px;
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 4px;
    flex-shrink: 0; /* 防止消息挤压表格空间 */
  }

  /* 添加不同类型消息的样式 */
  .success-message {
    background-color: #f0f9eb;
    color: #67c23a;
  }
  
  .warning-message {
    background-color: #fdf6ec;
    color: #e6a23c;
  }
}

/* 主内容区域 - 左右两栏布局 */
.main-content {
  flex: 1;
  display: flex;
  gap: 12px;
  min-height: 0; /* 确保可以被压缩 */
  overflow: hidden;
  padding-top: 4px; /* 由于移除了顶部标题，添加一点上边距 */
  
  /* 左侧配置栏 */
  .config-column {
    flex: 0.8;
    min-width: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 5px; /* 为滚动条预留空间 */
  }
  
  /* 右侧预览栏 */
  .preview-column {
    flex: 1.2;
    min-width: 0;
    overflow: hidden; /* 保持外部容器不滚动 */
    
    &:hover {
      flex: 1.3; /* 悬停时略微放大 */
    }
  }
}

.report-config-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  max-height: 235px;
  overflow-y: auto;
  
  .section-title h3 {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #4d6fc9;
    
    .el-icon {
      font-size: 20px;
    }
  }
}

.table-guide {
  flex: 1;
  display: block;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 16px;
  overflow-y: hidden;
  
  .guide-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    
    h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 12px 0;
      color: #4d6fc9;
      font-size: 18px;
      
      .el-icon {
        font-size: 20px;
      }
    }
  }
}

/* 报表预览区域样式 */
.report-preview-section {
  height: 100%;
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .report-content-wrapper {
    flex: 1;
    overflow-y: auto;
    padding-right: 5px; /* 为滚动条预留空间 */
  }
  
  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .title-content {
      display: flex;
      align-items: center;
    }
    
    .title-actions {
      display: flex;
      gap: 10px;
      
      .el-button {
        transition: all 0.2s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .el-icon {
          margin-right: 4px;
        }
      }
    }
  }
  
  .preview-content {
    flex: 1;
    overflow: auto;
    padding: 0;
    
    .empty-preview {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
      
      .preview-placeholder {
        text-align: center;
        width: 100%;
        padding: 30px 20px;
        
        .preview-icon {
          color: #c0c4cc;
          margin-bottom: 20px;
        }
        
        h4 {
          font-size: 18px;
          color: #606266;
          margin: 0 0 10px 0;
        }
        
        p {
          color: #909399;
          margin: 0 0 25px 0;
        }
        
        .preview-tips {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: 450px;
          margin-left: auto;
          margin-right: auto;
          text-align: left;
          
          .tip-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            color: #606266;
            
            .el-icon {
              color: #4d6fc9;
              font-size: 16px;
            }
          }
        }
      }
    }
    
    .report-content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

/* 各种报表组件的通用样式 */
.sales-report, .hr-report, .production-report, .customer-report {
  padding: 15px 0;
}

/* 空预览提示 */
.empty-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

/* 确保表格和图表区域正常显示 */
.chart, .distribution-chart {
  min-height: 300px;
  margin: 15px 0;
}

/* 确保表格正常显示 */
.el-table {
  margin-bottom: 20px;
}
</style> 