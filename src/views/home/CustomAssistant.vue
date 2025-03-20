<template>
  <div class="custom-assistant-container">
    <!-- 顶部标题区域 -->
    <div class="custom-header">
      <h1 class="main-title">自定义AI员工，三步轻松打造您的个性化助理</h1>
      <p class="sub-title">
        试试看，打造HR专家、法务专家、服务于内部助理咨询场景<br>
        或者，打造销售代表、专业咨询师、服务于外部客户
      </p>
    </div>

    <!-- 步骤展示区域 -->
    <div class="steps-container">
      <div class="step-card">
        <div class="step-icon">
          <img src="@/assets/images/custom/step1-icon.svg" alt="创建AI助理" />
        </div>
        <div class="step-content">
          <div class="step-title">第1步：创建AI助理</div>
          <div class="step-desc">可自定义形象、名称和声音等</div>
        </div>
      </div>

      <div class="step-divider"></div>

      <div class="step-card">
        <div class="step-icon">
          <img src="@/assets/images/custom/step2-icon.svg" alt="添加知识" />
        </div>
        <div class="step-content">
          <div class="step-title">第2步：添加知识</div>
          <div class="step-desc">
            上传PDF、Word或QA问答到知识库，AI助理自主学习后，可基于知识库对话
          </div>
        </div>
      </div>

      <div class="step-divider"></div>

      <div class="step-card">
        <div class="step-icon">
          <img src="@/assets/images/custom/step3-icon.svg" alt="发布AI助理" />
        </div>
        <div class="step-content">
          <div class="step-title">第3步：发布AI助理</div>
          <div class="step-desc">
            挂载到出版社公众号或官网，即可扫码体验，还可以在AI助理工作台进行对话
          </div>
        </div>
      </div>
    </div>

    <!-- 开始创建按钮 -->
    <div class="action-container">
      <el-button type="primary" size="large" @click="startCreation">
        <el-icon><Plus /></el-icon> 开始创建
      </el-button>
    </div>

    <!-- 背景装饰 -->
    <div class="bg-decoration left-decoration"></div>
    <div class="bg-decoration right-decoration"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Plus } from '@element-plus/icons-vue';

const router = useRouter();

// 开始创建按钮点击事件处理
const startCreation = () => {
  router.push('/home/custom_assistant/creation');
};
</script>

<style scoped lang="scss">
.custom-assistant-container {
  height: 100vh;
  width: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #e6e9f2 0%, #f5f7fa 100%);
  position: relative;
  overflow: hidden;

  .custom-header {
    text-align: center;
    margin-bottom: 80px;
    max-width: 800px;
    z-index: 2;

    .main-title {
      font-size: 32px;
      color: #303133;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .sub-title {
      font-size: 16px;
      color: #606266;
      line-height: 1.8;
    }
  }

  .steps-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 80px;
    width: 100%;
    max-width: 1200px;
    z-index: 2;

    .step-card {
      background-color: white;
      border-radius: 12px;
      padding: 30px;
      width: 280px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
      text-align: center;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 20px rgba(0, 0, 0, 0.08);
      }

      .step-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .step-content {
        .step-title {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 10px;
        }

        .step-desc {
          font-size: 14px;
          color: #606266;
          line-height: 1.6;
        }
      }
    }

    .step-divider {
      width: 60px;
      height: 2px;
      background-color: #dcdfe6;
      position: relative;
      margin: 0 10px;

      &::before, &::after {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        background-color: #dcdfe6;
        border-radius: 50%;
        top: -4px;
      }

      &::before {
        left: 0;
      }

      &::after {
        right: 0;
      }
    }
  }

  .action-container {
    z-index: 2;
    
    .el-button {
      padding: 12px 30px;
      font-size: 16px;
    }
  }

  .bg-decoration {
    position: absolute;
    opacity: 0.1;
    z-index: 1;
  }

  .left-decoration {
    width: 400px;
    height: 400px;
    background-color: #409EFF;
    border-radius: 50%;
    left: -200px;
    bottom: -200px;
  }

  .right-decoration {
    width: 300px;
    height: 300px;
    background-color: #67C23A;
    border-radius: 50%;
    right: -100px;
    top: -100px;
  }
}

@media screen and (max-width: 1200px) {
  .custom-assistant-container {
    .steps-container {
      flex-direction: column;
      gap: 30px;

      .step-card {
        width: 100%;
        max-width: 500px;
      }

      .step-divider {
        width: 2px;
        height: 40px;
        margin: 0;

        &::before, &::after {
          left: -4px;
          width: 10px;
          height: 10px;
        }

        &::before {
          top: 0;
        }

        &::after {
          top: auto;
          bottom: 0;
        }
      }
    }
  }
}
</style> 