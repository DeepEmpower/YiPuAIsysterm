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
      <!-- 可研报告编写 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'document'" @click="navigateToAssistant('feasibility-report')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar1.png" alt="可研报告编写">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">可研报告编写</h3>
          <p class="assistant-desc">迅速全面的选题报告制作，高效精准的市场研究与竞品分析。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">97%</span></span>
            <span class="stat-item">提效 <span class="highlight">39倍</span></span>
          </div>
        </div>
      </div>

      <!-- 产品策划编写 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'document'" @click="navigateToAssistant('product-planning')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar2.png" alt="产品策划编写">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">产品策划编写</h3>
          <p class="assistant-desc">浏览所关注领域的最新资讯、行业动态、发现新选题，随时回答资讯问题。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">92%</span></span>
            <span class="stat-item">提效 <span class="highlight">11.5倍</span></span>
          </div>
        </div>
      </div>

      <!-- 销售报告编写 -->
      <div class="ai-card" v-if="activeTab === 'all' || activeTab === 'document'" @click="navigateToAssistant('sales-report')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar3.png" alt="销售报告编写">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">销售报告编写</h3>
          <p class="assistant-desc">30秒提供写作灵感、1分钟完成图书大纲、3分钟优化3000字文稿，得心应手。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">93%</span></span>
            <span class="stat-item">提效 <span class="highlight">14倍</span></span>
          </div>
        </div>
      </div>

      <!-- 内容生成分类下的卡片 -->
      <div class="ai-card" v-if="activeTab === 'content' || activeTab === 'all'" @click="navigateToAssistant('marketing-content')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar7.png" alt="营销文案助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">营销文案助手</h3>
          <p class="assistant-desc">生成吸引人的营销文案，包括产品描述、活动宣传、广告语等。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">88%</span></span>
            <span class="stat-item">提效 <span class="highlight">20倍</span></span>
          </div>
        </div>
      </div>

      <div class="ai-card" v-if="activeTab === 'content' || activeTab === 'all'" @click="navigateToAssistant('social-media')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar8.png" alt="社媒内容助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">社媒内容助手</h3>
          <p class="assistant-desc">生成社交媒体内容，包括文章、帖子、评论等，提高社交媒体影响力。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">85%</span></span>
            <span class="stat-item">提效 <span class="highlight">18倍</span></span>
          </div>
        </div>
      </div>

      <!-- 审核校对分类下的卡片 -->
      <div class="ai-card" v-if="activeTab === 'review' || activeTab === 'all'" @click="navigateToAssistant('grammar-check')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar9.png" alt="语法校对助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">语法校对助手</h3>
          <p class="assistant-desc">智能检查文章语法错误，提供修改建议，确保文章准确性。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">80%</span></span>
            <span class="stat-item">提效 <span class="highlight">15倍</span></span>
          </div>
        </div>
      </div>

      <div class="ai-card" v-if="activeTab === 'review' || activeTab === 'all'" @click="navigateToAssistant('style-check')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar10.png" alt="文风校对助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">文风校对助手</h3>
          <p class="assistant-desc">检查并优化文章风格，确保文章表达统一、专业。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">75%</span></span>
            <span class="stat-item">提效 <span class="highlight">12倍</span></span>
          </div>
        </div>
      </div>

      <!-- 格式排版分类下的卡片 -->
      <div class="ai-card" v-if="activeTab === 'format' || activeTab === 'all'" @click="navigateToAssistant('document-format')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar11.png" alt="文档排版助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">文档排版助手</h3>
          <p class="assistant-desc">一键美化文档排版，支持多种格式模板，让文档更专业。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">70%</span></span>
            <span class="stat-item">提效 <span class="highlight">10倍</span></span>
          </div>
        </div>
      </div>

      <div class="ai-card" v-if="activeTab === 'format' || activeTab === 'all'" @click="navigateToAssistant('presentation-format')">
        <div class="card-avatar">
          <img src="@/assets/images/avatars/avatar12.png" alt="演示排版助手">
        </div>
        <div class="card-content">
          <h3 class="assistant-name">演示排版助手</h3>
          <p class="assistant-desc">优化演示文稿排版，生成专业的PPT模板和布局。</p>
          <div class="efficiency-stats">
            <span class="stat-item">最高省时比 <span class="highlight">65%</span></span>
            <span class="stat-item">提效 <span class="highlight">8倍</span></span>
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
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';

const router = useRouter();
const activeTab = ref('all');
const dialogVisible = ref(false);
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

