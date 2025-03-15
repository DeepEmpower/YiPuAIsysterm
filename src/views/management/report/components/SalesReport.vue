<template>
  <div class="sales-report">
    <div class="report-summary">
      <div class="summary-card">
        <h4>总销售额</h4>
        <div class="amount">￥{{ formatNumber(data.totalSales) }}</div>
      </div>
    </div>
    
    <div class="sales-breakdown">
      <h4>销售产品明细</h4>
      <el-table :data="data.products" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="name" label="产品名称" width="180" />
        <el-table-column prop="sales" label="销售额" width="180">
          <template #default="scope">
            ￥{{ formatNumber(scope.row.sales) }}
          </template>
        </el-table-column>
        <el-table-column prop="percentage" label="占比">
          <template #default="scope">
            {{ scope.row.percentage }}%
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <div class="chart-container" v-if="data.products && data.products.length > 0">
      <h4>销售分布图</h4>
      <div class="chart" ref="salesChart"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

const salesChart = ref(null);
let chart = null;

// 格式化数字为千分位分隔
const formatNumber = (num) => {
  return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
};

// 初始化图表
const initChart = () => {
  if (salesChart.value && props.data.products) {
    // 销毁之前的实例
    if (chart) {
      chart.dispose();
    }
    
    chart = echarts.init(salesChart.value);
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ￥{c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: props.data.products.map(item => item.name)
      },
      series: [
        {
          name: '销售额',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: props.data.products.map(item => ({
            value: item.sales,
            name: item.name
          }))
        }
      ]
    };
    
    chart.setOption(option);
    
    // 响应容器大小变化
    window.addEventListener('resize', () => {
      chart.resize();
    });
  }
};

// 监听数据变化重新渲染图表
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
.sales-report {
  .report-summary {
    margin-bottom: 30px;
    
    .summary-card {
      background-color: #f0f9eb;
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
        color: #67c23a;
      }
    }
  }
  
  .sales-breakdown, .chart-container {
    margin-top: 30px;
    
    h4 {
      margin-bottom: 15px;
      color: #303133;
    }
  }
  
  .chart {
    height: 350px;
    width: 100%;
  }
}
</style> 