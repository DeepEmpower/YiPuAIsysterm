<template>
  <div class="sales-report-container">
    <!-- 顶部标题和操作栏 -->
    <div class="header-section">
      <div class="title-area">
        <div class="title-text">
          <el-icon><Back /></el-icon>
          <a href="#" @click.prevent="goBack">返回AI文员团队</a>
          <span class="divider">|</span>
          <span class="page-title">销售报告编写</span>
        </div>
      </div>
      <div class="action-area">
        <el-button type="primary" @click="generateReport" :disabled="!canGenerate">生成报告</el-button>
        <el-button @click="saveAsDraft" :disabled="!reportContent">保存草稿</el-button>
        <el-button type="success" @click="exportReport" :disabled="!reportContent">导出报告</el-button>
      </div>
    </div>

    <!-- 主内容区域 - 左右两栏结构 -->
    <div class="content-wrapper">
      <!-- 左侧栏：配置区域和历史报告 -->
      <div class="left-column">
        <!-- 配置区域 -->
        <div class="config-section">
          <div class="section-title">
            <h3>报告配置</h3>
          </div>
          
          <el-form :model="reportConfig" label-position="top">
            <el-form-item label="产品名称">
              <el-input v-model="reportConfig.productName" placeholder="请输入产品名称"></el-input>
            </el-form-item>
            
            <el-form-item label="产品类型">
              <el-select v-model="reportConfig.productType" placeholder="请选择产品类型" style="width: 100%;">
                <el-option label="消费品" value="consumer"></el-option>
                <el-option label="工业品" value="industrial"></el-option>
                <el-option label="服务" value="service"></el-option>
                <el-option label="软件" value="software"></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="产品定位">
              <el-input 
                type="textarea" 
                v-model="reportConfig.marketPosition" 
                placeholder="请描述产品定位"
                :autosize="{ minRows: 3, maxRows: 6 }"
              ></el-input>
            </el-form-item>
            
            <el-form-item label="目标市场">
              <el-input 
                type="textarea" 
                v-model="reportConfig.targetMarket" 
                placeholder="请描述目标市场"
                :autosize="{ minRows: 3, maxRows: 6 }"
              ></el-input>
            </el-form-item>
            
            <el-form-item label="报告章节">
              <el-checkbox-group v-model="reportConfig.sections">
                <div class="checkbox-row">
                  <el-checkbox label="strategic_positioning">战略破局点定位</el-checkbox>
                  <el-checkbox label="channel_defense">立体渠道攻防</el-checkbox>
                  <el-checkbox label="digital_sales">数字销售引擎</el-checkbox>
                </div>
                <div class="checkbox-row">
                  <el-checkbox label="resource_model">资源投放模型</el-checkbox>
                  <el-checkbox label="risk_defense">风险防御工事</el-checkbox>
                  <el-checkbox label="result_validation">战果验证体系</el-checkbox>
                </div>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="销售周期">
              <el-select v-model="reportConfig.salesPeriod" placeholder="请选择销售周期" style="width: 100%;">
                <el-option label="月度" value="monthly"></el-option>
                <el-option label="季度" value="quarterly"></el-option>
                <el-option label="年度" value="yearly"></el-option>
                <el-option label="自定义" value="custom"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="销售目标（万元）">
              <el-input-number 
                v-model="reportConfig.salesTarget" 
                :min="0" 
                :max="10000" 
                :step="100"
                style="width: 100%;"
              ></el-input-number>
            </el-form-item>
            
            <el-form-item label="补充信息">
              <el-input 
                type="textarea" 
                v-model="reportConfig.additionalInfo" 
                placeholder="请输入任何其他需要包含在报告中的信息"
                :autosize="{ minRows: 3, maxRows: 6 }"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 历史报告区 -->
        <div class="history-section">
          <div class="section-title">
            <h3>历史报告</h3>
            <div class="history-actions">
              <el-button type="text" @click="loadHistoryReports"><el-icon><Refresh /></el-icon> 刷新</el-button>
            </div>
          </div>
          
          <el-scrollbar height="150px">
            <div class="history-list">
              <div 
                v-for="(item, index) in historyReports" 
                :key="index" 
                class="history-item"
                :class="{ active: selectedHistoryIndex === index }"
                @click="selectHistoryReport(index)"
              >
                <div class="history-info">
                  <div class="history-title">{{ item.title }}</div>
                  <div class="history-meta">{{ item.date }}</div>
                </div>
                <div class="history-actions">
                  <el-button type="text" @click.stop="deleteHistoryReport(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="empty-history" v-if="historyReports.length === 0">
                <el-empty description="暂无历史报告" :image-size="60" />
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
      
      <!-- 右侧栏：报告预览 -->
      <div class="right-column">
        <div class="preview-section" ref="previewRef">
          <div class="preview-header">
            <h2>报告预览</h2>
            <div class="preview-actions">
              <el-button type="primary" @click="copyReportContent" :icon="DocumentCopy">复制内容</el-button>
            </div>
          </div>
          
          <div class="preview-content" v-if="reportContent">
            <div class="preview-section-content" v-html="formatContent(reportContent)"></div>
          </div>
          <div v-else class="preview-empty">
            <el-empty description="暂无内容" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { DocumentCopy, Refresh, Delete, Back, Download } from '@element-plus/icons-vue';
