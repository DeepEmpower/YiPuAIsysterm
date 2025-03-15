<template>
  <div class="sidebar-logo-container" :class="{ collapse: collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        v-if="collapse"
        key="collapse"
        class="sidebar-logo-link"
        to="/"
      >
        <img src="../../assets/em-power-logo.png" class="sidebar-logo" alt="logo" />
      </router-link>
      <router-link
        v-else
        key="expand"
        class="sidebar-logo-link"
        to="/"
      >
        <img src="../../assets/em-power-logo.png" class="sidebar-logo-full" alt="logo" />
      </router-link>
    </transition>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: var(--sidebar-bg-color);
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  & .sidebar-logo {
    height: 32px;
    margin-right: 0;
  }

  & .sidebar-logo-full {
    height: 32px;
    max-width: 180px;
    margin-right: 0;
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0;
    }
  }
}
</style> 