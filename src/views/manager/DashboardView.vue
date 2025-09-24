<template>
  <!-- 管理员母模板页 -->
  <div class="manager-home-container">
    <!-- 侧边栏 -->
    <SideLeft />
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 头部 -->
      <AdminHeader 
        :title="currentTitle"
        :notification-count="2"
        @notification-click="handleNotificationClick"
        @profile-click="handleProfileClick"
        @settings-click="handleSettingsClick"
      />
      <!-- 主要内容区 -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import SideLeft from "@/components/manager/SideLeft.vue";
import AdminHeader from "@/components/manager/AdminHeader.vue";

const route = useRoute();
const currentTitle = ref("管理员工作台");

// 监听路由变化，更新标题
watch(
  () => route.meta.title,
  (newTitle) => {
    console.log("路由变化，新的标题：", newTitle);
    if (newTitle) {
      currentTitle.value = newTitle;
    } else {
      currentTitle.value = "管理员工作台"; // 默认标题
    }
  },
  { immediate: true }
); // 立即执行一次

// 事件处理函数
const handleNotificationClick = () => {
  console.log('通知点击');
};

const handleProfileClick = () => {
  console.log('个人资料点击');
};

const handleSettingsClick = () => {
  console.log('设置点击');
};
</script>

<style lang="scss" scoped>
body {
  background-color: #f5f7fa;
  color: #303133;
}

.manager-home-container {
  display: flex;
  min-height: 100vh;
}

/* 主内容区域样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 72px; // 为AdminHeader留出空间
}
</style>