import { useSalesReport } from '@/api/salesReport';
import { exportToWord } from '@/api/docExport';

const router = useRouter();

// 报告配置
const reportConfig = ref({
  productName: '',
  productType: 'consumer',
  marketPosition: '',
  targetMarket: '',
  sections: ['strategic_positioning', 'channel_defense', 'digital_sales', 'resource_model', 'risk_defense', 'result_validation'],
  salesPeriod: 'monthly',
  salesTarget: 100,
  additionalInfo: ''
});

// 使用销售报告API
const { state: reportState, generateSalesReport: apiGenerateReport, stopGeneration } = useSalesReport();

// 报告内容
const reportContent = computed(() => reportState.value.content);

// 是否正在生成报告
const isGenerating = computed(() => reportState.value.isGenerating);

// 是否可以生成报告
const canGenerate = computed(() => {
  return reportConfig.value.productName.trim() !== '' && 
         reportConfig.value.marketPosition.trim() !== '' &&
         reportConfig.value.sections.length > 0 &&
         !isGenerating.value;
});

// 返回上一页
const goBack = () => {
  router.push('/home/AI_writer/AIWriter');
};

// 生成报告
const generateReport = async () => {
  if (reportContent.value && !isGenerating.value) {
    try {
      await ElMessageBox.confirm('重新生成将覆盖当前报告内容，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
    } catch {
      return;
    }
  }
  
  if (!canGenerate.value) {
    ElMessage.warning('请填写必填字段');
    return;
  }
  
  apiGenerateReport(reportConfig.value);
  
  nextTick(() => {
    scrollToPreview();
  });
};

// 保存草稿
const saveAsDraft = () => {
  if (!reportContent.value) {
    ElMessage.warning('没有内容可保存');
    return;
  }
  
  const draft = {
    title: reportConfig.value.productName,
    content: reportContent.value,
    date: new Date().toLocaleDateString()
  };
  
  historyReports.value.unshift(draft);
  ElMessage.success('草稿已保存');
};

// 导出报告
const exportReport = () => {
  if (!reportContent.value) {
    ElMessage.warning('没有内容可导出');
    return;
  }
  
  const reportTitle = `${reportConfig.value.productName}销售报告`;
  
  ElMessageBox.confirm(
    '请选择导出格式',
    '导出报告',
    {
      confirmButtonText: 'Word文档',
      cancelButtonText: 'Markdown',
      distinguishCancelAndClose: true,
      type: 'info'
    }
  )
  .then(() => {
    exportToWord(reportTitle, reportContent.value, reportTitle);
    ElMessage.success('报告已导出为Word文档');
  })
  .catch((action) => {
    if (action === 'cancel') {
      const today = new Date().toLocaleDateString();
      const fullReport = `# ${reportTitle}\n\n生成日期: ${today}\n\n${reportContent.value}`;
      
      const blob = new Blob([fullReport], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      ElMessage.success('报告已导出为Markdown文件');
    }
  });
};

// 历史报告
const historyReports = ref([
  { title: '示例报告-新产品上市', date: '2023-12-15' },
  { title: '示例报告-季度销售分析', date: '2023-12-10' }
]);

// 选中的历史报告索引
const selectedHistoryIndex = ref(-1);

// 加载历史报告
const loadHistoryReports = () => {
  ElMessage.success('历史报告已刷新');
};

// 选择历史报告
const selectHistoryReport = (index) => {
  selectedHistoryIndex.value = index;
  reportState.value.content = '这是从服务器加载的历史报告内容示例。实际实现中，这里会加载真实的历史报告内容。';
};

// 删除历史报告
const deleteHistoryReport = (index) => {
  ElMessageBox.confirm('确定要删除这份历史报告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    historyReports.value.splice(index, selectedHistoryIndex.value === index ? 1 : 1);
    if (selectedHistoryIndex.value === index) {
      selectedHistoryIndex.value = -1;
      reportState.value.content = '';
    }
    ElMessage.success('删除成功');
  }).catch(() => {});
};

// 预览区域DOM引用
const previewRef = ref(null);

// 滚动到预览区域
const scrollToPreview = () => {
  if (previewRef.value) {
    previewRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};

// 复制报告内容
const copyReportContent = () => {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = reportContent.value;
  const textContent = tempElement.textContent || tempElement.innerText || '';
  
  navigator.clipboard.writeText(textContent).then(() => {
    ElMessage.success('报告内容已复制到剪贴板');
  }).catch(err => {
    console.error('复制失败:', err);
    ElMessage.error('复制失败，请手动复制');
  });
};

// 格式化报告内容
const formatContent = (content: string) => {
  if (!content) return '';
  
  let formatted = content;
  
  // 处理标题
  formatted = formatted.replace(/^# (.+?)$/gm, '<h1>$1</h1>');
  formatted = formatted.replace(/^## (.+?)$/gm, '<h2>$1</h2>');
  formatted = formatted.replace(/^### (.+?)$/gm, '<h3>$1</h3>');
  formatted = formatted.replace(/^#### (.+?)$/gm, '<h4>$1</h4>');
  
  // 处理列表
  formatted = formatted.replace(/^- (.+?)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/^(\d+)\. (.+?)$/gm, '<li>$2</li>');
  
  // 将连续的<li>元素包装在<ul>或<ol>中
  let inList = false;
  const lines = formatted.split('\n');
  formatted = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('<li>')) {
      if (!inList) {
        formatted += '<ul>';
        inList = true;
      }
      formatted += line;
    } else {
      if (inList) {
        formatted += '</ul>';
        inList = false;
      }
      formatted += line + '\n';
    }
  }
  if (inList) {
    formatted += '</ul>';
  }
  
  // 处理段落
  formatted = formatted.replace(/^(?!<h[1-6]|<ul|<li|<\/ul>)(.+?)$/gm, '<p>$1</p>');
  
  // 处理空行
  formatted = formatted.replace(/\n\n+/g, '\n');
  
  return formatted;
}

// 组件挂载时执行
onMounted(() => {
  loadHistoryReports();
});
</script>

<style scoped lang="scss">
.sales-report-container {
  padding: 0;
  background-color: #f0f2f5;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .header-section {
    padding: 10px 20px;
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e4e7ed;
    
    .title-text {
      display: flex;
      align-items: center;
      font-size: 14px;
      
      a {
        color: #409EFF;
        text-decoration: none;
        margin-left: 5px;
        
        &:hover {
          text-decoration: underline;
        }
      }
      
      .divider {
        margin: 0 10px;
        color: #dcdfe6;
      }
      
      .page-title {
        font-weight: 600;
        color: #303133;
      }
    }
    
    .action-area {
      display: flex;
      gap: 10px;
    }
  }
  
  .content-wrapper {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .left-column {
    width: 50%;
    border-right: 1px solid #e4e7ed;
    background-color: white;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .right-column {
    flex: 1;
    overflow: auto;
    background-color: white;
  }
  
  .config-section {
    flex: 1;
    padding: 20px;
    overflow: auto;
    border-bottom: 1px solid #e4e7ed;
  }
  
  .preview-section {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .preview-header h2 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
  
  .preview-actions {
    display: flex;
    gap: 10px;
  }
  
  .preview-content {
    min-height: 300px;
    max-height: 600px;
    overflow-y: auto;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 4px;
  }
  
  .preview-section-content {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
  }
  
  .preview-section-content :deep(h1) {
    font-size: 24px;
    margin: 20px 0 15px;
    color: #1a1a1a;
    border-bottom: 2px solid #409EFF;
    padding-bottom: 10px;
  }
  
  .preview-section-content :deep(h2) {
    font-size: 20px;
    margin: 18px 0 12px;
    color: #2c3e50;
  }
  
  .preview-section-content :deep(h3) {
    font-size: 16px;
    margin: 15px 0 10px;
    color: #34495e;
  }
  
  .preview-section-content :deep(p) {
    margin: 10px 0;
    text-align: justify;
  }
  
  .preview-section-content :deep(ul) {
    margin: 10px 0;
    padding-left: 20px;
  }
  
  .preview-section-content :deep(li) {
    margin: 5px 0;
  }
  
  .preview-section-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  
  .preview-section-content :deep(th),
  .preview-section-content :deep(td) {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  .preview-section-content :deep(th) {
    background-color: #f5f7fa;
    font-weight: bold;
  }
  
  .preview-section-content :deep(strong) {
    color: #409EFF;
    font-weight: 600;
  }
  
  .preview-empty {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    border-radius: 4px;
  }
  
  .history-section {
    padding: 20px;
    height: 220px;
    display: flex;
    flex-direction: column;
    
    .el-scrollbar {
      flex: 1;
    }
  }
  
  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .history-list {
    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid #ebeef5;
      transition: background-color 0.3s;
      cursor: pointer;
      
      &:hover {
        background-color: #ecf5ff;
      }
      
      &.active {
        background-color: #ecf5ff;
        border-left: 3px solid #409EFF;
      }
      
      .history-info {
        .history-title {
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .history-meta {
          font-size: 12px;
          color: #909399;
        }
      }
    }
    
    .empty-history {
      display: flex;
      justify-content: center;
      padding: 20px 0;
    }
  }
  
  .checkbox-row {
    margin-bottom: 10px;
    display: flex;
    gap: 20px;
  }
}
</style> 