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
            <el-form-item label="报告标题">
              <el-input v-model="reportConfig.title" placeholder="请输入报告标题"></el-input>
            </el-form-item>
            
            <el-form-item label="报告类型">
              <el-select v-model="reportConfig.reportType" placeholder="请选择报告类型" style="width: 100%;">
                <el-option label="月度销售报告" value="monthly"></el-option>
                <el-option label="季度销售报告" value="quarterly"></el-option>
                <el-option label="年度销售报告" value="yearly"></el-option>
                <el-option label="产品销售分析" value="product"></el-option>
                <el-option label="区域销售分析" value="regional"></el-option>
                <el-option label="客户销售分析" value="customer"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="销售概况">
              <el-input 
                type="textarea" 
                v-model="reportConfig.overview" 
                placeholder="请简述销售业绩和主要亮点"
                :autosize="{ minRows: 3, maxRows: 6 }"
              ></el-input>
            </el-form-item>
            
            <el-form-item label="报告内容选项">
              <el-checkbox-group v-model="reportConfig.sections">
                <div class="checkbox-row">
                  <el-checkbox label="executive_summary">摘要概述</el-checkbox>
                  <el-checkbox label="performance_overview">业绩概览</el-checkbox>
                </div>
                <div class="checkbox-row">
                  <el-checkbox label="product_sales">产品销售</el-checkbox>
                  <el-checkbox label="regional_analysis">区域分析</el-checkbox>
                </div>
                <div class="checkbox-row">
                  <el-checkbox label="customer_insights">客户洞察</el-checkbox>
                  <el-checkbox label="competitive_analysis">竞争分析</el-checkbox>
                </div>
                <div class="checkbox-row">
                  <el-checkbox label="forecast_outlook">预测展望</el-checkbox>
                  <el-checkbox label="action_plan">行动计划</el-checkbox>
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
            
            <el-form-item label="销售目标达成率">
              <el-slider 
                v-model="reportConfig.targetAchievement" 
                :min="0" 
                :max="200"
                :marks="{0: '0%', 50: '50%', 100: '100%', 150: '150%', 200: '200%'}"
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
            <div class="preview-actions" v-if="reportContent">
              <el-button type="text" @click="copyReportContent">
                <el-icon><DocumentCopy /></el-icon> 复制内容
              </el-button>
            </div>
          </div>
          
          <div class="preview-content" v-if="reportContent">
            <div class="report-title">{{ reportConfig.title || '销售报告' }}</div>
            <div class="report-meta">生成时间: {{ currentDateTime }}</div>
            
            <div class="report-body" v-html="reportContent"></div>
          </div>
          
          <div class="empty-preview" v-else>
            <el-empty description="请配置并生成报告">
              <template #image>
                <img src="@/assets/images/report-placeholder.png" alt="空报告" style="height: 180px;">
              </template>
              <template #description>
                <p>完成左侧配置后，点击"生成报告"按钮</p>
              </template>
            </el-empty>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { DocumentCopy, Refresh, Delete, Back } from '@element-plus/icons-vue';

const router = useRouter();

// 报告配置
const reportConfig = reactive({
  title: '',
  reportType: '',
  overview: '',
  sections: ['executive_summary', 'performance_overview', 'product_sales', 'regional_analysis'],
  depth: 'standard',
  targetAchievement: 100,
  additionalInfo: ''
});

// 报告内容
const reportContent = ref('');

// 历史报告
const historyReports = ref([]);
const selectedHistoryIndex = ref(-1);

// 当前日期时间
const currentDateTime = computed(() => {
  const now = new Date();
  return now.toLocaleString('zh-CN');
});

// 是否可以生成报告
const canGenerate = computed(() => {
  return reportConfig.title && reportConfig.reportType;
});

// 返回按钮点击事件
const goBack = () => {
  router.push('/home/AI_writer/AIWriter');
};

// 生成报告
const generateReport = () => {
  if (!canGenerate.value) {
    ElMessage.warning('请至少填写报告标题和报告类型');
    return;
  }
  
  const loading = ElLoading.service({
    lock: true,
    text: '正在生成销售报告...',
    background: 'rgba(255, 255, 255, 0.7)',
  });
  
  // 模拟异步生成报告
  setTimeout(() => {
    reportContent.value = generateSalesReportContent();
    loading.close();
    ElMessage.success('报告生成成功！');
    
    // 保存到历史记录
    saveToHistory();
  }, 2000);
};

// 保存为草稿
const saveAsDraft = () => {
  if (!reportContent.value) {
    ElMessage.warning('请先生成报告内容');
    return;
  }
  
  saveToHistory('草稿');
  ElMessage.success('报告已保存为草稿');
};

// 导出报告
const exportReport = () => {
  if (!reportContent.value) {
    ElMessage.warning('请先生成报告内容');
    return;
  }
  
  // 模拟导出功能
  ElMessage.success('报告已导出');
};

// 复制报告内容
const copyReportContent = () => {
  const contentToCopy = document.querySelector('.report-body').innerText;
  navigator.clipboard.writeText(contentToCopy)
    .then(() => {
      ElMessage.success('报告内容已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动选择并复制');
    });
};

