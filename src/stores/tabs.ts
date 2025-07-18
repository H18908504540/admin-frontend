import { defineStore } from "pinia";
import { type RouteLocationNormalizedLoaded } from "vue-router";

// 定义标签页的类型
export interface TabItem {
    name: string;
    title: string;
    path: string;
    closable: boolean;
}

export const useTabsStore = defineStore('tabs', {
    state: () => ({
        // tabsList 数组存储所有打开的标签页信息
        // 每个对象包含：name(唯一标识)，title(显示名称)，path(路由路径),closable(是否可关闭)
        tabsList: [] as TabItem[],
        activeTab: '', // 存储当前激活的标签页的path
    }),
    actions: {
        // 添加标签页
        addTab(route: RouteLocationNormalizedLoaded) {
            // 检查标签页是否已存在
            const existingTab = this.tabsList.find(tab => tab.path === route.path);
            if (!existingTab) {
                this.tabsList.push({
                    name: route.name as string,
                    path: route.path,
                    title: route.meta.title as string || route.name as string,
                    closable: route.meta.closable as boolean ?? true
                })
            }
            this.activeTab = route.path
        },

        // 关闭标签页
        removeTab(path: string, router: any) {
            const index = this.tabsList.findIndex(tab => tab.path === path)
            if (index !== -1) {
                this.tabsList.splice(index, 1)

                // 如果关闭的是当前激活的标签页
                if (this.activeTab === path) {
                    // 尝试激活前一个标签页，如果没有则激活后一个，最后都没有则回到首页
                    if (this.tabsList.length > 0) {
                        const nextActiveTab = this.tabsList[index - 1] || this.tabsList[0]
                        if (nextActiveTab) {
                            this.activeTab = nextActiveTab.path
                            router.push(nextActiveTab.path)
                        } else {
                            // 所有标签都关闭了，回到首页
                            this.activeTab = '/'
                            router.push('/')
                        }
                    } else {
                        // 所有标签都关闭了，回到首页
                        this.activeTab = '/'
                        router.push('/')
                    }
                }
            }
        },


        // 清空标签页
        clearTabs() {
            this.tabsList = []
        }
    },

    // 配置持久化
    persist: {
        key: 'tab-navigation-state', // 存储在 localStorage 中的 key
        storage: localStorage, // 使用 localStorage 进行存储
        pick: ['tabsList', 'activeTab'] // 指定哪些 state 字段需要被持久化
    }
})