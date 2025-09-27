<template>
  <div class="public-device-container">
    <!-- 主要内容区域 - 全屏显示 -->
    <div class="public-device-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
// 简化的容器组件，只负责路由视图的显示
</script>

<style lang="scss" scoped>
.public-device-container {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 主要内容区域样式 - 全屏显示 */
.public-device-content {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow: auto;
}
</style>
