<script setup lang="ts">
import { defineProps, defineEmits, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Fold, Expand, ArrowDown, Sunny, Moon } from '@element-plus/icons-vue'; // 引入图标
import { useTabsStore } from '../stores/tabs';
import { useDark, useToggle } from '@vueuse/core';

interface Props { isCollapse: Boolean }
const props = defineProps<Props>()

const emit = defineEmits(['toggle-collapse']);

const router = useRouter();

const tabsStore = useTabsStore();

// 暗黑模式相关
const isDark = useDark();
const toggleDark = useToggle(isDark);

// 调试：监听暗黑模式变化
watch(isDark, (newValue) => {
    console.log('暗黑模式状态变化:', newValue);
    console.log('HTML 类名:', document.documentElement.className);
}, { immediate: true });

const toggle = () => {
    emit('toggle-collapse');
};

const handleCommand = (command: string | number | object) => {
    switch (command) {
        case 'profile':
            ElMessage('点击了个人中心');
            // router.push('/profile');
            break;
        case 'settings':
            ElMessage('点击了系统设置');
            // router.push('/settings');
            break;
        case 'logout':
            ElMessageBox.confirm('确定要退出登录吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(() => {
                    // 清除登录状态 (例如 Pinia store, localStorage)
                    ElMessage.success('已退出登录');
                    localStorage.removeItem('authToken');
                    tabsStore.clearTabs(); // 清空标签页
                    router.push('/login'); // 跳转到登录页
                })
                .catch(() => {
                    ElMessage.info('已取消退出');
                });
            break;
    }
};
</script>


<template>
    <div class="app-header">
        <div class="left-menu">
            <el-icon class="collapse-icon" @click="toggle">
                <component :is="props.isCollapse ? Expand : Fold" />
            </el-icon>
            <span>欢迎使用管理系统</span>
        </div>

        <div class="right-menu">
            <!-- 暗黑模式切换按钮 -->
            <el-tooltip
                effect="dark"
                :content="isDark ? '切换到亮色模式' : '切换到暗黑模式'"
                placement="bottom"
            >
                <el-button
                    :icon="isDark ? Sunny : Moon"
                    circle
                    @click="toggleDark()"
                    class="dark-mode-btn"
                    :type="isDark ? 'warning' : 'primary'"
                />
            </el-tooltip>
            
            <!-- 调试信息 -->
            <!-- <span style="margin-right: 10px; font-size: 12px;">
                {{ isDark ? '暗黑' : '亮色' }}
            </span> -->
            
            <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                    <el-avatar size="small" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                    <span class="username">Admin</span>
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                        <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                        <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<style lang="less">
.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
}

.left-menu {
    display: flex;
    align-items: center;

    .collapse-icon {
        font-size: 20px;
        cursor: pointer;
        margin-right: 15px;
    }
}

.right-menu {
    display: flex;
    align-items: center;
    gap: 12px;

    .dark-mode-btn {
        margin-right: 8px;
    }

    .el-dropdown-link {
        cursor: pointer;
        display: flex;
        align-items: center;

        .el-avatar {
            margin-right: 8px;
        }

        .username {
            margin-right: 5px;
        }
    }
}

// AppHeader 暗黑模式样式
html.dark .app-header {
    color: #e5e7eb;
    
    .left-menu {
        span {
            color: #e5e7eb;
        }
        
        .collapse-icon {
            color: #e5e7eb;
        }
    }
    
    .right-menu {
        .el-dropdown-link {
            .username {
                color: #e5e7eb;
            }
        }
    }
}
</style>