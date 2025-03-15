<template>
  <div class="production-report">
    <div class="report-summary">
      <div class="summary-item">
        <h4>总产量</h4>
        <div class="amount">{{ formatNumber(data.totalProduction) }}{{ data.unit }}</div>
      </div>
      <div class="summary-item">
        <h4>合格率</h4>
        <div class="amount" :class="{'good-rate': data.qualifiedRate >= 95}">
          {{ data.qualifiedRate }}%
        </div>
      </div>
      <div class="summary-item">
        <h4>生产成本</h4>
        <div class="amount">￥{{ formatNumber(data.cost) }}</div>
      </div>
      <div class="summary-item">
        <h4>产能利用率</h4>
        <div class="amount" :class="{'good-rate': data.utilizationRate >= 90}">
          {{ data.utilizationRate }}%
        </div>
      </div>
    </div>
    
    <div class="production-trends">
      <h4>产量趋势</h4>
      <div class="chart" ref="productionChart"></div>
    </div>
    
    <div class="product-details">
      <h4>产品生产明细</h4>
      <el-table :data="data.products" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="name" label="产品名称" width="180" />
        <el-table-column prop="production" label="产量">
          <template #default="scope">
            {{ formatNumber(scope.row.production) }}{{ data.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="qualifiedRate" label="合格率">
          <template #default="scope">
            <span :class="{'text-success': scope.row.qualifiedRate >= 95}">
              {{ scope.row.qualifiedRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="costPerUnit" label="单位成本">
          <template #default="scope">
            ￥{{ formatNumber(scope.row.costPerUnit) }}
          </template>
        </el-table-column>
      </el-table>
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
      totalProduction: 0,
      qualifiedRate: 0,
      cost: 0,
      utilizationRate: 0,
      unit: '件',
      productiontremd: [],
      products: []
    })
  }
});

const productionChart = ref(null);
let chart = null;

// 格式化数字为千分位分隔
const formatNumber = (num) => {
  return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
};

// 初始化图表
const initChart = () => {
  if (productionChart.value && props.data.productiontremd) {
    if (chart) {
      chart.dispose();
    }
    
    chart = echarts.init(productionChart.value);
    
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['产量', '合格率'],
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: props.data.productiontremd.map(item => item.date)
      },
      yAxis: [
        {
          type: 'value',
          name: '产量',
          min: 0
        },
        {
          type: 'value',
          name: '百分比',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: '产量',
          type: 'line',
          data: props.data.productiontremd.map(item => item.production)
        },
        {
          name: '合格率',
          type: 'line',
          yAxisIndex: 1,
          data: props.data.productiontremd.map(item => item.qualifiedRate)
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
.production-report {
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
        
        &.good-rate {
          color: #67c23a;
        }
      }
    }
  }
  
  .production-trends, .product-details {
    margin-top: 30px;
    
    h4 {
      margin-bottom: 15px;
      color: #303133;
    }
  }
  
  .chart {
    height: 300px;
    width: 100%;
  }
  
  .text-success {
    color: #67c23a;
  }
}
</style> 