// 导航到助手专属页面
const navigateToAssistant = (route: string) => {
  router.push(`/home/AI_writer/${route}`);
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
    feasibility: {
      title: '市场调研报告',
      content: `
        <h2>市场调研报告</h2>
        <p><strong>调研时间：</strong>2023年10月1日 - 2023年11月15日</p>
        <p><strong>调研目的：</strong>了解市场需求，分析竞争对手，确定产品定位。</p>
        
        <h3>一、市场概况</h3>
        <p>当前市场呈现稳步增长态势，市场需求较上季度增长8.2%。主要竞争对手A公司推出新产品线，B公司加大了线上广告投入。我司市场份额从上季度的18.5%提升至19.3%。</p>
        
        <h3>二、调研方法</h3>
        <p>采用定量分析与定性分析相结合的方法，通过问卷调查、深度访谈和数据分析等手段。</p>
        
        <h3>三、调研结果</h3>
        <p>1. 消费者偏好分析：</p>
        <ul>
          <li>消费者对新产品的功能需求主要集中在提高效率和改善体验上。</li>
          <li>超过70%的消费者表示愿意为新功能支付额外费用。</li>
        </ul>
        <p>2. 竞争对手分析：</p>
        <p>竞争对手A公司的新产品在市场上表现良好，但B公司加大了线上广告投入，对我司市场份额构成一定威胁。</p>
        
        <h3>四、结论与建议</h3>
        <p>基于以上分析，建议我司继续保持现有市场份额，并适当增加线上广告投入，以应对竞争对手的挑战。</p>
        
        <p class="signature">调研人：市场部 张三</p>
        <p class="signature">审核：营销总监 李四</p>
      `
    },
    product: {
      title: '产品策划方案',
      content: `
        <h2>产品策划方案</h2>
        <p><strong>目标用户群体：</strong>25-45岁，注重生活品质的中高端人群</p>
        <p><strong>产品概念：</strong>高品质、多功能、环保</p>
        
        <h3>一、市场分析</h3>
        <p>当前市场呈现稳步增长态势，市场需求较上季度增长8.2%。主要竞争对手A公司推出新产品线，B公司加大了线上广告投入。我司市场份额从上季度的18.5%提升至19.3%。</p>
        
        <h3>二、产品定位</h3>
        <p>基于市场分析，我司产品应定位为中高端市场，注重产品品质和功能性。</p>
        
        <h3>三、产品特点</h3>
        <ul>
          <li>高品质：采用优质材料，确保产品耐用性和舒适性。</li>
          <li>多功能：满足消费者多样化的需求。</li>
          <li>环保：符合现代消费者对环保产品的需求。</li>
        </ul>
        
        <h3>四、营销策略</h3>
        <p>1. 线上营销：利用社交媒体和搜索引擎广告吸引目标用户。</p>
        <p>2. 线下活动：参加行业展会和举办客户研讨会，增加品牌曝光度。</p>
        
        <h3>五、预算分配</h3>
        <p>Q3季度营销预算总额120万元，主要分配如下：</p>
        <ul>
          <li>数字营销：48.5万元 (41.9%)</li>
          <li>内容创作：23.6万元 (20.4%)</li>
          <li>线下活动：32.2万元 (27.8%)</li>
          <li>品牌建设：11.5万元 (9.9%)</li>
        </ul>
        
        <p class="signature">策划人：产品部 王五</p>
        <p class="signature">审核：市场部 赵六</p>
      `
    },
    sales: {
      title: '销售分析报告',
      content: `
        <h2>销售分析报告</h2>
        <p><strong>分析周期：</strong>2023年7月1日 - 2023年9月30日</p>
        
        <h3>一、销售概况</h3>
        <p>第三季度销售团队完成了3个主要营销活动，新增客户328家，同比增长12.3%。社交媒体粉丝增长20.5%，线上销售转化率提升2.8个百分点。总体营销投入回报率(ROI)达到315%，超过季度目标10%。</p>
        
        <h3>二、销售趋势</h3>
        <p>1. 线上销售趋势：</p>
        <p>搜索引擎广告：投入10万元，带来4,320次点击，转化280笔订单，ROI 267%</p>
        <p>社交媒体推广：投入8.5万元，获得58.6万次曝光，粉丝增加12,500，间接带动销售增长15%</p>
        <p>邮件营销：发送营销邮件32,000封，打开率28.3%，点击率9.5%，带来销售额约42万元</p>
        
        <h3>三、客户分析</h3>
        <p>1. 客户满意度分析：</p>
        <p>92%的客户表示对产品或服务感到满意，其中85%的客户表示会推荐给其他人。</p>
        <p>2. 客户忠诚度分析：</p>
        <p>75%的客户表示会继续购买我司产品，其中68%的客户表示会推荐给其他人。</p>
        
        <h3>四、问题与挑战</h3>
        <p>1. 市场竞争激烈，主要竞争对手A公司推出新产品线。</p>
        <p>2. 线上广告成本较高，需要优化投放策略。</p>
        
        <h3>五、下季度计划</h3>
        <p>基于Q3的数据分析，Q4将重点关注以下方向：</p>
        <ol>
          <li>加大社交媒体短视频内容投入，目标提升用户互动率25%</li>
          <li>优化搜索引擎关键词策略，提升转化率2个百分点</li>
          <li>推出年终客户答谢活动，提升客户黏性和复购率</li>
          <li>筹备明年Q1新产品发布的预热营销计划</li>
        </ol>
        
        <p class="signature">分析人：销售部 孙七</p>
        <p class="signature">审核：营销总监 周八</p>
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

// 新增样式
.add-assistant-card {
  border: 2px dashed #DCDFE6;
  background-color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s;
  
  &:hover {
    border-color: #409EFF;
    background-color: rgba(236, 245, 255, 0.7);
  }
  
  .add-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    
    .add-icon {
      font-size: 36px;
      color: #409EFF;
      margin-bottom: 15px;
    }
  }
}

.custom-assistant-card {
  border: 2px solid #e6f7ff;
  
  &:hover {
    border-color: #409EFF;
  }
  
  .custom-actions {
    display: flex;
    gap: 5px;
    
    .el-button {
      padding: 2px;
    }
  }
}
</style> 