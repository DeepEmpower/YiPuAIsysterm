<template>
  <div class="hr-report">
    <div class="report-summary">
      <div class="summary-item">
        <h4>员工总数</h4>
        <div class="amount">{{ formatNumber(data.totalEmployees) }}</div>
      </div>
      <div class="summary-item">
        <h4>本期入职</h4>
        <div class="amount increase">{{ formatNumber(data.newHires) }}</div>
      </div>
      <div class="summary-item">
        <h4>本期离职</h4>
        <div class="amount decrease">{{ formatNumber(data.departures) }}</div>
      </div>
      <div class="summary-item">
        <h4>人员流动率</h4>
        <div class="amount">{{ data.turnoverRate }}%</div>
      </div>
    </div>
    
    <div class="department-breakdown">
      <h4>部门人员分布</h4>
      <el-table :data="data.departments" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="name" label="部门名称" width="180" />
        <el-table-column prop="count" label="人数" width="120" />
        <el-table-column prop="averageSalary" label="平均薪资">
          <template #default="scope">
            ￥{{ formatNumber(scope.row.averageSalary) }}
          </template>
        </el-table-column>
        <el-table-column prop="malePercentage" label="男性占比">
          <template #default="scope">
            {{ scope.row.malePercentage }}%
          </template>
        </el-table-column>
        <el-table-column prop="femalePercentage" label="女性占比">
          <template #default="scope">
            {{ scope.row.femalePercentage }}%
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <div class="training-section" v-if="data.training">
      <h4>培训情况</h4>
      <div class="training-stats">
        <div class="stat-item">
          <div class="stat-label">培训场次</div>
          <div class="stat-value">{{ data.training.sessions }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">参训人次</div>
          <div class="stat-value">{{ data.training.participants }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">培训满意度</div>
          <div class="stat-value">{{ data.training.satisfaction }}分</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">培训总支出</div>
          <div class="stat-value">￥{{ formatNumber(data.training.cost) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      totalEmployees: 0,
      newHires: 0,
      departures: 0,
      turnoverRate: 0,
      departments: [],
      training: null
    })
  }
});

// 格式化数字为千分位分隔
const formatNumber = (num) => {
  return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
};
</script>

<style scoped lang="scss">
.hr-report {
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
  
  .department-breakdown, .training-section {
    margin-top: 30px;
    
    h4 {
      margin-bottom: 15px;
      color: #303133;
    }
  }
  
  .training-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
    
    .stat-item {
      flex: 1;
      min-width: 200px;
      padding: 15px;
      background-color: #f4f4f5;
      border-radius: 6px;
      
      .stat-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }
      
      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
}
</style> 