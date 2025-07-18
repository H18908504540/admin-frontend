<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { House, Setting, User, Key } from '@element-plus/icons-vue'; // 引入图标

defineProps({
    isCollapse: {
        type: Boolean,
        required: true,
    },
});

const route = useRoute();
const router = useRouter();

const activeMenu = computed(() => {
    const { meta, path } = route;
    // if set path, the sidebar will highlight the path you set
    if (meta.activeMenu) {
        return meta.activeMenu as string;
    }
    return path;
});

const goHome = () => {
    router.push('/admin/dashboard');
};
</script>

<template>
    <div class="sidebar-container">
        <div class="logo-container" @click="goHome">
            <!-- <img src="@/assets/logo.svg" alt="Logo" class="sidebar-logo" v-if="!isCollapse" />
            <img src="@/assets/logo-small.svg" alt="Logo" class="sidebar-logo-small" v-else /> -->
            <h1 v-if="!isCollapse" class="sidebar-title">管理系统</h1>
        </div>
        <el-scrollbar wrap-class="scrollbar-wrapper">
            <el-menu 
                :default-active="activeMenu" 
                class="el-menu-vertical" 
                :collapse="isCollapse"
                background-color="#304156" 
                text-color="#bfcbd9" 
                active-text-color="#409EFF" 
                :unique-opened="true"
                :collapse-transition="false" 
                mode="vertical" 
                router
            >
                <el-menu-item index="/admin/dashboard">
                    <el-icon>
                        <House />
                    </el-icon>
                    <template #title>仪表盘</template>
                </el-menu-item>

                <el-sub-menu index="/admin/management">
                    <template #title>
                        <el-icon>
                            <Setting />
                        </el-icon>
                        <span>系统管理</span>
                    </template>
                    <el-menu-item index="/admin/users">
                        <el-icon>
                            <User />
                        </el-icon>
                        用户管理
                    </el-menu-item>
                    <el-menu-item index="/admin/roles">
                        <el-icon>
                            <Key />
                        </el-icon>
                        角色管理
                    </el-menu-item>
                </el-sub-menu>
            </el-menu>
        </el-scrollbar>
    </div>
</template>

<style lang="less" scoped>
.sidebar-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.logo-container {
    height: 50px; // 与 Header 高度一致或自定义
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b2f3a; // Logo 背景色
    cursor: pointer;
    padding: 0 10px;
    overflow: hidden; // 防止文字溢出

    .sidebar-logo {
        width: 32px;
        height: 32px;
        vertical-align: middle;
        margin-right: 12px;
    }

    .sidebar-logo-small {
        width: 32px;
        height: 32px;
        vertical-align: middle;
    }

    .sidebar-title {
        color: #fff;
        font-weight: 600;
        font-size: 18px;
        margin: 0;
        white-space: nowrap; // 防止标题换行
    }
}

.el-scrollbar {
    flex-grow: 1; // 让滚动区域填满剩余空间

    .scrollbar-wrapper {
        overflow-x: hidden !important; // 隐藏横向滚动条
    }
}

.el-menu {
    border-right: none; // 去掉 el-menu 默认的右边框
}

// 修复折叠时 icon 和 title 的对齐问题 (如果需要)
.el-menu--collapse {

    :deep(.el-sub-menu__title span),
    :deep(.el-menu-item span) {
        display: none;
    }

    :deep(.el-sub-menu__title .el-sub-menu__icon-arrow) {
        display: none;
    }
}
</style>