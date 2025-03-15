<template>
  <div class="product-planning-container">
    <!-- 顶部标题和操作栏 -->
    <div class="header-section">
      <div class="title-area">
        <div class="title-text">
          <el-icon><Back /></el-icon>
          <a href="#" @click.prevent="goBack">返回AI文员团队</a>
          <span class="divider">|</span>
          <span class="page-title">产品策划编写</span>
        </div>
      </div>
      <div class="action-area">
        <el-button type="primary" @click="generateReport" :disabled="!canGenerate">生成策划</el-button>
        <el-button @click="saveAsDraft" :disabled="!reportContent">保存草稿</el-button>
        <el-button type="success" @click="exportReport" :disabled="!reportContent">导出策划</el-button>
      </div>
    </div>

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
                  <el-checkbox label="executive_summary">执行摘要</el-checkbox>
                  <el-checkbox label="market_analysis">市场分析</el-checkbox>
                </div>
                <div class="checkbox-row">
                  <el-checkbox label="product_features">产品功能</el-checkbox>
                  <el-checkbox label="user_analysis">用户分析</el-checkbox>
                </div>
                <div class="checkbox-row">
                  <el-checkbox label="competitor_analysis">竞品分析</el-checkbox>
                  <el-checkbox label="marketing_strategy">营销策略</el-checkbox>
                </div>
                <div class="checkbox-row">
                  <el-checkbox label="resource_planning">资源规划</el-checkbox>
                  <el-checkbox label="risk_analysis">风险分析</el-checkbox>
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
        <div class="preview-section">
          <div class="section-title">
            <h3>策划预览</h3>
            <div class="preview-actions" v-if="reportContent">
              <el-button type="text" @click="copyReportContent">
                <el-icon><DocumentCopy /></el-icon> 复制内容
              </el-button>
            </div>
          </div>
          
          <div class="preview-content" v-if="reportContent">
            <div class="report-title">{{ reportConfig.productName || '产品' }}策划方案</div>
            <div class="report-meta">生成时间: {{ currentDateTime }}</div>
            
            <div class="report-body" v-html="reportContent"></div>
          </div>
          
          <div class="empty-preview" v-else>
            <el-empty description="请配置并生成策划">
              <template #image>
                <img src="@/assets/images/report-placeholder.png" alt="空策划" style="height: 180px;">
              </template>
              <template #description>
                <p>完成左侧配置后，点击"生成策划"按钮</p>
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
  productName: '',
  productType: '',
  positioning: '',
  sections: ['executive_summary', 'market_analysis', 'product_features', 'competitor_analysis'],
  depth: 'standard',
  developmentTime: 6,
  additionalInfo: ''
});

// 报告内容
const reportContent = ref('');

// 历史报告
const historyReports = ref([]);
const selectedHistoryIndex = ref(-1);

// 计算当前时间
const currentDateTime = computed(() => {
  const now = new Date();
  return now.toLocaleString('zh-CN');
});

// 判断是否可以生成报告
const canGenerate = computed(() => {
  return reportConfig.productName && reportConfig.productType;
});

// 页面加载时获取历史报告
onMounted(() => {
  loadHistoryReports();
});

// 返回AI文员团队页面
const goBack = () => {
  router.push('/home/AI_writer/AIWriter');
};