// 加载历史报告
const loadHistoryReports = () => {
  const savedReports = localStorage.getItem('salesHistoryReports');
  if (savedReports) {
    historyReports.value = JSON.parse(savedReports);
  }
};

// 选择历史报告
const selectHistoryReport = (index) => {
  selectedHistoryIndex.value = index;
  const selectedReport = historyReports.value[index];
  
  // 更新表单和内容
  Object.assign(reportConfig, selectedReport.config);
  reportContent.value = selectedReport.content;
  
  ElMessage.success(`已加载"${selectedReport.title}"报告`);
};

// 删除历史报告
const deleteHistoryReport = (index) => {
  ElMessageBox.confirm(
    '确定要删除这份历史报告吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    historyReports.value.splice(index, selectedHistoryIndex);
    localStorage.setItem('salesHistoryReports', JSON.stringify(historyReports.value));
    
    if (selectedHistoryIndex.value === index) {
      selectedHistoryIndex.value = -1;
    } else if (selectedHistoryIndex.value > index) {
      selectedHistoryIndex.value--;
    }
    
    ElMessage.success('历史报告已删除');
  }).catch(() => {});
};

// 保存到历史记录
const saveToHistory = (status = '已完成') => {
  const newHistoryItem = {
    title: reportConfig.title || '未命名报告',
    date: new Date().toLocaleString('zh-CN'),
    status: status,
    config: JSON.parse(JSON.stringify(reportConfig)),
    content: reportContent.value
  };
  
  // 检查是否已有同名报告，如果有则替换
  const existingIndex = historyReports.value.findIndex(item => item.title === newHistoryItem.title);
  if (existingIndex >= 0) {
    historyReports.value[existingIndex] = newHistoryItem;
  } else {
    historyReports.value.unshift(newHistoryItem);
  }
  
  // 只保留最近10份报告
  if (historyReports.value.length > 10) {
    historyReports.value = historyReports.value.slice(0, 10);
  }
  
  // 保存到本地存储
  localStorage.setItem('salesHistoryReports', JSON.stringify(historyReports.value));
};

