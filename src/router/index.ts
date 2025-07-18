import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useTabsStore } from '../stores/tabs';



const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('../layout/admin/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'admin/dashboard', // 注意这里，相对于父路径 '/'
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardView.vue'),
        meta: { title: '仪表盘', icon: 'House', requiresAuth: true, closable: false, inTab: true } // requiresAuth 用于导航守卫
      },
      {
        path: 'admin/users', // 注意这里，相对于父路径 '/'
        name: 'Users',
        component: () => import('../views/management/Users.vue'),
        meta: { title: '用户管理', requiresAuth: true, closable: true, inTab: true } // requiresAuth 用于导航守卫
      },
    ]
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/LoginView.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'GlobalNotFound',
    component: () => import('../views/NotFoundView.vue'), // 指向 NotFoundView 组件
    meta: { title: '页面未找到' }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    // 路由切换时，滚动到页面顶部
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// 导航守卫 (重要: 用于实现登录验证和页面权限)
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '管理系统'}`; // 设置页面标题

  const isAuthenticated = !!localStorage.getItem('authToken'); // 假设 token 存储在 localStorage

  if (to.meta.requiresAuth && !isAuthenticated) {
    // 如果目标路由需要认证，但用户未认证
    ElMessage.warning('请先登录');
    next({ name: 'Login', query: { redirect: to.fullPath } }); // 跳转到登录页，并带上重定向参数
  } else if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    // 如果用户已认证，但试图访问登录或注册页
    next({ path: '/admin/dashboard' }); // 重定向到仪表盘
  }
  else {
    next(); // 正常导航
  }
});

 router.afterEach((to,) => {
    const tabsStore = useTabsStore()
    if (to.name && to.meta && to.meta.inTab) {
      tabsStore.addTab(to)
    }
  })

export default router;