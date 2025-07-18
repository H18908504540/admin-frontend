<script setup lang="ts">
// import { ref, computed } from 'vue'
import { onMounted, ref } from 'vue'
import AppSidebar from '../../components/AppSidebar.vue';
import AppHeader from '../../components/AppHeader.vue';
import TabNavigation from '../../components/TabNavigation.vue';
import { useRouter } from 'vue-router';
import { useTabsStore } from '../../stores/tabs';

const router = useRouter()
const tabsStore = useTabsStore()
// const tagsViewStore = useTagsViewStore();
// const cachedViews = computed(() => tagsViewStore.cachedViews);
const cachedViews = ref<string[]>([]);

const isCollapse = ref(false);

const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value;
};


onMounted(() => {
    // 初始化时，将当前路由添加到标签页中
    tabsStore.addTab(router.currentRoute.value)
})

</script>

<template>
    <el-container class="admin-layout-container">
        <el-aside :width="isCollapse ? '64px' : '200px'" class="admin-aside">
            <AppSidebar :is-collapse="isCollapse" />
        </el-aside>

        <el-container>
            <el-header class="admin-header">
                <AppHeader :is-collapse="isCollapse" @toggle-collapse="toggleCollapse" />
                <TabNavigation />
            </el-header>
            <el-main class="admin-main">
                <router-view v-slot="{ Component, route }">
                    <transition name="fade-transform" mode="out-in">
                        <keep-alive :include="cachedViews">
                            <component :is="Component" :key="route.path" />
                        </keep-alive>
                    </transition>
                </router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<style lang="less">
// 布局容器
.admin-layout-container {
    height: 100vh;

    // 侧边栏
    .admin-aside {
        background-color: #304156;
        transition: width 0.28s;
        overflow-x: hidden;
    }

    // 顶部导航栏
    .admin-header {
        background-color: #fff;
        display: flex;
        flex-direction: column;
        height: 100px;
        padding: 0 15px;
    }

    // 主内容区
    .admin-main {
        background-color: #f0f2f5;
        padding: 20px;
        overflow-y: auto;
    }
}

// 暗黑模式样式
html.dark .admin-layout-container {
    // 顶部导航栏暗黑模式
    .admin-header {
        background-color: #1f2937;
        border-bottom: 1px solid #374151;
    }

    // 主内容区暗黑模式
    .admin-main {
        background-color: #111827;
    }
}

// 路由切换动画 (基于 Vue Transition)
.fade-transform {
  &-leave-active,
  &-enter-active {
    transition: all 0.5s;
  }
  
  &-enter-from {
    opacity: 0;
    transform: translateX(-30px);
  }

  &-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
}
</style>