// 生成销售报告内容
const generateSalesReportContent = () => {
  // 根据配置生成报告内容
  let content = '';
  
  // 执行摘要
  if (reportConfig.sections.includes('executive_summary')) {
    content += `<h2>执行摘要</h2>
    <p>本${getReportTypeName()}涵盖了我们最近期间内的销售业绩表现，总体销售目标达成率为${reportConfig.targetAchievement}%。${reportConfig.overview}</p>`;
  }
  
  // 业绩概览
  if (reportConfig.sections.includes('performance_overview')) {
    content += `<h2>业绩概览</h2>
    <p>在本报告期内，我们实现了总销售额同比增长${Math.round(reportConfig.targetAchievement * 0.8)}%，整体市场份额提升了${Math.round(reportConfig.targetAchievement * 0.1)}个百分点。主要业绩指标如下：</p>
    <ul>
      <li>总销售额：¥ ${(Math.random() * 10000000).toFixed(2)}</li>
      <li>销售量：${Math.round(Math.random() * 100000)} 件</li>
      <li>新客户数：${Math.round(Math.random() * 1000)}</li>
      <li>客单价：¥ ${(Math.random() * 1000).toFixed(2)}</li>
    </ul>`;
  }
  
  // 产品销售
  if (reportConfig.sections.includes('product_sales')) {
    content += `<h2>产品销售分析</h2>
    <p>报告期内，各产品线销售情况如下：</p>
    <table>
      <tr>
        <th>产品线</th>
        <th>销售额</th>
        <th>同比增长</th>
        <th>毛利率</th>
      </tr>
      <tr>
        <td>旗舰产品线</td>
        <td>¥ ${(Math.random() * 5000000).toFixed(2)}</td>
        <td>${(Math.random() * 50).toFixed(1)}%</td>
        <td>${(Math.random() * 60 + 20).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>中端产品线</td>
        <td>¥ ${(Math.random() * 3000000).toFixed(2)}</td>
        <td>${(Math.random() * 40).toFixed(1)}%</td>
        <td>${(Math.random() * 50 + 15).toFixed(1)}%</td>
      </tr>
      <tr>
        <td>入门产品线</td>
        <td>¥ ${(Math.random() * 2000000).toFixed(2)}</td>
        <td>${(Math.random() * 30).toFixed(1)}%</td>
        <td>${(Math.random() * 40 + 10).toFixed(1)}%</td>
      </tr>
    </table>
    <p>我们的旗舰产品线继续保持强劲增长，尤其是在高端市场的表现尤为突出。</p>`;
  }
  
  // 区域分析
  if (reportConfig.sections.includes('regional_analysis')) {
    content += `<h2>区域销售分析</h2>
    <p>从区域角度来看，不同市场的表现呈现差异化：</p>
    <ul>
      <li>华东地区：总销售额 ¥${(Math.random() * 3000000).toFixed(2)}，同比增长 ${(Math.random() * 40).toFixed(1)}%</li>
      <li>华北地区：总销售额 ¥${(Math.random() * 2500000).toFixed(2)}，同比增长 ${(Math.random() * 35).toFixed(1)}%</li>
      <li>华南地区：总销售额 ¥${(Math.random() * 2000000).toFixed(2)}，同比增长 ${(Math.random() * 30).toFixed(1)}%</li>
      <li>西部地区：总销售额 ¥${(Math.random() * 1500000).toFixed(2)}，同比增长 ${(Math.random() * 25).toFixed(1)}%</li>
    </ul>
    <p>华东地区依然是我们的核心市场，贡献了最大的销售份额。西部地区虽然基数较低，但增速迅猛，显示出良好的发展潜力。</p>`;
  }
  
  // 客户洞察
  if (reportConfig.sections.includes('customer_insights')) {
    content += `<h2>客户洞察</h2>
    <p>报告期内客户分析如下：</p>
    <ul>
      <li>老客户贡献率：${(Math.random() * 30 + 60).toFixed(1)}%</li>
      <li>新客户转化率：${(Math.random() * 20 + 10).toFixed(1)}%</li>
      <li>客户满意度：${(Math.random() * 10 + 85).toFixed(1)}%</li>
      <li>NPS净推荐值：${(Math.random() * 30 + 40).toFixed(1)}</li>
    </ul>
    <p>客户留存率呈现稳步提升，尤其是高价值客户群体的忠诚度有明显提高。通过深入的客户反馈分析，我们发现产品质量和售后服务是客户最为关注的两个因素。</p>`;
  }
  
  // 竞争分析
  if (reportConfig.sections.includes('competitive_analysis')) {
    content += `<h2>竞争分析</h2>
    <p>行业竞争格局有以下变化：</p>
    <ul>
      <li>我司市场份额：${(Math.random() * 20 + 20).toFixed(1)}%（${(Math.random() * 5).toFixed(1)}%）</li>
      <li>主要竞争对手A：${(Math.random() * 15 + 15).toFixed(1)}%（${(Math.random() * 3).toFixed(1)}%）</li>
      <li>主要竞争对手B：${(Math.random() * 10 + 15).toFixed(1)}%（${(Math.random() * 2).toFixed(1)}%）</li>
      <li>其他竞争对手：${(Math.random() * 40 + 30).toFixed(1)}%（${(Math.random() * -3).toFixed(1)}%）</li>
    </ul>
    <p>注：括号内为同比变化百分点</p>
    <p>报告期内，我们通过产品创新和营销策略调整，成功抢占了更多市场份额。主要竞争对手A在中端市场发力，对我们构成一定挑战。</p>`;
  }
  
  // 预测展望
  if (reportConfig.sections.includes('forecast_outlook')) {
    content += `<h2>预测与展望</h2>
    <p>基于当前市场趋势和内部数据分析，我们对下一期的销售预测如下：</p>
    <ul>
      <li>预计销售增长：${(Math.random() * 15 + 10).toFixed(1)}%</li>
      <li>重点增长产品线：${reportConfig.targetAchievement > 100 ? '旗舰产品线和中端产品线' : '中端产品线和入门产品线'}</li>
      <li>增长最快区域：${reportConfig.targetAchievement > 100 ? '华东和西部地区' : '华北和华南地区'}</li>
    </ul>
    <p>市场预计将持续${reportConfig.targetAchievement > 100 ? '稳步增长' : '面临一定挑战'}，我们将根据市场变化及时调整销售策略。</p>`;
  }
  
  // 行动计划
  if (reportConfig.sections.includes('action_plan')) {
    content += `<h2>行动计划</h2>
    <p>为达成下期销售目标，我们制定了以下行动计划：</p>
    <ol>
      <li>加强销售团队培训，提升专业水平和成交能力</li>
      <li>优化产品组合，针对不同客户群体开发差异化营销方案</li>
      <li>深化渠道合作，扩大市场覆盖面</li>
      <li>加强数字化营销，提升获客效率</li>
      <li>改进客户服务流程，提高客户满意度和复购率</li>
    </ol>
    <p>我们将定期追踪以上行动计划的执行情况，确保销售目标的达成。</p>`;
  }
  
  // 添加补充信息
  if (reportConfig.additionalInfo) {
    content += `<h2>补充说明</h2>
    <p>${reportConfig.additionalInfo}</p>`;
  }
  
  return content;
};

// 获取报告类型名称
const getReportTypeName = () => {
  const typeMap = {
    'monthly': '月度销售报告',
    'quarterly': '季度销售报告',
    'yearly': '年度销售报告',
    'product': '产品销售分析报告',
    'regional': '区域销售分析报告',
    'customer': '客户销售分析报告'
  };
  return typeMap[reportConfig.reportType] || '销售报告';
};

// 初始化加载历史报告
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
      
      h2 {
        font-size: 18px;
        margin-top: 25px;
        margin-bottom: 15px;
        color: #303133;
        border-bottom: 1px solid #ebeef5;
        padding-bottom: 8px;
      }
      
      p {
        margin: 10px 0;
        line-height: 1.6;
      }
      
      ul, ol {
        padding-left: 20px;
        margin: 10px 0;
        
        li {
          margin-bottom: 5px;
        }
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
}
</style> 