// 生成报告
const generateReport = () => {
  if (!canGenerate.value) {
    ElMessage.warning('请至少填写产品名称和产品类型');
    return;
  }

  const loading = ElLoading.service({
    lock: true,
    text: '正在生成策划...',
    background: 'rgba(0, 0, 0, 0.7)',
  });

  // 模拟生成报告的过程
  setTimeout(() => {
    // 根据配置生成相应的报告内容
    let content = `<h2>1. 执行摘要</h2>
      <p>本策划方案旨在详细阐述${reportConfig.productName}的产品定位、功能特性、市场分析和开发规划。通过深入的用户需求分析和竞品研究，我们提出了一套完整的产品开发和营销策略，预计在${reportConfig.developmentTime}个月内完成开发并推向市场。</p>
      
      <h2>2. 产品概述</h2>
      <p>${reportConfig.productName}是一款${getProductTypeText()}，主要定位于${reportConfig.positioning || '满足用户特定需求的创新产品'}。</p>
      
      <h2>3. 市场分析</h2>
      <p>当前市场环境对此类产品的需求呈现稳定增长态势。根据最新市场调研数据，预计未来3年内，此类产品市场规模将保持年均15%的增长率。目标用户主要集中在25-45岁的城市白领群体，对产品的便捷性和创新性有较高要求。</p>
      
      <h2>4. 用户分析</h2>
      <p>目标用户画像：
        <ul>
          <li>年龄：25-45岁</li>
          <li>职业：以企业白领、创意工作者为主</li>
          <li>特点：注重效率，追求创新，愿意为高品质产品支付溢价</li>
          <li>痛点：现有产品无法满足的特定需求，包括${generateRandomPainPoints()}</li>
        </ul>
      </p>
      
      <h2>5. 产品功能与特性</h2>
      <p>核心功能：
        <ul>
          <li>功能一：高效的用户界面设计，简化操作流程</li>
          <li>功能二：智能算法支持，提供个性化推荐</li>
          <li>功能三：云端数据同步，确保多设备使用一致性</li>
          <li>功能四：安全加密技术，保障用户数据安全</li>
        </ul>
      </p>
      
      <h2>6. 竞品分析</h2>
      <table>
        <tr>
          <th>竞品名称</th>
          <th>优势</th>
          <th>劣势</th>
          <th>市场份额</th>
        </tr>
        <tr>
          <td>竞品A</td>
          <td>用户基础大，品牌知名度高</td>
          <td>功能单一，创新不足</td>
          <td>35%</td>
        </tr>
        <tr>
          <td>竞品B</td>
          <td>技术领先，性能稳定</td>
          <td>价格偏高，用户体验一般</td>
          <td>25%</td>
        </tr>
        <tr>
          <td>竞品C</td>
          <td>价格优势，渠道铺设广</td>
          <td>质量不稳定，售后服务差</td>
          <td>20%</td>
        </tr>
      </table>`;

    if (reportConfig.sections.includes('marketing_strategy')) {
      content += `
        <h2>7. 营销策略</h2>
        <p>
          <strong>品牌定位：</strong>定位为创新、高效、专业的行业领导者。<br>
          <strong>推广渠道：</strong>
          <ul>
            <li>线上：社交媒体广告、KOL合作、内容营销</li>
            <li>线下：行业展会、用户体验活动、媒体发布会</li>
          </ul>
          <strong>定价策略：</strong>采用价值导向定价，并提供不同层级的产品版本，满足不同用户需求。<br>
          <strong>促销活动：</strong>首发折扣、会员专享、节日特惠等多种促销手段结合使用。
        </p>`;
    }

    if (reportConfig.sections.includes('resource_planning')) {
      content += `
        <h2>8. 资源规划</h2>
        <p>
          <strong>研发团队：</strong>产品经理1名，UI/UX设计师2名，前端开发3名，后端开发4名，测试工程师2名。<br>
          <strong>开发周期：</strong>预计${reportConfig.developmentTime}个月，分为需求分析、设计、开发、测试、发布五个阶段。<br>
          <strong>预算规划：</strong>研发投入约占总预算的60%，营销推广占30%，运营维护占10%。<br>
        </p>`;
    }

    if (reportConfig.sections.includes('risk_analysis')) {
      content += `
        <h2>9. 风险分析与应对</h2>
        <p>
          <strong>市场风险：</strong>市场需求变化快，竞争激烈。应对策略是加强市场调研，灵活调整产品策略。<br>
          <strong>技术风险：</strong>技术实现难度大，可能面临延期。应对策略是合理规划开发周期，适当引入成熟技术框架。<br>
          <strong>财务风险：</strong>前期投入大，回收周期长。应对策略是分阶段投入，及时评估阶段性成果。<br>
          <strong>运营风险：</strong>用户获取成本高，留存率不稳定。应对策略是优化用户体验，增强产品粘性。<br>
        </p>`;
    }
    
    // 根据深度调整内容详细程度
    if (reportConfig.depth === 'brief') {
      // 简化内容
      content = content.replace(/<ul>[\s\S]*?<\/ul>/g, '略');
      content = content.replace(/<table>[\s\S]*?<\/table>/g, '<p>主要竞品包括竞品A、竞品B和竞品C，我们的产品在功能和用户体验方面具有明显优势。</p>');
    } else if (reportConfig.depth === 'detailed') {
      // 增加更详细的内容
      content += `
      <h2>10. 未来发展规划</h2>
      <p>
        <strong>短期目标（1年内）：</strong>完成产品开发并上线，获取初始用户群体，建立品牌影响力。<br>
        <strong>中期目标（1-3年）：</strong>扩大市场份额，丰富产品线，优化用户体验，实现盈利。<br>
        <strong>长期目标（3年以上）：</strong>成为行业领导者，建立完整的产品生态系统，探索国际市场。<br>
      </p>
      
      <h2>11. 指标与评估</h2>
      <p>
        <strong>关键绩效指标：</strong>
        <ul>
          <li>用户增长率：月均增长不低于15%</li>
          <li>用户留存率：30天留存率不低于40%</li>
          <li>用户满意度：评分不低于4.5/5</li>
          <li>转化率：免费用户转付费率不低于5%</li>
        </ul>
        <strong>评估方法：</strong>定期用户调研、数据分析、竞品对比、财务审计等。
      </p>`;
    }

    // 加入补充信息
    if (reportConfig.additionalInfo) {
      content += `
      <h2>附录: 补充信息</h2>
      <p>${reportConfig.additionalInfo}</p>`;
    }

    reportContent.value = content;
    loading.close();
    
    // 自动保存到历史记录
    saveToHistory();
    
    ElMessage.success('策划生成成功！');
  }, 2000);
};

