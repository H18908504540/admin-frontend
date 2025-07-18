<template>
    <div class="tab-navigation-container">
        <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange" @tab-remove="handleTabRemove" closable>
            <el-tab-pane v-for="item in tabsList" :key="item.path" :label="item.title" :name="item.path"
                :closable="item.closable"></el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTabsStore } from '../stores/tabs';

const router = useRouter();
const tabsStore = useTabsStore();

// computed同步pinia中的activeTab和tabsList
const activeTab = computed(() => tabsStore.activeTab);

const tabsList = computed(() => tabsStore.tabsList)

// 处理标签页切换
const handleTabChange = (path: string) => {
    router.push(path)
}

// 处理标签页关闭
const handleTabRemove = (path: string) => {
    tabsStore.removeTab(path, router)
}
</script>

<style lang="less">
.tab-navigation-container {
    background-color: #fff;
    border-bottom: 1px solid #e4e7ed;
}

// 暗黑模式下的标签栏样式
html.dark .tab-navigation-container {
    background-color: #1f2937;
    border-bottom: 1px solid #374151;
}

// 彻底清除 El-Tabs Card 模式的默认样式
:deep(.el-tabs--card) {
    .el-tabs__header {
        border-bottom: none;
        /* 移除 El-Tabs Header 默认的底部边框 */
        margin-bottom: 8px;
        /* 移除默认外边距 */
    }

    .el-tabs__nav {
        border: none;
        /* 移除导航条的边框 */
        display: flex;
        /* 让标签项 flex 排列 */
        gap: 8px;
        /* 添加间距 */
        /* 额外的清除，确保没有背景或盒阴影残留 */
        background: none;
        box-shadow: none;
    }

    .el-tabs__item {
        height: 28px !important;
        /* 调整标签页高度 */
        line-height: 38px !important;
        /* 垂直居中文字 */
        font-size: 14px;
        /* 调整字体大小 */
        padding: 0 20px;
        /* 调整内边距 */
        border: 1px solid #dcdfe6;
        /* 添加边框 */
        border-radius: 4px;
        /* 轻微圆角 */
        background-color: #f5f7fa;
        /* 默认背景色 */
        position: relative;
        z-index: 1;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

        /* 确保移除 card 模式下可能存在的背景图像或渐变 */
        background-image: none !important;

        /* 确保移除 card 模式下可能存在的 box-shadow */
        box-shadow: none !important;

        /* 确保移除 card 模式下可能存在的其他边框样式 */
        border-top: 1px solid #dcdfe6 !important;
        border-left: 1px solid #dcdfe6 !important;
        border-right: 1px solid #dcdfe6 !important;
        border-bottom: 1px solid #dcdfe6 !important;


        &.is-active {
            background-color: #ffffff;
            /* 激活标签页背景色 */
            border-color: var(--el-color-primary);
            /* 激活标签页边框颜色 */
            color: var(--el-color-primary);
            /* 激活标签页文字颜色 */
            z-index: 2;
            /* 确保激活状态下的背景和边框完全覆盖默认样式 */
            background-image: none !important;
            box-shadow: none !important;
            border-top: 1px solid var(--el-color-primary) !important;
            border-right: 1px solid var(--el-color-primary) !important;
            border-bottom: 1px solid var(--el-color-primary) !important;
            border-left: 1px solid var(--el-color-primary) !important;
        }

        &:hover:not(.is-active) {
            color: var(--el-color-primary);
            background-color: #f0f2f5;
        }

        .is-closable .el-icon {
            width: 1em;
            height: 1em;
            vertical-align: middle;
            cursor: pointer;
            margin-left: 8px;
            color: #909399;
            transition: all 0.3s;

            &:hover {
                color: var(--el-color-primary);
                transform: scale(1.2);
            }
        }
    }

    // 移除默认的底部下划线（在card模式下可能存在）
    .el-tabs__active-bar {
        display: none !important;
        /* 使用 !important 确保覆盖 */
    }

    // 确保 el-tab-pane 自身没有默认的 padding 或 border
    .el-tab-pane {
        padding: 0 !important;
        /* 清除默认内边距 */
        background: none !important;
        /* 清除默认背景 */
        border: none !important;
        /* 清除默认边框 */
    }
}

// 暗黑模式下的标签项样式
html.dark :deep(.el-tabs--card) {
    .el-tabs__item {
        background-color: #374151;
        border-color: #4b5563;
        color: #d1d5db;
        
        border-top: 1px solid #4b5563 !important;
        border-left: 1px solid #4b5563 !important;
        border-right: 1px solid #4b5563 !important;
        border-bottom: 1px solid #4b5563 !important;

        &.is-active {
            background-color: #1f2937;
            border-color: var(--el-color-primary);
            color: var(--el-color-primary);
            
            border-top: 1px solid var(--el-color-primary) !important;
            border-right: 1px solid var(--el-color-primary) !important;
            border-bottom: 1px solid var(--el-color-primary) !important;
            border-left: 1px solid var(--el-color-primary) !important;
        }

        &:hover:not(.is-active) {
            background-color: #4b5563;
            color: #e5e7eb;
        }
    }
}
</style>