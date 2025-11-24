<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
      <div class="logo">
        <h1 v-if="!isCollapsed">医院信息管理系统</h1>
        <h1 v-else class="logo-collapsed">HIS</h1>
      </div>
      <nav class="menu">
        <router-link to="/dashboard" class="menu-item" @click="addTab('/dashboard')">
          <el-icon class="menu-icon"><House /></el-icon>
          <span class="menu-text">首页</span>
        </router-link>
        <div class="menu-group">
          <div class="menu-group-title">用户管理</div>
          <router-link to="/users/list" class="menu-item" @click="addTab('/users/list')">
            <el-icon class="menu-icon"><User /></el-icon>
            <span class="menu-text">用户列表</span>
          </router-link>
          <router-link to="/users/create" class="menu-item" @click="addTab('/users/create')">
            <el-icon class="menu-icon"><Plus /></el-icon>
            <span class="menu-text">创建用户</span>
          </router-link>
        </div>
        <div class="menu-group">
          <div class="menu-group-title">科室管理</div>
          <router-link to="/departments/list" class="menu-item" @click="addTab('/departments/list')">
            <el-icon class="menu-icon"><OfficeBuilding /></el-icon>
            <span class="menu-text">科室列表</span>
          </router-link>
          <router-link to="/departments/statistics" class="menu-item" @click="addTab('/departments/statistics')">
            <el-icon class="menu-icon"><PieChart /></el-icon>
            <span class="menu-text">科室统计</span>x
          </router-link>
        </div>
        <div class="menu-group">
          <div class="menu-group-title">挂号管理</div>
          <router-link to="/registration/list" class="menu-item" @click="addTab('/registration/list')">
            <el-icon class="menu-icon"><Document /></el-icon>
            <span class="menu-text">挂号列表</span>
          </router-link>
          <router-link to="/registration/create" class="menu-item" @click="addTab('/registration/create')">
            <el-icon class="menu-icon"><Edit /></el-icon>
            <span class="menu-text">创建挂号</span>
          </router-link>
        </div>
      </nav>
    </aside>
    
    <!-- 主要内容 -->
    <main class="main-content" :class="{ 'content-expanded': isCollapsed }">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="header-left">
          <button class="collapse-btn" @click="toggleSidebar">
          <el-icon v-if="isCollapsed"><Menu /></el-icon>
          <el-icon v-else><ArrowLeft /></el-icon>
        </button>
        </div>
        <div class="user-info">
          <el-dropdown @command="handleDropdownCommand">
            <span class="user-dropdown-trigger">
              <el-icon class="user-icon"><User /></el-icon>
              <span>管理员</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <!-- 顶部标签栏 -->
      <div class="tabs-container">
        <div class="tabs-wrapper">
          <el-dropdown
            v-for="(tab, index) in tabs"
            :key="tab.path"
            trigger="contextmenu"
            @contextmenu.native.stop
            @command="(command) => handleTabCommand(command, index)"
          >
            <div
              class="tab-item"
              :class="{ active: currentRoute === tab.path }"
              @click="switchTab(tab)"
            >
              <span class="tab-text">{{ tab.title }}</span>
              <button
                v-if="tabs.length > 1"
                class="tab-close"
                @click.stop="closeTab(index)"
                title="关闭"
              >
                <el-icon><close /></el-icon>
              </button>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="close">关闭</el-dropdown-item>
                <el-dropdown-item command="closeOther">关闭其他标签页</el-dropdown-item>
                <el-dropdown-item command="closeAll">关闭所有标签页</el-dropdown-item>
                <el-dropdown-item command="closeRight">关闭右侧标签页</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { House, User, Plus, OfficeBuilding, PieChart, Document, Edit, Menu, ArrowLeft, Close, ArrowDown, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isCollapsed = ref(false)
const currentRoute = computed(() => route.path)

// 标签页列表
const tabs = ref([
  { path: '/dashboard', title: '首页' }
])

// 菜单路径和标题映射
const menuTitleMap = {
  '/dashboard': '首页',
  '/users/list': '用户列表',
  '/users/create': '创建用户',
  '/departments/list': '科室列表',
  '/departments/statistics': '科室统计',
  '/registration/list': '挂号列表',
  '/registration/create': '创建挂号'
}

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 处理下拉菜单命令
const handleDropdownCommand = (command) => {
  switch (command) {
    case 'profile':
      // 个人中心功能，这里可以添加跳转到个人中心页面的逻辑
      router.push('/profile')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}

// 添加标签页
const addTab = (path) => {
  const existingTab = tabs.value.find(tab => tab.path === path)
  if (!existingTab && menuTitleMap[path]) {
    tabs.value.push({
      path,
      title: menuTitleMap[path]
    })
  }
}

// 切换标签页
const switchTab = (tab) => {
  router.push(tab.path)
}

// 关闭标签页
const closeTab = (index) => {
  const tabToClose = tabs.value[index]
  
  // 不允许关闭最后一个标签页
  if (tabs.value.length === 1) {
    return
  }
  
  // 移除标签页
  tabs.value.splice(index, 1)
  
  // 如果关闭的是当前活动标签页，则跳转到前一个标签页
  if (tabToClose.path === currentRoute.value) {
    const newIndex = Math.min(index, tabs.value.length - 1)
    router.push(tabs.value[newIndex].path)
  }
}

// 处理标签页命令（右键菜单）
const handleTabCommand = (command, index) => {
  switch (command) {
    case 'close':
      closeTab(index)
      break
    case 'closeOther':
      closeOtherTabs(index)
      break
    case 'closeAll':
      closeAllTabs()
      break
    case 'closeRight':
      closeRightTabs(index)
      break
  }
}

// 关闭其他标签页
const closeOtherTabs = (currentIndex) => {
  const currentTab = tabs.value[currentIndex]
  tabs.value = [currentTab]
}

// 关闭所有标签页
const closeAllTabs = () => {
  tabs.value = [{ path: '/dashboard', title: '首页' }]
  if (currentRoute.value !== '/dashboard') {
    router.push('/dashboard')
  }
}

// 关闭右侧标签页
const closeRightTabs = (currentIndex) => {
  tabs.value = tabs.value.slice(0, currentIndex + 1)
}

// 监听路由变化，自动添加标签页
onMounted(() => {
  // 监听路由变化
  router.afterEach((to) => {
    addTab(to.path)
  })
})
</script>

<style scoped>
/* 用户下拉菜单样式 */
.user-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-dropdown-trigger:hover {
  background-color: var(--el-bg-color-overlay);
}

.user-icon {
  font-size: 18px;
}

.arrow-icon {
  font-size: 14px;
  transition: transform 0.3s;
}

/* 确保下拉菜单在正确的位置显示 */
:deep(.el-dropdown-menu) {
  margin: 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: var(--el-bg-color-overlay);
}
</style>

<style>
/* 全局样式变量 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --text-placeholder: #c0c4cc;
  --border-color: #ebeef5;
  --border-light: #f0f2f5;
  --background-color: #f5f7fa;
  --sidebar-width: 240px;
  --sidebar-width-collapsed: 64px;
  --transition-speed: 0.3s;
  --box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --box-shadow-light: 0 1px 6px 0 rgba(0, 0, 0, 0.06);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  color: var(--text-primary);
  background-color: var(--background-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 通用过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-speed) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform var(--transition-speed) ease;
}

.slide-enter-from {
  transform: translateX(-20px);
}

.slide-leave-to {
  transform: translateX(20px);
}
</style>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
    width: var(--sidebar-width);
    background-color: #1a202c;
    color: white;
    height: 100%;
    overflow-y: auto;
    transition: width var(--transition-speed) ease;
    flex-shrink: 0;
    box-shadow: var(--box-shadow);
    /* border-right: 3px solid #409eff; */
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }

.sidebar.sidebar-collapsed {
  width: var(--sidebar-width-collapsed);
}

.logo {
  background: linear-gradient(135deg, #2c3e50, #1f2937);
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all var(--transition-speed) ease;
}

.logo h1 {
  margin: 0;
  font-size: 18px;
  transition: all var(--transition-speed) ease;
  background: linear-gradient(45deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-collapsed {
  font-size: 16px !important;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #ffffff;
    transition: margin-left var(--transition-speed) ease;
    border-left: 1px solid #e0e0e0;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
  }

.content-expanded {
  margin-left: 0;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h1 {
  margin: 0;
  font-size: 18px;
}

.menu {
  padding: 10px 0;
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 14px 24px;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: all 0.3s ease;
    border-left: 3px solid transparent;
  }

  .menu-item:hover {
    color: white;
    background-color: rgba(64, 158, 255, 0.1);
    border-left-color: #409eff;
  }

  .menu-item.router-link-active {
    color: white;
    background-color: #409eff;
    border-left-color: #ffffff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  }

.menu-icon {
  margin-right: 10px;
  font-size: 16px;
  width: 16px;
  height: 16px;
  text-align: center;
}

.menu-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.3s ease;
}

.sidebar-collapsed .menu-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.sidebar-collapsed .menu-group-title {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.sidebar-collapsed .menu-item {
  justify-content: center;
  padding: 12px;
}

.sidebar-collapsed .menu-icon {
  margin-right: 0;
}

.header {
  height: 60px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  box-shadow: var(--box-shadow-light);
  transition: all var(--transition-speed) ease;
}

.header-left {
  display: flex;
  align-items: center;
  margin-right: auto;
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--text-regular);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all var(--transition-speed) ease;
  margin-right: 16px;
}

.collapse-btn:hover {
  background-color: #f5f7fa;
  color: var(--primary-color);
  transform: scale(1.1);
}

.collapse-btn:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.menu-group-title {
  padding: 12px 24px 8px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  text-transform: uppercase;
}

/* 移除重复定义 */

.header {
  height: 60px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info button {
  padding: 6px 12px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 顶部标签栏样式 */
.tabs-container {
  background-color: #fff;
  border-bottom: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: var(--box-shadow-light);
  z-index: 100;
}

.tabs-wrapper {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  padding: 0 4px;
}

.tabs-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-speed) ease;
  user-select: none;
  border-radius: 4px 4px 0 0;
  margin: 0 2px;
}

.tab-item:hover {
  background-color: #f5f7fa;
  transform: translateY(-1px);
}

.tab-item.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  background-color: #ecf5ff;
  font-weight: 500;
  box-shadow: 0 -2px 4px rgba(64, 158, 255, 0.15);
}

.tab-text {
  font-size: 14px;
  transition: color var(--transition-speed) ease;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 50%;
  font-size: 12px;
  transition: all var(--transition-speed) ease;
  opacity: 0.6;
}

.tab-item:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background-color: rgba(245, 108, 108, 0.1);
  color: var(--danger-color);
  transform: scale(1.1);
}

.content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #f5f7fa;
    border: 1px solid #e0e0e0;
    margin: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }


/* 卡片样式优化 */
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: var(--box-shadow-light);
  transition: box-shadow var(--transition-speed) ease, transform var(--transition-speed) ease;
  overflow: hidden;
}

.card:hover {
  box-shadow: var(--box-shadow);
  transform: translateY(-2px);
}

/* 按钮样式优化 */
.btn {
  transition: all var(--transition-speed) ease;
  border-radius: 4px;
  box-shadow: none;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
}

/* 表单样式优化 */
.form-item {
  margin-bottom: 20px;
}

.form-item:last-child {
  margin-bottom: 0;
}

/* 表格样式优化 */
.table-wrapper {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--box-shadow-light);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background-color: #f5f7fa;
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  transition: background-color var(--transition-speed) ease;
}

.table tbody tr:hover td {
  background-color: #fafafa;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
  }

  .sidebar.sidebar-collapsed {
    transform: translateX(0);
    width: var(--sidebar-width-collapsed);
  }

  .main-content {
    margin-left: 0;
  }

  .content {
    padding: 12px;
  }
}
</style>