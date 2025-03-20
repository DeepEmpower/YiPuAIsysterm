<template>
  <div class="custom-creation-container">
    <!-- 创建成功页面 -->
    <div class="success-page" v-if="showSuccess">
      <div class="success-icon">
        <el-icon><Check /></el-icon>
      </div>
      <div class="success-title">自定义AI员工创建成功</div>
      <div class="success-actions">
        <el-button plain @click="goToList">返回自定义AI员工列表</el-button>
        <el-button type="primary" @click="goToKnowledgeTraining">去知识库训练</el-button>
      </div>
    </div>
    
    <!-- 创建表单 -->
    <div class="creation-wrapper" v-else>
      <div class="creation-header">
        <div class="header-left">
          <el-icon class="back-icon" @click="goBack"><Back /></el-icon>
          <span>创建自定义AI助手</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="saveAssistant">保存创建</el-button>
        </div>
      </div>

      <div class="creation-form">
        <el-form :model="formData" label-position="top" :rules="rules" ref="formRef">
          <!-- AI员工昵称 -->
          <el-form-item label="AI员工昵称" prop="name" required>
            <el-input 
              v-model="formData.name" 
              placeholder="请输入2-10个字的AI员工昵称"
              maxlength="10"
              show-word-limit
            ></el-input>
          </el-form-item>

          <!-- AI员工形象 -->
          <el-form-item label="AI员工形象" prop="avatar" required>
            <div class="avatar-selection">
              <div 
                v-for="(avatar, index) in avatarOptions" 
                :key="index" 
                class="avatar-option"
                :class="{ active: formData.avatar === avatar.value }"
                @click="selectAvatar(avatar.value)"
              >
                <img :src="avatar.url" :alt="avatar.label">
                <div class="avatar-check" v-if="formData.avatar === avatar.value">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
              
              <div class="avatar-upload" @click="handleAvatarUpload">
                <el-icon><Plus /></el-icon>
                <span>自定义头像</span>
                <input 
                  type="file" 
                  ref="avatarInput" 
                  style="display: none" 
                  accept="image/*"
                  @change="onAvatarFileChange"
                >
              </div>
            </div>
            
            <div class="avatar-upload-tip">
              自定义头像建议：宽500像素，高500像素的jpg、png、gif图片，图片大小建议在5M以内。
            </div>
          </el-form-item>

          <!-- AI员工声音 -->
          <el-form-item label="AI员工声音" prop="voice" required>
            <div class="voice-options">
              <div 
                class="voice-option" 
                :class="{ active: formData.voice === 'xiaoxiao' }"
                @click="selectVoice('xiaoxiao')"
              >
                <div class="voice-option-left">
                  <div class="voice-avatar">
                    <img src="@/assets/images/voices/voice-female.png" alt="晓晓">
                  </div>
                  <div class="voice-info">
                    <div class="voice-name">晓晓</div>
                    <div class="voice-desc">活泼、温暖的声音，具有多种场景风格和情感。</div>
                  </div>
                </div>
                <div class="voice-option-right">
                  <el-button circle @click.stop="playVoice('xiaoxiao')">
                    <el-icon><VideoPlay /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <div 
                class="voice-option" 
                :class="{ active: formData.voice === 'yunyang' }"
                @click="selectVoice('yunyang')"
              >
                <div class="voice-option-left">
                  <div class="voice-avatar">
                    <img src="@/assets/images/voices/voice-male.png" alt="云扬">
                  </div>
                  <div class="voice-info">
                    <div class="voice-name">云扬</div>
                    <div class="voice-desc">专业、清晰的声音，具有多种场景风格。</div>
                  </div>
                </div>
                <div class="voice-option-right">
                  <el-button circle @click.stop="playVoice('yunyang')">
                    <el-icon><VideoPlay /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-form-item>

          <!-- 能力描述 -->
          <el-form-item label="能力描述">
            <el-input 
              v-model="formData.abilities" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入150字以内的能力描述"
              maxlength="150"
              show-word-limit
            ></el-input>
          </el-form-item>

          <!-- 欢迎语 -->
          <el-form-item label="欢迎语" required prop="greeting">
            <el-input 
              v-model="formData.greeting" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入100字以内的欢迎语"
              maxlength="100"
              show-word-limit
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="creation-footer">
        <el-button type="primary" size="large" @click="saveAssistant">保存创建</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Back, Check, Plus, VideoPlay } from '@element-plus/icons-vue';

const router = useRouter();
const formRef = ref();
const avatarInput = ref();
const showSuccess = ref(false);

// 表单数据
const formData = reactive({
  name: '',
  avatar: 'avatar1',
  voice: 'xiaoxiao',
  abilities: '',
  greeting: '',
  customAvatar: null
});

