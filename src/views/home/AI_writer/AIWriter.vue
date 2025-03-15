<template>
  <div class="ai-writer-container">
    <div class="ai-team-header">
      <h2>我的AI文员团队</h2>
    </div>

    <!-- 标签分类 -->
    <div class="team-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="文档编写" name="document"></el-tab-pane>
        <el-tab-pane label="内容生成" name="content"></el-tab-pane>
        <el-tab-pane label="审核校对" name="review"></el-tab-pane>
        <el-tab-pane label="格式排版" name="format"></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 当前分类标题 -->
    <div class="category-title" v-if="activeTab !== 'all'">
      {{ getCategoryTitle() }}
    </div>

    <!-- AI文员卡片列表 -->
    <div class="ai-cards-container">
      <!-- 文档编写 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'document'" @click="openAssistant('meeting')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar1.png" alt="会议纪要助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">会议纪要助手</h3>
          <p class="assistant-desc">30秒自动整理会议记录，快速生成规范会议纪要，突出重点决议与行动项。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">93%</span></span>
            <span class="stat-item">提效 <span class="highlight">8.5倍</span></span>
          </div>
        </div>
      </div>

      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'document'" @click="openAssistant('report')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar2.png" alt="工作报告助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">工作报告助手</h3>
          <p class="assistant-desc">2分钟完成日报、周报、月报生成，数据可视化呈现，一键生成专业报告。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">89%</span></span>
            <span class="stat-item">提效 <span class="highlight">7.2倍</span></span>
          </div>
        </div>
      </div>

      <!-- 内容生成 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'content'" @click="openAssistant('proposal')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar3.png" alt="方案撰写助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">方案撰写助手</h3>
          <p class="assistant-desc">3分钟输出完整项目方案，包含目标、计划、预算和风险评估，专业水准一键生成。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">92%</span></span>
            <span class="stat-item">提效 <span class="highlight">11.5倍</span></span>
          </div>
        </div>
      </div>

      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'content'" @click="openAssistant('notice')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar4.png" alt="公告通知助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">公告通知助手</h3>
          <p class="assistant-desc">1分钟生成企业通知、公告、邮件，语言规范专业，满足各类正式场合需求。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">86%</span></span>
            <span class="stat-item">提效 <span class="highlight">6.8倍</span></span>
          </div>
        </div>
      </div>

      <!-- 审核校对 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'review'" @click="openAssistant('proofread')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar5.png" alt="文档校对助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">文档校对助手</h3>
          <p class="assistant-desc">30秒检查3000字文档，精准识别错别字、语法错误和表达不畅，提供专业修改建议。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">94%</span></span>
            <span class="stat-item">提效 <span class="highlight">16倍</span></span>
          </div>
        </div>
      </div>

      <!-- 格式排版 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'format'" @click="openAssistant('format')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar6.png" alt="排版美化助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">排版美化助手</h3>
          <p class="assistant-desc">2分钟智能排版整个文档，规范字体、段落、标题层级，美化页面布局，导出多种格式。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">83%</span></span>
            <span class="stat-item">提效 <span class="highlight">5.8倍</span></span>
          </div>
        </div>
      </div>

      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'format'" @click="openAssistant('contract')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar7.png" alt="合同格式助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">合同格式助手</h3>
          <p class="assistant-desc">10分钟标准化处理合同文本，自动校对合同条款，确保格式统一，提高法律文档规范性。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">78%</span></span>
            <span class="stat-item">提效 <span class="highlight">4.6倍</span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentAssistant.title"
      width="70%"
      :before-close="handleClose"
    >
      <div class="assistant-dialog-content">
        <div class="assistant-info">
          <div class="assistant-avatar">
            <img :src="currentAssistant.avatar" alt="">
          </div>
          <div class="assistant-detail">
            <h3>{{ currentAssistant.title }}</h3>
            <p>{{ currentAssistant.description }}</p>
            <div class="efficiency-stats dialog-stats">
              <span class="stat-item">最高省时比 <span class="highlight">{{ currentAssistant.saveTime }}</span></span>
              <span class="stat-item">提效 <span class="highlight">{{ currentAssistant.efficiency }}</span></span>
            </div>
          </div>
        </div>

        <el-divider></el-divider>

        <div class="document-form">
          <el-form :model="documentConfig" label-width="100px">
            <el-form-item :label="getInputLabel()">
              <el-input
                type="textarea"
                v-model="documentConfig.content"
                :placeholder="getInputPlaceholder()"
                :autosize="{ minRows: 6, maxRows: 10 }"
              />
            </el-form-item>
            
            <el-form-item label="写作风格">
              <el-select v-model="documentConfig.style" placeholder="请选择写作风格">
                <el-option label="正式商务" value="formal" />
                <el-option label="简洁清晰" value="concise" />
                <el-option label="详细专业" value="detailed" />
                <el-option label="创意活泼" value="creative" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="附加选项">
              <el-checkbox v-model="documentConfig.options.includeTOC">包含目录</el-checkbox>
              <el-checkbox v-model="documentConfig.options.includeFootnotes">包含脚注</el-checkbox>
              <el-checkbox v-model="documentConfig.options.includeReferences">包含参考文献</el-checkbox>
            </el-form-item>
          </el-form>

          <!-- 功能按钮 -->
          <div class="dialog-actions">
            <el-button type="primary" @click="generateDocument">立即生成</el-button>
            <el-button @click="dialogVisible = false">取消</el-button>
          </div>
        </div>

        <!-- 生成结果预览 -->
        <div v-if="documentGenerated" class="document-preview">
          <div class="preview-header">
            <h3>生成结果</h3>
            <div class="preview-actions">
              <el-button size="small" type="success" @click="saveDocument">保存文档</el-button>
              <el-button size="small" @click="exportDocument">导出文档</el-button>
            </div>
          </div>
          
          <div class="preview-content">
            <div class="document-title">{{ generatedDocument.title }}</div>
            <div class="document-meta">生成时间: {{ generatedDocument.date }}</div>
            <div class="document-content" v-html="generatedDocument.content"></div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';

