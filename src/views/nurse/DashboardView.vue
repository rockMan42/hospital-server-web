<template>
  <!-- 护士母模板页 -->
  <div class="nurse-home-container">
    <!-- 侧边栏 -->
    <SideLeft />
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 头部 -->
      <TopNavbar :title="currentTitle" />
      <!-- 主要内容区 -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import SideLeft from "@/components/nurse/SideLeft.vue";
import TopNavbar from "@/components/nurse/TopNavbar.vue";

const route = useRoute();
const currentTitle = ref("护士工作台");

// 监听路由变化，更新标题
watch(
  () => route.meta.title,
  (newTitle) => {
    console.log("路由变化，新的标题：", newTitle);
    if (newTitle) {
      currentTitle.value = newTitle;
    } else {
      currentTitle.value = "护士工作台"; // 默认标题
    }
  },
  { immediate: true }
); // 立即执行一次
</script>

<style lang="scss" scoped>
body {
  background-color: #f5f7fa;
  color: #303133;
}

.nurse-home-container {
  display: flex;
  min-height: 100vh;
}

/* 主内容区域样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
