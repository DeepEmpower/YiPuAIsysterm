<template>
  <div class="report-generator-container fixed-height">
    <div class="report-header glass-panel">
      <h2>企业报表生成</h2>
      <div class="header-actions">
        <el-button type="primary" @click="generateReport">生成报表</el-button>
        <el-button @click="exportReport" :disabled="!reportGenerated">导出报表</el-button>
      </div>
    </div>

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

    <!-- 如果报表已生成，显示报表预览 -->
    <div v-if="reportGenerated" class="report-preview-section">
      <h3>报表预览</h3>
      <div class="report-preview">
        <!-- 根据不同报表类型显示不同的预览组件 -->
        <component :is="currentReportComponent" :data="reportData"></component>
      </div>
    </div>
    
    <!-- 如果报表未生成，显示引导信息 -->
    <div v-else class="report-guide">
      <div class="guide-content">
        <h3><el-icon><DataAnalysis /></el-icon> 表格配置</h3>
        
        <!-- 数据表配置选择器 -->
        <div class="table-config-selector">
          <!-- 搜索输入框 -->
          <div class="search-input">
            <div class="input-label">
              <el-icon><ChatLineRound /></el-icon> AI推荐报表
            </div>
            <el-input 
              v-model="tableSearchInput"
              placeholder="输入关键词，AI将为您推荐相关报表"
              @keyup.enter="handleInputSearch"
              prefix-icon="Search"
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
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { DocumentCopy, Document, Search, DataAnalysis, ChatLineRound, User, Plus } from '@element-plus/icons-vue';
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
.glass-panel {
  transition: all 0.2s ease;
}

.report-generator-container {
  padding: 16px;
  background-color: #f5f7fa;
  
  /* 玻璃面板效果 */
  .glass-panel {
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  }
  
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    
    h2 {
      margin: 0;
      font-size: 22px;
      color: #4d6fc9;
    }
    
    .header-actions {
      display: flex;
      gap: 10px;
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
  
  .report-preview-section {
    flex: 1;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    overflow: auto;
    
    h3 {
      margin-top: 0;
      padding-bottom: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .report-preview {
      padding: 15px 0;
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
        margin: 0 0 20px 0;
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
    background-color: #fff;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 10px;
    overflow: hidden;
    
    .input-label {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #606266;
      display: flex;
      align-items: center;
      gap: 5px;
      
      &.smaller {
        font-size: 13px;
        margin-bottom: 6px;
      }
    }
    
    .search-input {
      margin-bottom: 12px;
    }
    
    .tables-container {
      flex: 1;
      display: flex;
      gap: 20px;
      margin-bottom: 12px;
      min-height: 0; /* 关键设置：允许flex子项在需要时收缩 */
      
      .table-column {
        flex: 1;
        border-radius: 4px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        
        .column-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #333;
          font-size: 14px;
          
          .el-icon {
            color: #4d6fc9;
          }
        }
        
        .table-items {
          flex: 1; /* 填充剩余空间 */
          min-height: 0; /* 允许在需要时收缩 */
          overflow-y: auto;
          padding-right: 5px; /* 为滚动条留出空间 */
          /* 美化滚动条 */
          &::-webkit-scrollbar {
            width: 6px;
          }
          
          &::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          
          &::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
          }
          
          &::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
          
          .table-item {
            display: flex;
            align-items: center;
            background-color: #4d6fc9;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            margin-bottom: 10px;
            cursor: pointer;
            
            &:hover {
              background-color: #5e7dd6;
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            .el-checkbox {
              margin-right: 8px;
              
              :deep(.el-checkbox__input) {
                .el-checkbox__inner {
                  background-color: transparent;
                  border-color: white;
                }
                
                &.is-checked {
                  .el-checkbox__inner {
                    background-color: white;
                    border-color: white;
                    
                    &::after {
                      border-color: #4d6fc9;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    .action-row {
      display: flex;
      gap: 15px;
      
      .custom-input {
        flex: 1;
      }
      
      .el-button {
        width: 120px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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

/* 固定高度布局 */
.fixed-height {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style> 