<template>
  <div class="sidebar-container" :class="{ 'has-logo': themeConfig.showLogo }">
    <div class="sidebar-logo-container">
      <router-link to="/" class="sidebar-logo-link">
        <div class="logo-wrapper">
          <img src="@/assets/em-power-logo.png" alt="logo" />
        </div>
      </router-link>
    </div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        background-color="#304156"
        text-color="#bfcbd9"
        :unique-opened="SettingStore.themeConfig.uniqueOpened"
        :collapse-transition="false"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
      >
        <SubItem v-for="route in permission_routes" :key="route.path" :item="route" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
  import SubItem from '../SubMenu/SubItem.vue'
  import { useSettingStore } from '@/store/modules/setting'
  import { usePermissionStore } from '@/store/modules/permission'
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  // 在setup中获取store
  const route = useRoute()
  const PermissionStore = usePermissionStore()
  const SettingStore = useSettingStore()

  // 是否折叠
  const isCollapse = computed(() => !SettingStore.isCollapse)
  // 设置
  const themeConfig = computed(() => SettingStore.themeConfig)

  // 获取路由
  const permission_routes = computed(() => PermissionStore.permission_routes)

  const activeMenu = computed(() => {
    const { meta, path } = route
    if (meta.activeMenu) {
      return meta.activeMenu
    }
    return path
  })
</script>

<style lang="scss">
  .sidebar-logo-container {
    padding: 10px 0;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
  }
  
  .sidebar-logo-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    
    .logo-wrapper {
      width: 80%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }
  }
  
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    height: 100%;
  }
</style>