// 当前激活的标签
const activeTab = ref('all');

// 对话框显示状态
const dialogVisible = ref(false);

// 文档是否已生成
const documentGenerated = ref(false);

// 当前选中的助手
const currentAssistant = reactive({
  id: '',
  title: '',
  description: '',
  avatar: '',
  saveTime: '',
  efficiency: ''
});

// 文档配置
const documentConfig = ref({
  type: '',
  style: 'formal',
  content: '',
  template: 'standard',
  options: {
    includeTOC: false,
    includeFootnotes: false,
    includeReferences: false
  }
});

// 生成的文档
const generatedDocument = ref({
  title: '',
  date: '',
  content: '',
  type: ''
});

// 获取分类标题
const getCategoryTitle = () => {
  const titles = {
    document: '文档编写',
    content: '内容生成',
    review: '审核校对',
    format: '格式排版'
  };
  return titles[activeTab.value] || '';
};

// 获取输入标签
const getInputLabel = () => {
  const labels = {
    meeting: '会议记录',
    report: '工作内容',
    proposal: '项目要点',
    notice: '通知内容',
    proofread: '待校对文本',
    format: '待排版文本',
    contract: '合同内容'
  };
  return labels[currentAssistant.id] || '文档内容';
};

// 获取输入提示
const getInputPlaceholder = () => {
  const placeholders = {
    meeting: '请输入会议记录要点，如时间、地点、参会人员、讨论内容等...',
    report: '请输入需要汇报的工作内容、成果、数据等信息...',
    proposal: '请输入项目背景、目标、主要内容等关键信息...',
    notice: '请输入通知事项、时间、地点、要求等具体内容...',
    proofread: '请粘贴需要校对的文本内容...',
    format: '请粘贴需要排版的文本内容...',
    contract: '请粘贴需要格式化的合同文本...'
  };
  return placeholders[currentAssistant.id] || '请输入文档内容...';
};

