<template>
  <div class="financial-report">
    <div class="report-summary">
      <div class="summary-item">
        <h4>总收入</h4>
        <div class="amount">￥{{ formatNumber(data.income) }}</div>
      </div>
      <div class="summary-item">
        <h4>总支出</h4>
        <div class="amount">￥{{ formatNumber(data.expense) }}</div>
      </div>
      <div class="summary-item">
        <h4>净利润</h4>
        <div class="amount profit">￥{{ formatNumber(data.profit) }}</div>
      </div>
    </div>
    
    <div class="report-details">
      <h4>月度财务明细</h4>
      <el-table :data="data.details" border style="width: 100%">
        <el-table-column prop="month" label="月份" width="180" />
        <el-table-column prop="income" label="收入" width="180">
          <template #default="scope">
            ￥{{ formatNumber(scope.row.income) }}
          </template>
        </el-table-column>
        <el-table-column prop="expense" label="支出">
          <template #default="scope">
            ￥{{ formatNumber(scope.row.expense) }}
          </template>
        </el-table-column>
        <el-table-column label="利润">
          <template #default="scope">
            ￥{{ formatNumber(scope.row.income - scope.row.expense) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

// 格式化数字为千分位分隔
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
</script>

<style scoped lang="scss">
.financial-report {
  .report-summary {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    
    .summary-item {
      flex: 1;
      background-color: #f9f9f9;
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
        
        &.profit {
          color: #67c23a;
        }
      }
    }
  }
  
  .report-details {
    h4 {
      margin-bottom: 15px;
      color: #303133;
    }
  }
}
</style> 