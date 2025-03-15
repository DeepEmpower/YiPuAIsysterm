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
            <div class="preview-actions" v-if="reportContent">
              <el-button type="text" @click="copyReportContent">
                <el-icon><DocumentCopy /></el-icon> 复制内容
              </el-button>
            </div>
          </div>
          
          <div class="preview-content" v-if="reportContent">
            <div class="report-title">{{ reportConfig.projectName || '项目' }}可行性研究报告</div>
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

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { DocumentCopy, Refresh, Delete, Back } from '@element-plus/icons-vue';

const router = useRouter();

// 报告配置
const reportConfig = ref({
  projectName: '',
  projectType: 'product',
  background: '',
  sections: ['executive_summary', 'market_analysis', 'financial_analysis', 'conclusion'],
  depth: 'standard',
  budget: [100, 500],
  additionalInfo: ''
});

// 报告内容
const reportContent = ref('');
const selectedHistoryIndex = ref(-1);
const historyReports = ref([]);

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
  return reportConfig.value.projectName && reportConfig.value.background;
});

// 返回上一页
const goBack = () => {
  router.back();
};

// 生成报告
const generateReport = () => {
  if (!canGenerate.value) {
    ElMessage.warning('请至少填写项目名称和项目背景');
    return;
  }
  
  const loading = ElLoading.service({
    lock: true,
    text: '正在生成报告...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  
  // 模拟生成报告的API调用
  setTimeout(() => {
    reportContent.value = generateMockReport();
    loading.close();
    ElMessage.success('报告生成成功！');
    
    // 将生成的报告添加到历史记录
    saveReportToHistory();
  }, 2000);
};

// 模拟生成报告内容
const generateMockReport = () => {
  // 这里可以根据reportConfig的配置生成对应的报告内容
  // 这里只是示例内容
  return `
    <h2>执行摘要</h2>
    <p>本报告旨在评估"${reportConfig.value.projectName}"项目的可行性。通过对市场、技术、财务和风险等方面的分析，
    我们认为该项目具有良好的投资价值和市场前景。预计该项目的投资回报率约为15%，回收期约为3年。</p>
    
    ${reportConfig.value.sections.includes('market_analysis') ? `
    <h2>市场分析</h2>
    <p>当前市场规模约为${Math.round(Math.random() * 1000)}亿元，年增长率约为${Math.round(Math.random() * 20)}%。
    主要竞争对手包括A公司、B公司和C公司，市场集中度约为${Math.round(Math.random() * 60 + 30)}%。</p>
    <p>目标用户群体主要分布在一线和二线城市，年龄段为25-45岁，有较强的消费能力和消费意愿。</p>
    <p>通过SWOT分析，该项目的优势在于技术创新和成本控制，劣势在于品牌知名度不足，机会在于市场需求增长，
    威胁在于竞争对手的快速跟进和政策变动。</p>
    ` : ''}
    
    ${reportConfig.value.sections.includes('technical_analysis') ? `
    <h2>技术可行性分析</h2>
    <p>本项目采用的核心技术已经过验证，技术成熟度高，实现难度适中。项目开发周期预计为${Math.round(Math.random() * 6 + 6)}个月，
    需要的技术团队规模约为${Math.round(Math.random() * 10 + 5)}人。</p>
    <p>关键技术风险点包括：系统稳定性、数据安全性和扩展性。针对这些风险点，我们已制定相应的应对策略。</p>
    ` : ''}
    
    ${reportConfig.value.sections.includes('financial_analysis') ? `
    <h2>财务分析</h2>
    <p>项目总投资预计在${reportConfig.value.budget[0]}-${reportConfig.value.budget[1]}万元之间，
    其中固定资产投资约占${Math.round(Math.random() * 30 + 20)}%，研发投入约占${Math.round(Math.random() * 30 + 20)}%，
    营销和运营成本约占${Math.round(Math.random() * 30 + 20)}%。</p>
    <p>财务测算显示，项目静态投资回收期约为${Math.round(Math.random() * 2 + 2)}年，动态投资回收期约为
    ${Math.round(Math.random() * 2 + 3)}年，内部收益率约为${Math.round(Math.random() * 10 + 10)}%。</p>
    <table>
      <tr>
        <th>年度</th>
        <th>收入(万元)</th>
        <th>成本(万元)</th>
        <th>利润(万元)</th>
      </tr>
      <tr>
        <td>第一年</td>
        <td>${Math.round(reportConfig.value.budget[1] * 0.4)}</td>
        <td>${Math.round(reportConfig.value.budget[1] * 0.6)}</td>
        <td>${Math.round(reportConfig.value.budget[1] * 0.4 - reportConfig.value.budget[1] * 0.6)}</td>
      </tr>
      <tr>
        <td>第二年</td>
        <td>${Math.round(reportConfig.value.budget[1] * 0.8)}</td>
        <td>${Math.round(reportConfig.value.budget[1] * 0.5)}</td>
        <td>${Math.round(reportConfig.value.budget[1] * 0.8 - reportConfig.value.budget[1] * 0.5)}</td>
      </tr>
      <tr>
        <td>第三年</td>
        <td>${Math.round(reportConfig.value.budget[1] * 1.2)}</td>
        <td>${Math.round(reportConfig.value.budget[1] * 0.5)}</td>
        <td>${Math.round(reportConfig.value.budget[1] * 1.2 - reportConfig.value.budget[1] * 0.5)}</td>
      </tr>
    </table>
    ` : ''}
    
    ${reportConfig.value.sections.includes('risk_analysis') ? `
    <h2>风险分析</h2>
    <p>项目主要风险包括：市场风险、技术风险、财务风险和政策风险。</p>
    <ul>
      <li><strong>市场风险</strong>：竞争加剧导致市场份额下降</li>
      <li><strong>技术风险</strong>：核心技术实现难度高于预期</li>
      <li><strong>财务风险</strong>：投资回报低于预期</li>
      <li><strong>政策风险</strong>：行业政策变动影响项目实施</li>
    </ul>
    <p>针对上述风险，已制定详细的风险防范和应对措施。</p>
    ` : ''}
    
    ${reportConfig.value.sections.includes('implementation_plan') ? `
    <h2>实施计划</h2>
    <p>项目实施分为前期准备、开发实施、测试验收和市场推广四个阶段，总周期约为${Math.round(Math.random() * 6 + 6)}个月。</p>
    <p>关键里程碑：</p>
    <ul>
      <li>项目立项和团队组建：1个月</li>
      <li>核心功能开发：3个月</li>
      <li>系统测试和优化：2个月</li>
      <li>市场推广和运营：持续进行</li>
    </ul>
    ` : ''}
    
    ${reportConfig.value.sections.includes('conclusion') ? `
    <h2>结论与建议</h2>
    <p>综合考虑市场、技术、财务和风险等方面，本项目具有较高的可行性和较好的投资价值。</p>
    <p>我们建议：</p>
    <ol>
      <li>推进项目实施，优先确保核心技术的研发和应用</li>
      <li>密切关注市场动态，及时调整产品定位和营销策略</li>
      <li>分阶段投入，根据市场反馈调整后续投资计划</li>
      <li>加强风险管控，特别是技术风险和市场风险</li>
    </ol>
    ` : ''}
    
    ${reportConfig.value.additionalInfo ? `
    <h2>补充信息</h2>
    <p>${reportConfig.value.additionalInfo}</p>
    ` : ''}
    
    ${reportConfig.value.sections.includes('appendix') ? `
    <h2>附录</h2>
    <p>附录A：市场调研数据</p>
    <p>附录B：技术规范文档</p>
    <p>附录C：财务测算详情</p>
    ` : ''}
  `;
};

// 保存报告到历史记录
const saveReportToHistory = () => {
  const newReport = {
    id: Date.now().toString(),
    title: `${reportConfig.value.projectName}可行性研究报告`,
    date: currentDateTime.value,
    config: JSON.parse(JSON.stringify(reportConfig.value)),
    content: reportContent.value
  };
  
  historyReports.value.unshift(newReport);
  saveHistoryReportsToStorage();
  selectedHistoryIndex.value = 0;
};

// 保存报告到本地存储
const saveHistoryReportsToStorage = () => {
  localStorage.setItem('feasibilityReports', JSON.stringify(historyReports.value));
};

// 从本地存储加载历史报告
const loadHistoryReports = () => {
  const saved = localStorage.getItem('feasibilityReports');
  if (saved) {
    try {
      historyReports.value = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse history reports from storage', e);
      historyReports.value = [];
    }
  }
};

// 选择历史报告
const selectHistoryReport = (index) => {
  selectedHistoryIndex.value = index;
  const report = historyReports.value[index];
  
  reportConfig.value = { ...report.config };
  reportContent.value = report.content;
};

// 删除历史报告
const deleteHistoryReport = (index) => {
  ElMessageBox.confirm(
    '确定要删除这个历史报告吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    historyReports.value.splice(index, 1);
    saveHistoryReportsToStorage();
    
    if (selectedHistoryIndex.value === index) {
      // 如果删除的是当前选中的，则清空选中状态
      selectedHistoryIndex.value = -1;
      reportContent.value = '';
    } else if (selectedHistoryIndex.value > index) {
      // 如果删除的是当前选中之前的，则索引减1
      selectedHistoryIndex.value--;
    }
    
    ElMessage.success('历史报告已删除');
  }).catch(() => {
    // 用户取消删除
  });
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

// 保存为草稿
const saveAsDraft = () => {
  const draftData = {
    config: reportConfig.value,
    content: reportContent.value,
    timestamp: Date.now()
  };
  
  localStorage.setItem('feasibilityReportDraft', JSON.stringify(draftData));
  ElMessage.success('草稿保存成功');
};

// 导出报告
const exportReport = () => {
  ElMessage.success('报告已导出');
  // 实际项目中可以实现为导出PDF或Word文档
};

// 加载草稿
const loadDraft = () => {
  const draftData = localStorage.getItem('feasibilityReportDraft');
  if (draftData) {
    try {
      const draft = JSON.parse(draftData);
      // 确认是否加载草稿
      ElMessageBox.confirm(
        '检测到未完成的草稿，是否加载？',
        '加载草稿',
        {
          confirmButtonText: '加载',
          cancelButtonText: '不加载',
          type: 'info',
        }
      ).then(() => {
        reportConfig.value = draft.config;
        if (draft.content) {
          reportContent.value = draft.content;
        }
        ElMessage.success('草稿加载成功');
      }).catch(() => {
        // 用户选择不加载草稿
      });
    } catch (e) {
      console.error('Failed to parse draft data', e);
    }
  }
};

// 组件挂载时执行
onMounted(() => {
  loadHistoryReports();
  loadDraft();
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