// 打开助手对话框
const openAssistant = (type) => {
  documentGenerated.value = false;
  documentConfig.value.content = '';
  documentConfig.value.type = type;
  
  const assistants = {
    meeting: {
      id: 'meeting',
      title: '会议纪要助手',
      description: '30秒自动整理会议记录，快速生成规范会议纪要，突出重点决议与行动项。',
      avatar: '/src/assets/images/avatars/avatar1.png',
      saveTime: '93%',
      efficiency: '8.5倍'
    },
    report: {
      id: 'report',
      title: '工作报告助手',
      description: '2分钟完成日报、周报、月报生成，数据可视化呈现，一键生成专业报告。',
      avatar: '/src/assets/images/avatars/avatar2.png',
      saveTime: '89%',
      efficiency: '7.2倍'
    },
    proposal: {
      id: 'proposal',
      title: '方案撰写助手',
      description: '3分钟输出完整项目方案，包含目标、计划、预算和风险评估，专业水准一键生成。',
      avatar: '/src/assets/images/avatars/avatar3.png',
      saveTime: '92%',
      efficiency: '11.5倍'
    },
    notice: {
      id: 'notice',
      title: '公告通知助手',
      description: '1分钟生成企业通知、公告、邮件，语言规范专业，满足各类正式场合需求。',
      avatar: '/src/assets/images/avatars/avatar4.png',
      saveTime: '86%',
      efficiency: '6.8倍'
    },
    proofread: {
      id: 'proofread',
      title: '文档校对助手',
      description: '30秒检查3000字文档，精准识别错别字、语法错误和表达不畅，提供专业修改建议。',
      avatar: '/src/assets/images/avatars/avatar5.png',
      saveTime: '94%',
      efficiency: '16倍'
    },
    format: {
      id: 'format',
      title: '排版美化助手',
      description: '2分钟智能排版整个文档，规范字体、段落、标题层级，美化页面布局，导出多种格式。',
      avatar: '/src/assets/images/avatars/avatar6.png',
      saveTime: '83%',
      efficiency: '5.8倍'
    },
    contract: {
      id: 'contract',
      title: '合同格式助手',
      description: '10分钟标准化处理合同文本，自动校对合同条款，确保格式统一，提高法律文档规范性。',
      avatar: '/src/assets/images/avatars/avatar7.png',
      saveTime: '78%',
      efficiency: '4.6倍'
    }
  };
  
  Object.assign(currentAssistant, assistants[type]);
  dialogVisible.value = true;
};

// 关闭对话框
const handleClose = (done) => {
  done();
};

// 生成文档
const generateDocument = async () => {
  if (!documentConfig.value.content.trim()) {
    ElMessage.warning('请输入文档内容');
    return;
  }
  
  try {
    // 显示加载状态
    const loading = ElLoading.service({
      lock: true,
      text: '正在生成文档...',
      background: 'rgba(0, 0, 0, 0.7)',
    });
    
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 根据不同类型生成文档
    const mockDocument = generateMockDocument();
    
    // 更新文档数据
    generatedDocument.value = {
      title: mockDocument.title,
      date: new Date().toLocaleString(),
      content: mockDocument.content,
      type: documentConfig.value.type
    };
    
    // 设置文档已生成状态
    documentGenerated.value = true;
    
    // 关闭加载状态
    loading.close();
    
    ElMessage.success('文档生成成功');
  } catch (error) {
    ElMessage.error('文档生成失败: ' + error.message);
  }
};

// 导出文档
const exportDocument = () => {
  ElMessage.success('文档已导出');
};

