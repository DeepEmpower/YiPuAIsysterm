<template>
  <div class="feasibility-report-container">
    <!-- 顶部标题和操作栏 -->
    <div class="header-section">
      <div class="title-area">
        <div class="title-text">
          <el-icon><Back /></el-icon>
          <a href="#" @click.prevent="goBack">返回AI文员团队</a>
          <span class="divider">|</span>
          <span class="page-title">可研报告编写</span>
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
            <el-form-item label="项目名称">
              <el-input v-model="reportConfig.projectName" placeholder="请输入项目名称"></el-input>
            </el-form-item>
            
            <el-form-item label="项目类型">
              <el-select v-model="reportConfig.projectType" placeholder="请选择项目类型" style="width: 100%;">
                <el-option label="产品开发" value="product"></el-option>
                <el-option label="技术研发" value="technology"></el-option>
                <el-option label="市场营销" value="marketing"></el-option>
                <el-option label="基础设施" value="infrastructure"></el-option>
                <el-option label="企业服务" value="service"></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="项目背景">
              <el-input 
                type="textarea" 
                v-model="reportConfig.background" 
                placeholder="请简述项目背景和目的"
                :autosize="{ minRows: 3, maxRows: 6 }"
              ></el-input>
            </el-form-item>
            
            <el-form-item label="报告内容选项">
              <el-checkbox-group v-model="reportConfig.sections">
                <div class="checkbox-row">
                  <el-checkbox label="executive_summary">执行摘要</el-checkbox>
                  <el-checkbox label="market_analysis">市场分析</el-checkbox>
                </div>
                <div class="checkbox-row">
                  <el-checkbox label="technical_analysis">技术可行性</el-checkbox>
                  <el-checkbox label="financial_analysis">财务分析</el-checkbox>
                </div>
                <div class="checkbox-row">
                  <el-checkbox label="risk_analysis">风险分析</el-checkbox>
                  <el-checkbox label="implementation_plan">实施计划</el-checkbox>
                </div>
                <div class="checkbox-row">
                  <el-checkbox label="conclusion">结论与建议</el-checkbox>
                  <el-checkbox label="appendix">附录</el-checkbox>
                </div>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="报告深度">
              <el-radio-group v-model="reportConfig.depth">
                <el-radio-button label="brief">简要</el-radio-button>
                <el-radio-button label="standard">标准</el-radio-button>
                <el-radio-button label="detailed">详细</el-radio-button>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="预算范围（万元）">
              <el-slider 
                v-model="reportConfig.budget" 
                range 
                :min="10" 
                :max="1000"
                :marks="{10: '10', 100: '100', 500: '500', 1000: '1000'}"
              ></el-slider>
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
        
        <!-- 历史报告区移到左侧栏底部 -->
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
        <div class="preview-section">
          <div class="section-title">
            <h3>报告预览</h3>
            <div class="preview-actions" v-if="isGenerating">
              <el-button type="danger" size="small" @click="handleStopGeneration">停止生成</el-button>
            </div>
          </div>
          
          <div class="preview-wrapper" ref="previewRef">
            <el-empty description="报告预览区域" v-if="!reportContent && !isGenerating" />
            
            <div v-if="isGenerating && !reportContent" class="generating-indicator">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>正在生成报告，请稍候...</span>
            </div>
            
            <div v-if="reportContent" class="preview-content">
              <div class="report-title">{{ reportConfig.projectName || '项目名称' }}可行性研究报告</div>
              <div class="report-meta">生成日期: {{ new Date().toLocaleDateString() }}</div>
              <div class="report-body markdown-body" v-html="formatContent(reportContent)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { DocumentCopy, Refresh, Delete, Back, Loading, Download } from '@element-plus/icons-vue';
import { useFeasibilityReport } from '@/api/feasibility';
import { exportToWord } from '@/api/docExport';

const router = useRouter();

// 报告配置
const reportConfig = ref({
  projectName: '',
  projectType: 'product',
  background: '',
  sections: ['executive_summary', 'market_analysis', 'technical_analysis', 'financial_analysis'],
  depth: 'standard',
  budget: [100, 500],
  additionalInfo: ''
});

// 使用可行性报告API
const { state: reportState, generateReport: apiGenerateReport, stopGeneration } = useFeasibilityReport();

// 报告内容
const reportContent = computed(() => reportState.value.content);

// 是否正在生成报告
const isGenerating = computed(() => reportState.value.isGenerating);