// 保存报告到历史记录
const saveToHistory = () => {
  const newHistory = {
    title: `${reportConfig.productName || '未命名产品'}策划方案`,
    date: currentDateTime.value,
    content: reportContent.value,
    config: JSON.parse(JSON.stringify(reportConfig))
  };
  
  historyReports.value.unshift(newHistory);
  // 保存到本地存储
  localStorage.setItem('productPlanningHistory', JSON.stringify(historyReports.value));
  ElMessage.success('已保存到历史记录');
};

// 保存为草稿
const saveAsDraft = () => {
  if (!reportContent.value) {
    ElMessage.warning('没有内容可保存');
    return;
  }
  
  ElMessageBox.prompt('请输入草稿名称', '保存草稿', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: `${reportConfig.productName || '未命名产品'}策划方案`,
    inputPattern: /\S+/,
    inputErrorMessage: '名称不能为空'
  }).then(({ value }) => {
    const newDraft = {
      title: value,
      date: currentDateTime.value,
      content: reportContent.value,
      config: JSON.parse(JSON.stringify(reportConfig)),
      isDraft: true
    };
    
    historyReports.value.unshift(newDraft);
    localStorage.setItem('productPlanningHistory', JSON.stringify(historyReports.value));
    ElMessage.success(`已保存草稿"${value}"`);
  }).catch(() => {
    // 用户取消
  });
};

// 导出报告
const exportReport = () => {
  if (!reportContent.value) {
    ElMessage.warning('没有内容可导出');
    return;
  }
  
  ElMessage.success('策划已导出');
  // 这里可以添加实际的导出逻辑，如转为PDF或Word文档
};

// 复制报告内容
const copyReportContent = () => {
  // 创建一个不可见的文本区域
  const textArea = document.createElement('textarea');
  // 移除HTML标签
  const plainText = reportContent.value.replace(/<[^>]*>/g, '');
  textArea.value = plainText;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  
  ElMessage.success('内容已复制到剪贴板');
};

// 加载历史报告
const loadHistoryReports = () => {
  const savedHistory = localStorage.getItem('productPlanningHistory');
  if (savedHistory) {
    historyReports.value = JSON.parse(savedHistory);
  }
};

// 选择历史报告
const selectHistoryReport = (index) => {
  selectedHistoryIndex.value = index;
  const selected = historyReports.value[index];
  
  // 恢复配置和内容
  Object.assign(reportConfig, selected.config);
  reportContent.value = selected.content;
  
  ElMessage.success(`已加载"${selected.title}"`);
};

// 删除历史报告
const deleteHistoryReport = (index) => {
  ElMessageBox.confirm('确定要删除这条历史记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    historyReports.value.splice(index, 1);
    localStorage.setItem('productPlanningHistory', JSON.stringify(historyReports.value));
    
    if (selectedHistoryIndex.value === index) {
      selectedHistoryIndex.value = -1;
      reportContent.value = '';
    } else if (selectedHistoryIndex.value > index) {
      selectedHistoryIndex.value--;
    }
    
    ElMessage.success('已删除历史记录');
  }).catch(() => {
    // 用户取消
  });
};

// 获取产品类型文本
const getProductTypeText = () => {
  const typeMap = {
    software: '软件应用',
    hardware: '硬件设备',
    consumer: '消费品',
    service: '服务产品',
    content: '内容产品',
    other: '其他类型产品'
  };
  
  return typeMap[reportConfig.productType] || '创新产品';
};

// 生成随机痛点（演示用）
const generateRandomPainPoints = () => {
  const painPoints = [
    '操作复杂、学习成本高',
    '功能单一、缺乏个性化',
    '性能不稳定、卡顿严重',
    '数据同步困难、协作效率低',
    '价格过高、性价比不足'
  ];
  
  // 随机选择2-3个痛点
  const count = Math.floor(Math.random() * 2) + 2;
  const selected = [];
  
  while (selected.length < count) {
    const index = Math.floor(Math.random() * painPoints.length);
    if (!selected.includes(painPoints[index])) {
      selected.push(painPoints[index]);
    }
  }
  
  return selected.join('、');
};
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