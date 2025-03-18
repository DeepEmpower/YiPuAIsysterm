<template>
  <div class="product-planning-container">
    <!-- 顶部标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>产品策划编写助手</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="generateReport" :loading="isGenerating">
          生成策划
        </el-button>
        <el-button type="success" @click="saveReport" :disabled="!reportContent">
          保存结果
        </el-button>
        <el-dropdown @command="handleExport" :disabled="!reportContent">
          <el-button type="warning">
            导出策划<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="word">导出为Word</el-dropdown-item>
              <el-dropdown-item command="markdown">导出为Markdown</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 导出格式选择弹窗 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="选择导出格式"
      width="30%"
      :close-on-click-modal="false"
    >
      <div class="export-options">
        <el-radio-group v-model="exportFormat">
          <el-radio label="word">Word文档 (.docx)</el-radio>
          <el-radio label="pdf">PDF文档 (.pdf)</el-radio>
          <el-radio label="markdown">Markdown文档 (.md)</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleExport" :loading="exporting">
            确认导出
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 主内容区域 - 左右两栏结构 -->
    <div class="content-wrapper">
      <!-- 左侧栏：配置区域和历史报告 -->
      <div class="left-column">
        <!-- 配置区域 -->
        <div class="config-section">
          <div class="section-title">
            <h3>策划配置</h3>
          </div>
          
          <el-form :model="reportConfig" label-position="top">
            <el-form-item label="产品名称">
              <el-input v-model="reportConfig.productName" placeholder="请输入产品名称"></el-input>
            </el-form-item>
            
            <el-form-item label="产品类型">
              <el-select v-model="reportConfig.productType" placeholder="请选择产品类型" style="width: 100%;">
                <el-option label="软件应用" value="software"></el-option>
                <el-option label="硬件设备" value="hardware"></el-option>
                <el-option label="消费品" value="consumer"></el-option>
                <el-option label="服务产品" value="service"></el-option>
                <el-option label="内容产品" value="content"></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="产品定位">
              <el-input 
                type="textarea" 
                v-model="reportConfig.positioning" 
                placeholder="请简述产品定位和目标用户"
                :autosize="{ minRows: 3, maxRows: 6 }"
              ></el-input>
            </el-form-item>
            
            <el-form-item label="策划内容选项">
              <el-checkbox-group v-model="reportConfig.sections">
                <div class="checkbox-row">
                  <el-checkbox label="strategic_positioning">战略定位</el-checkbox>
                  <el-checkbox label="market_defense">市场攻防体系</el-checkbox>
                </div>
                <div class="checkbox-row">
                  <el-checkbox label="technical_path">技术实现路径</el-checkbox>
                  <el-checkbox label="business_validation">商业验证模型</el-checkbox>
                </div>
                <div class="checkbox-row">
                  <el-checkbox label="risk_control">风险控制矩阵</el-checkbox>
                  <el-checkbox label="tactical_execution">战术执行蓝图</el-checkbox>
                </div>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="策划深度">
              <el-radio-group v-model="reportConfig.depth">
                <el-radio-button label="brief">简要</el-radio-button>
                <el-radio-button label="standard">标准</el-radio-button>
                <el-radio-button label="detailed">详细</el-radio-button>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="预期开发周期（月）">
              <el-slider 
                v-model="reportConfig.developmentTime" 
                :min="1" 
                :max="24"
                :marks="{1: '1', 6: '6', 12: '12', 18: '18', 24: '24'}"
              ></el-slider>
            </el-form-item>
            
            <el-form-item label="补充信息">
              <el-input 
                type="textarea" 
                v-model="reportConfig.additionalInfo" 
                placeholder="请输入任何其他需要包含在策划中的信息"
                :autosize="{ minRows: 3, maxRows: 6 }"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 历史报告区移到左侧栏底部 -->
        <div class="history-section">
          <div class="section-title">
            <h3>历史策划</h3>
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
                <el-empty description="暂无历史策划" :image-size="60" />
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
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { DocumentCopy, Refresh, Delete, ArrowLeft, ArrowDown } from '@element-plus/icons-vue';
import { useProductPlanning } from '@/api/productPlanning';
import { exportToWord } from '@/api/docExport';
import { marked } from 'marked';

const router = useRouter();

// 使用产品策划API
const { state: planningState, generatePlanning: apiGeneratePlanning, stopGeneration } = useProductPlanning();

// 报告配置
const reportConfig = ref({
  productName: '',
  productType: 'software',
  positioning: '',
  sections: ['strategic_positioning', 'market_defense', 'technical_path', 'business_validation', 'risk_control', 'tactical_execution'],
  depth: 'standard',
  developmentTime: 6,
  additionalInfo: ''
});

// 章节选项
const sectionOptions = [
  { label: '战略定位', value: 'strategic_positioning' },
  { label: '市场攻防体系', value: 'market_defense' },
  { label: '技术实现路径', value: 'technical_path' },
  { label: '商业验证模型', value: 'business_validation' },
  { label: '风险控制矩阵', value: 'risk_control' },
  { label: '战术执行蓝图', value: 'tactical_execution' }
];

// 报告内容
const reportContent = computed(() => planningState.value.content);

// 是否正在生成报告
const isGenerating = computed(() => planningState.value.isGenerating);

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
  return reportConfig.value.productName.trim() !== '' && 
         reportConfig.value.positioning.trim() !== '' &&
         !isGenerating.value;
});

// 返回上一页
const goBack = () => {
  router.push('/home/AI_writer/AIWriter');
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
    ElMessage.warning('请填写产品名称和产品定位');
    return;
  }
  
  // 调用API生成报告
  apiGeneratePlanning({
    productName: reportConfig.value.productName,
    productType: reportConfig.value.productType,
    productPosition: reportConfig.value.positioning
  });
  
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
    title: reportConfig.value.productName,
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
  const reportTitle = `${reportConfig.value.productName}产品策划方案`;
  
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
  planningState.value.content = '这是从服务器加载的历史报告内容示例。实际实现中，这里会加载真实的历史报告内容。';
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
      planningState.value.content = '';
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

// 导出功能
const handleExport = async (type: string) => {
  if (!reportContent.value) {
    ElMessage.warning('没有可导出的内容')
    return
  }

  const title = `${reportConfig.value.productName}产品策划方案`
  const content = reportContent.value

  try {
    if (type === 'word') {
      // 导出为Word文档
      await exportToWord(title, content, title)
      ElMessage.success('导出Word文档成功')
    } else {
      // 导出为Markdown文件
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title}.md`
      link.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出Markdown文件成功')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}
</script>

<style scoped lang="scss">
.product-planning-container {
  padding: 0;
  background-color: #f0f2f5;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .page-header {
    padding: 10px 20px;
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e4e7ed;
    
    .header-left {
      display: flex;
      align-items: center;
      font-size: 14px;
      
      h2 {
        font-weight: 600;
        color: #303133;
        margin-left: 10px;
      }
    }
    
    .header-right {
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
}
</style> 