// 验证规则
const rules = {
  name: [
    { required: true, message: '请输入AI员工昵称', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在2到10个字符', trigger: 'blur' }
  ],
  avatar: [
    { required: true, message: '请选择AI员工形象', trigger: 'change' }
  ],
  voice: [
    { required: true, message: '请选择AI员工声音', trigger: 'change' }
  ],
  greeting: [
    { required: true, message: '请输入欢迎语', trigger: 'blur' }
  ]
};

// 头像选项
const avatarOptions = [
  { 
    label: '形象1', 
    value: 'avatar1', 
    url: '/src/assets/images/avatars/avatar1.png' 
  },
  { 
    label: '形象2', 
    value: 'avatar2', 
    url: '/src/assets/images/avatars/avatar2.png' 
  },
  { 
    label: '形象3', 
    value: 'avatar3', 
    url: '/src/assets/images/avatars/avatar3.png' 
  }
];

// 返回上一页
const goBack = () => {
  router.back();
};

// 选择头像
const selectAvatar = (avatar) => {
  formData.avatar = avatar;
  formData.customAvatar = null;
};

// 处理上传头像按钮点击
const handleAvatarUpload = () => {
  avatarInput.value.click();
};

// 处理头像文件变化
const onAvatarFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    ElMessage.error('请上传jpg、png或gif格式的图片');
    return;
  }
  
  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB');
    return;
  }
  
  // 预览并设置自定义头像
  const reader = new FileReader();
  reader.onload = (e) => {
    formData.customAvatar = e.target.result;
    formData.avatar = 'custom';
  };
  reader.readAsDataURL(file);
};

// 选择声音
const selectVoice = (voice) => {
  formData.voice = voice;
};

// 播放声音示例
const playVoice = (voice) => {
  // 这里应该实现播放声音的逻辑
  ElMessage.success(`正在播放${voice === 'xiaoxiao' ? '晓晓' : '云扬'}的声音示例`);
  
  // 实际实现可能需要使用Audio API
  // const audio = new Audio(`/path/to/${voice}_sample.mp3`);
  // audio.play();
};

// 保存创建助手
const saveAssistant = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 显示成功页面
      showSuccess.value = true;
      
      // 实际应用中应该调用API保存数据
      // TODO: API调用逻辑
    } else {
      ElMessage.error('请完善表单信息');
      return false;
    }
  });
};

// 返回自定义AI员工列表
const goToList = () => {
  router.push('/home/custom_assistant');
};

// 去知识库训练
const goToKnowledgeTraining = () => {
  // 此处可以导航到知识库训练页面
  router.push('/home/custom_assistant');
  // 实际应用中应该导航到知识库训练页面
  // router.push('/home/custom_assistant/knowledge-training');
};
</script>

<style scoped lang="scss">
.custom-creation-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.creation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  width: 100%;
  
  .header-left {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    
    .back-icon {
      margin-right: 8px;
      font-size: 18px;
      cursor: pointer;
    }
  }
}

.creation-form {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: white;
  margin: 0;
  border-radius: 0;
  
  .el-form-item {
    margin-bottom: 30px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .avatar-selection {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 10px;
    
    .avatar-option {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      border: 2px solid transparent;
      transition: all 0.3s;
      
      &.active {
        border-color: #409EFF;
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .avatar-check {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        background-color: #409EFF;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 12px;
      }
    }
    
    .avatar-upload {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 2px dashed #dcdfe6;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: #909399;
      font-size: 12px;
      
      .el-icon {
        font-size: 24px;
        margin-bottom: 5px;
      }
      
      &:hover {
        border-color: #409EFF;
        color: #409EFF;
      }
    }
  }
  
  .avatar-upload-tip {
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
  }
  
  .voice-options {
    display: flex;
    flex-direction: column;
    gap: 15px;
    
    .voice-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      
      &.active {
        border-color: #409EFF;
        background-color: #ecf5ff;
      }
      
      .voice-option-left {
        display: flex;
        align-items: center;
        
        .voice-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 15px;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        
        .voice-info {
          .voice-name {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 5px;
          }
          
          .voice-desc {
            font-size: 12px;
            color: #606266;
            line-height: 1.5;
          }
        }
      }
    }
  }
}

.creation-footer {
  padding: 15px;
  display: flex;
  justify-content: center;
  background-color: white;
  box-shadow: 0 -1px 4px rgba(0,0,0,0.05);
  width: 100%;
  
  .el-button {
    width: 200px;
  }
}

/* 成功页面样式 */
.success-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  
  .success-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #67C23A;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
    box-shadow: 0 0 15px rgba(103, 194, 58, 0.3);
    
    .el-icon {
      color: white;
      font-size: 40px;
    }
  }
  
  .success-title {
    font-size: 22px;
    color: #303133;
    margin-bottom: 40px;
  }
  
  .success-actions {
    display: flex;
    gap: 20px;
    
    .el-button {
      min-width: 160px;
    }
  }
}

.creation-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style> 