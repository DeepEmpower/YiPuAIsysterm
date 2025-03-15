<template>
  <div class="customer-report">
    <div class="report-summary">
      <div class="summary-item">
        <h4>客户总数</h4>
        <div class="amount">{{ formatNumber(data.totalCustomers) }}</div>
      </div>
      <div class="summary-item">
        <h4>新增客户</h4>
        <div class="amount increase">{{ formatNumber(data.newCustomers) }}</div>
      </div>
      <div class="summary-item">
        <h4>客户流失</h4>
        <div class="amount decrease">{{ formatNumber(data.lostCustomers) }}</div>
      </div>
      <div class="summary-item">
        <h4>客户留存率</h4>
        <div class="amount">{{ data.retentionRate }}%</div>
      </div>
    </div>
    
    <div class="customer-analysis">
      <h4>客户分析</h4>
      <el-tabs>
        <el-tab-pane label="客户分布">
          <div class="distribution-chart" ref="distributionChart"></div>
        </el-tab-pane>
        <el-tab-pane label="客户价值">
          <el-table :data="data.customerValue" border style="width: 100%; margin-top: 20px;">
            <el-table-column prop="level" label="客户等级" width="120" />
            <el-table-column prop="count" label="客户数量" width="120" />
            <el-table-column prop="percentage" label="占比">
              <template #default="scope">
                {{ scope.row.percentage }}%
              </template>
            </el-table-column>
            <el-table-column prop="averageSpend" label="平均消费额">
              <template #default="scope">
                ￥{{ formatNumber(scope.row.averageSpend) }}
              </template>
            </el-table-column>
            <el-table-column prop="totalRevenue" label="总收入">
              <template #default="scope">
                ￥{{ formatNumber(scope.row.totalRevenue) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="feedback-analysis" v-if="data.feedback">
      <h4>客户反馈分析</h4>
      <div class="satisfaction-score">
        <div class="score-label">总体满意度评分</div>
        <div class="score-value">{{ data.feedback.satisfactionScore }} <span>/10</span></div>
        <el-progress :percentage="data.feedback.satisfactionScore * 10" :color="getSatisfactionColor(data.feedback.satisfactionScore)" />
      </div>
      
      <div class="feedback-breakdown">
        <el-row :gutter="20">
          <el-col :span="12" v-for="(item, index) in data.feedback.categories" :key="index">
            <div class="feedback-item">
              <div class="feedback-title">{{ item.name }}</div>
              <div class="feedback-bar">
                <el-progress :percentage="item.score * 10" :color="getSatisfactionColor(item.score)" />
                <span class="feedback-score">{{ item.score }}/10</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      totalCustomers: 0,
      newCustomers: 0,
      lostCustomers: 0,
      retentionRate: 0,
      distribution: {},
      customerValue: [],
      feedback: null
    })
  }
});

const distributionChart = ref(null);
let chart = null;

// 格式化数字为千分位分隔
const formatNumber = (num) => {
  return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
};

// 根据满意度评分获取颜色
const getSatisfactionColor = (score) => {
  if (score >= 8) return '#67c23a';
  if (score >= 6) return '#e6a23c';
  return '#f56c6c';
};

// 初始化图表
const initChart = () => {
  if (distributionChart.value && props.data.distribution) {
    if (chart) {
      chart.dispose();
    }
    
    chart = echarts.init(distributionChart.value);
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: Object.keys(props.data.distribution)
      },
      series: [
        {
          name: '客户分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: Object.entries(props.data.distribution).map(([key, value]) => ({
            name: key,
            value
          }))
        }
      ]
    };
    
    chart.setOption(option);
    
    window.addEventListener('resize', () => {
      chart.resize();
    });
  }
};

watch(() => props.data, () => {
  setTimeout(() => {
    initChart();
  }, 300);
}, { deep: true });

onMounted(() => {
  initChart();
});
</script>

<style scoped lang="scss">
.customer-report {
  .report-summary {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
    
    .summary-item {
      flex: 1;
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      
      h4 {
        margin: 0 0 10px 0;
        color: #606266;
      }
      
      .amount {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        
        &.increase {
          color: #67c23a;
        }
        
        &.decrease {
          color: #f56c6c;
        }
      }
    }
  }
  
  .customer-analysis, .feedback-analysis {
    margin-top: 30px;
    
    h4 {
      margin-bottom: 15px;
      color: #303133;
    }
  }
  
  .distribution-chart {
    height: 350px;
    width: 100%;
  }
  
  .satisfaction-score {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    
    .score-label {
      font-size: 16px;
      color: #606266;
      margin-bottom: 10px;
    }
    
    .score-value {
      font-size: 32px;
      font-weight: 700;
      color: #303133;
      margin-bottom: 10px;
      
      span {
        font-size: 18px;
        font-weight: 400;
        color: #909399;
      }
    }
  }
  
  .feedback-breakdown {
    margin-top: 20px;
    
    .feedback-item {
      margin-bottom: 15px;
      
      .feedback-title {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }
      
      .feedback-bar {
        display: flex;
        align-items: center;
        
        .el-progress {
          flex: 1;
          margin-right: 10px;
        }
        
        .feedback-score {
          font-size: 14px;
          color: #606266;
          width: 50px;
          text-align: right;
        }
      }
    }
  }
}
</style> 