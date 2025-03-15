<template>
  <div class="report-generator-container">
    <div class="report-header">
      <h2>企业报表生成</h2>
      <div class="header-actions">
        <el-button type="primary" @click="generateReport">生成报表</el-button>
        <el-button @click="exportReport" :disabled="!reportGenerated">导出报表</el-button>
      </div>
    </div>

    <div class="report-config-section">
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
      <el-empty description="请配置并生成报表">
        <template #image>
          <el-icon :size="60"><DocumentCopy /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DocumentCopy } from '@element-plus/icons-vue';
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
.report-generator-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 22px;
      color: #333;
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
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}
</style> 