// 保存文档
const saveDocument = () => {
  ElMessage.success('文档已保存');
};

// 生成模拟文档
const generateMockDocument = () => {
  const mockDocuments = {
    meeting: {
      title: '产品开发会议纪要',
      content: `
        <h2>产品开发会议纪要</h2>
        <p><strong>会议时间：</strong>2023年11月15日 14:00-16:00</p>
        <p><strong>会议地点：</strong>公司会议室A</p>
        <p><strong>参会人员：</strong>张总、李经理、王设计师、赵开发、钱测试</p>
        <p><strong>会议主题：</strong>新产品功能规划与开发进度</p>
        
        <h3>一、会议议程</h3>
        <ol>
          <li>回顾上周工作进展</li>
          <li>讨论新功能设计方案</li>
          <li>确定开发优先级</li>
          <li>分配任务与确定时间线</li>
        </ol>
        
        <h3>二、讨论内容</h3>
        <p>1. 张总介绍了市场需求变化，强调新功能开发的必要性。</p>
        <p>2. 王设计师展示了新界面原型，获得团队一致好评，同意按此方案执行。</p>
        <p>3. 赵开发汇报了现有进度，当前完成度约75%，预计下周可完成核心功能开发。</p>
        <p>4. 钱测试指出了几个现有功能的bug，团队讨论了修复方案。</p>
        
        <h3>三、决议事项</h3>
        <ul>
          <li>新功能将分两期上线，第一期包含核心功能，预计11月25日上线。</li>
          <li>界面优化工作与功能开发同步进行，不延后排期。</li>
          <li>已知bug优先级调整，P0级别bug本周必须修复。</li>
          <li>下周二进行第一期功能的内部测试。</li>
        </ul>
        
        <h3>四、任务分配</h3>
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr>
            <th>负责人</th>
            <th>任务内容</th>
            <th>截止日期</th>
          </tr>
          <tr>
            <td>王设计师</td>
            <td>完成详细界面设计稿</td>
            <td>11月17日</td>
          </tr>
          <tr>
            <td>赵开发</td>
            <td>完成核心功能开发</td>
            <td>11月21日</td>
          </tr>
          <tr>
            <td>钱测试</td>
            <td>准备测试用例</td>
            <td>11月19日</td>
          </tr>
        </table>
        
        <h3>五、下次会议安排</h3>
        <p>时间：11月22日 14:00-15:00</p>
        <p>地点：会议室A</p>
        <p>主题：功能测试反馈与第二期开发规划</p>
        
        <p class="signature">会议记录：李经理</p>
        <p class="signature">审核：张总</p>
      `
    },
    report: {
      title: '2023年第三季度市场营销报告',
      content: `
        <h2>2023年第三季度市场营销报告</h2>
        <p class="report-date">报告期间：2023年7月1日 - 2023年9月30日</p>
        
        <div class="toc">
          <h3>目录</h3>
          <ul>
            <li>1. 执行摘要</li>
            <li>2. 市场概况</li>
            <li>3. 营销活动成效</li>
            <li>4. 预算执行情况</li>
            <li>5. 客户分析</li>
            <li>6. 问题与挑战</li>
            <li>7. 下季度计划</li>
          </ul>
        </div>
        
        <h3>1. 执行摘要</h3>
        <p>第三季度营销团队完成了3个主要营销活动，新增客户328家，同比增长12.3%。社交媒体粉丝增长20.5%，线上销售转化率提升2.8个百分点。总体营销投入回报率(ROI)达到315%，超过季度目标10%。</p>
        
        <h3>2. 市场概况</h3>
        <p>第三季度行业整体呈现稳步增长态势，市场需求较上季度增长8.2%。竞争格局方面，主要竞争对手A公司推出新产品线，B公司加大了线上广告投入。我司市场份额从上季度的18.5%提升至19.3%。</p>
        
        <h3>3. 营销活动成效</h3>
        <h4>3.1 线上营销活动</h4>
        <ul>
          <li>搜索引擎广告：投入10万元，带来4,320次点击，转化280笔订单，ROI 267%</li>
          <li>社交媒体推广：投入8.5万元，获得58.6万次曝光，粉丝增加12,500，间接带动销售增长15%</li>
          <li>邮件营销：发送营销邮件32,000封，打开率28.3%，点击率9.5%，带来销售额约42万元</li>
        </ul>
        
        <h4>3.2 线下营销活动</h4>
        <ul>
          <li>行业展会：参展2场，接触潜在客户约650名，转化68家新客户，投入产出比6.2:1</li>
          <li>客户研讨会：举办4场，累计参与客户152家，满意度评分9.2/10，促成续约率92%</li>
        </ul>
        
        <h3>4. 预算执行情况</h3>
        <p>Q3季度营销预算总额120万元，实际支出115.8万元，预算执行率96.5%。</p>
        <p>主要预算分配：</p>
        <ul>
          <li>数字营销：48.5万元 (41.9%)</li>
          <li>内容创作：23.6万元 (20.4%)</li>
          <li>线下活动：32.2万元 (27.8%)</li>
          <li>品牌建设：11.5万元 (9.9%)</li>
        </ul>
        
        <h3>7. 下季度计划</h3>
        <p>基于Q3的数据分析，Q4将重点关注以下方向：</p>
        <ol>
          <li>加大社交媒体短视频内容投入，目标提升用户互动率25%</li>
          <li>优化搜索引擎关键词策略，提升转化率2个百分点</li>
          <li>推出年终客户答谢活动，提升客户黏性和复购率</li>
          <li>筹备明年Q1新产品发布的预热营销计划</li>
        </ol>
        
        <p class="signature">报告提交人：市场部 李明</p>
        <p class="signature">审核：营销总监 王佳</p>
      `
    }
  };
  
  // 如果没有对应类型的模板，返回通用模板
  return mockDocuments[documentConfig.value.type] || {
    title: '生成的文档',
    content: `<p>这是一份基于您的输入生成的文档。</p><p>${documentConfig.value.content}</p>`
  };
};
</script>