// 当前日期时间
const currentDateTime = computed(() => {
  const now = new Date();
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// 是否可以生成报告
const canGenerate = computed(() => {
  return reportConfig.value.projectName.trim() !== '' && 
         reportConfig.value.background.trim() !== '' &&
        !isGenerating.value;
});

// 返回上一页
const goBack = () => {
  router.push('/home/AI_writer');
};

// 生成报告
const generateReport = async () => {
  if (reportContent.value && !isGenerating.value) {
    // 如果已有报告内容，询问是否重新生成
    try {
      await ElMessageBox.confirm('重新生成将覆盖当前报告内容，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
    } catch {
      return; // 用户取消操作
    }
  }
  
  // 检查必填字段
  if (!canGenerate.value) {
    ElMessage.warning('请填写项目名称和项目背景');
    return;
  }
  
  // 调用API生成报告
  apiGenerateReport(reportConfig.value);
  
  // 滚动到预览区域
  nextTick(() => {
    scrollToPreview();
  });
};

// 停止生成报告
const handleStopGeneration = () => {
  stopGeneration();
  ElMessage.info('已停止生成报告');
};

// 保存草稿
const saveAsDraft = () => {
  if (!reportContent.value) {
    ElMessage.warning('没有内容可保存');
    return;
  }
  
  // 模拟草稿保存
  const draft = {
    title: reportConfig.value.projectName,
    content: reportContent.value,
    date: new Date().toLocaleDateString()
  };
  
  // 将草稿放到历史记录中
  historyReports.value.unshift(draft);
  ElMessage.success('草稿已保存');
};

// 导出报告
const exportReport = () => {
  if (!reportContent.value) {
    ElMessage.warning('没有内容可导出');
    return;
  }
  
  // 创建格式化的报告标题
  const reportTitle = `${reportConfig.value.projectName}可行性研究报告`;
  
  // 显示导出选项
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
    // 导出Word文档
    exportToWord(reportTitle, reportContent.value, reportTitle);
    ElMessage.success('报告已导出为Word文档');
  })
  .catch((action) => {
    if (action === 'cancel') {
      // 导出Markdown
      const today = new Date().toLocaleDateString();
      const fullReport = `# ${reportTitle}\n\n生成日期: ${today}\n\n${reportContent.value}`;
      
      // 创建下载链接
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
  { title: '示例报告-电商平台升级', date: '2023-12-15' },
  { title: '示例报告-新产品开发计划', date: '2023-12-10' }
]);

// 选中的历史报告索引
const selectedHistoryIndex = ref(-1);

// 加载历史报告
const loadHistoryReports = () => {
  // 模拟加载历史报告
  ElMessage.success('历史报告已刷新');
};

// 选择历史报告
const selectHistoryReport = (index) => {
  selectedHistoryIndex.value = index;
  // 模拟加载报告内容
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
  // 创建临时元素，移除HTML标签
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

// 格式化报告内容 - 增强版Markdown到HTML转换
const formatContent = (content: string) => {
  if (!content) return '';
  
  // 将Markdown格式转换为HTML
  let formatted = content;
  
  // 1. 处理标题
  formatted = formatted.replace(/^# (.+?)$/gm, '<h1>$1</h1>');
  formatted = formatted.replace(/^## (.+?)$/gm, '<h2>$1</h2>');
  formatted = formatted.replace(/^### (.+?)$/gm, '<h3>$1</h3>');
  formatted = formatted.replace(/^#### (.+?)$/gm, '<h4>$1</h4>');
  
  // 2. 处理列表
  formatted = formatted.replace(/^- (.+?)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/^(\d+)\. (.+?)$/gm, '<li>$2</li>');
  
  // 3. 将连续的<li>元素包装在<ul>或<ol>中
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
  
  // 4. 处理段落
  formatted = formatted.replace(/^(?!<h[1-6]|<ul|<li|<\/ul>)(.+?)$/gm, '<p>$1</p>');
  
  // 5. 处理空行
  formatted = formatted.replace(/\n\n+/g, '\n');
  
  return formatted;
}

// 组件挂载时执行
onMounted(() => {
  loadHistoryReports();
});
</script>

<style scoped lang="scss">
.feasibility-report-container {
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
    padding: 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
    
    .preview-content {
      flex: 1;
      overflow: auto;
    }
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
  
  .preview-content {
    .report-title {
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10px;
    }
    
    .report-meta {
      text-align: center;
      color: #909399;
      font-size: 14px;
      margin-bottom: 30px;
    }
    
    .report-body {
      padding: 0;
      
      h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
      }
      
      p {
        margin: 10px 0;
        line-height: 1.6;
      }
      
      ul, ol {
        padding-left: 2em;
        margin: 10px 0;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        
        th, td {
          border: 1px solid #dcdfe6;
          padding: 8px 12px;
          text-align: left;
        }
        
        th {
          background-color: #f5f7fa;
        }
      }
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
  
  .empty-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  
  .checkbox-row {
    margin-bottom: 10px;
    display: flex;
    gap: 20px;
  }
  
  .generating-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    
    .el-icon {
      font-size: 24px;
      margin-bottom: 15px;
      color: #409EFF;
    }
    
    span {
      color: #606266;
    }
  }
  
  .preview-actions {
    display: flex;
    gap: 10px;
  }
  
  .preview-wrapper {
    height: 100%;
    overflow-y: auto;
    padding: 20px;
  }
  
  .markdown-body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    line-height: 1.6;
    word-wrap: break-word;
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    
    h1 {
      font-size: 2em;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
    }
    
    h2 {
      font-size: 1.5em;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
    }
    
    h3 {
      font-size: 1.25em;
    }
    
    p {
      margin-top: 0;
      margin-bottom: 16px;
    }
    
    ul, ol {
      padding-left: 2em;
      margin-top: 0;
      margin-bottom: 16px;
    }
    
    table {
      display: block;
      width: 100%;
      overflow: auto;
      margin-top: 0;
      margin-bottom: 16px;
      border-spacing: 0;
      border-collapse: collapse;
      
      tr {
        background-color: #fff;
        border-top: 1px solid #c6cbd1;
      }
      
      th, td {
        padding: 6px 13px;
        border: 1px solid #dfe2e5;
      }
      
      th {
        font-weight: 600;
      }
      
      tr:nth-child(2n) {
        background-color: #f6f8fa;
      }
    }
  }
}
</style> 