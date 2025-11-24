import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/layout/Layout.vue'
import authGuard from '../utils/authGuard'

const routes = [
  {
    path: '/login',
    name: 'Login',
    meta: { title: '登录' },
    component: () => import('../views/login/Login.vue')
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        meta: { title: '首页', requiresAuth: true },
        component: () => import('../views/dashboard/Dashboard.vue')
      }
    ]
  },
  {
    path: '/users',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'list',
        name: 'UserList',
        meta: { title: '用户管理' },
        component: () => import('../views/users/UserList.vue')
      },
      {
        path: 'create',
        name: 'UserCreate',
        meta: { title: '创建用户' },
        component: () => import('../views/users/UserForm.vue')
      },
      {
        path: 'edit/:id',
        name: 'UserEdit',
        meta: { title: '编辑用户' },
        component: () => import('../views/users/UserForm.vue')
      }
    ]
  },
  {
    path: '/departments',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'list',
        name: 'DepartmentList',
        meta: { title: '科室管理' },
        component: () => import('../views/departments/DepartmentList.vue')
      },
      {
        path: 'statistics',
        name: 'DepartmentStatistics',
        meta: { title: '科室统计' },
        component: () => import('../views/departments/DepartmentStatistics.vue')
      }
    ]
  },
  {    path: '/registration',    component: Layout,    meta: { requiresAuth: true },    children: [      {        path: 'list',        name: 'RegistrationList',        meta: { title: '挂号管理' },        component: () => import('../views/registration/RegistrationList.vue')      },      {        path: 'create',        name: 'RegistrationCreate',        meta: { title: '创建挂号' },        component: () => import('../views/registration/RegistrationForm.vue')      }    ]  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/error/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 医院信息管理系统` : '医院信息管理系统'
  
  // 认证守卫
  if (to.meta.requiresAuth) {
    authGuard(to, from, next)
  } else {
    next()
  }
})

export default router