<style scoped lang="scss">
.ai-writer-container {
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
        }
      }
    }
  }
}

// 对话框样式
.assistant-dialog-content {
  .assistant-info {
    display: flex;
    margin-bottom: 20px;
    
    .assistant-avatar {
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
    
    .assistant-detail {
      flex: 1;
      
      h3 {
        margin: 0 0 10px;
        color: #303133;
      }
      
      p {
        color: #606266;
        margin-bottom: 10px;
      }
    }
    
    .dialog-stats {
      margin-top: 10px;
    }
  }
  
  .dialog-actions {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    gap: 15px;
  }
  
  .document-preview {
    margin-top: 30px;
    border-top: 1px solid #ebeef5;
    padding-top: 20px;
    
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      h3 {
        margin: 0;
        font-size: 18px;
      }
    }
    
    .preview-content {
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      
      .document-title {
        font-size: 20px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 10px;
      }
      
      .document-meta {
        text-align: center;
        color: #909399;
        font-size: 14px;
        margin-bottom: 30px;
      }
      
      .document-content {
        padding: 20px;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        
        :deep(h2) {
          text-align: center;
          margin-bottom: 20px;
        }
        
        :deep(h3) {
          margin-top: 25px;
          margin-bottom: 15px;
          color: #303133;
        }
        
        :deep(p) {
          margin: 10px 0;
          line-height: 1.6;
        }
        
        :deep(ul), :deep(ol) {
          padding-left: 20px;
          margin: 10px 0;
          
          li {
            margin-bottom: 5px;
          }
        }
        
        :deep(table) {
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
        
        :deep(.signature) {
          text-align: right;
          margin-top: 40px;
          color: #606266;
        }
      }
    }
  }
}
</style> 