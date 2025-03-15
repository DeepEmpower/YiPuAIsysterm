<template>
  <el-config-provider :size="globalComSize" :locale="zhCn">
    <router-view></router-view>
  </el-config-provider>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useSettingStore } from '@/store/modules/setting'
  // 配置element中文
  import zhCn from 'element-plus/es/locale/lang/zh-cn'

  const SettingStore = useSettingStore()
  // 配置全局组件大小
  const globalComSize = computed((): string => SettingStore.themeConfig.globalComSize)
</script>

<style lang="scss">
  #app {
    position: relative;
    width: 100%;
    height: 100%;
    font-family: Avenir, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    
    // 使用 !important 强制应用侧边栏样式
    --sidebar-bg-color: #ffffff !important;
    --sidebar-text-color: #000000 !important;
    --sidebar-active-bg: #f0f2ff !important;
    --sidebar-active-text: #6366f1 !important;
    --sidebar-hover-bg: #f5f7ff !important;
    
    --chat-primary-color: #6366f1; // 蓝紫色
    --chat-bg-color: #f5f7ff;
    --chat-border-color: #e0e3ff;
  }
  
  // 直接添加强制覆盖
  .sidebar-container, .sidebar-container .el-menu {
    background-color: #ffffff !important;
  }
  
  // 强制所有菜单项文字为黑色
  .el-menu-item,
  .el-submenu__title,
  .el-sub-menu__title,
  .el-menu-item span,
  .el-submenu__title span {
    color: #000000 !important;
  }
  
  // 强制所有图标为黑色
  .el-menu .svg-icon,
  .el-menu [class^="el-icon-"],
  .el-menu .sub-el-icon {
    color: #000000 !important;
  }
  
  // 强制子菜单箭头为黑色
  .el-submenu__icon-arrow {
    color: #000000 !important;
  }
  
  .sidebar-container .el-menu-item.is-active {
    color: #6366f1 !important;
    background-color: #f0f2ff !important;
  }
  
  .el-pager li:focus {
    border: none;
  }
  .el-dropdown:focus {
    border: none;
  }
  .svg-icon:focus {
    border: none;
  }
</style>
