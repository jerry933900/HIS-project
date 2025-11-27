import React, { useEffect } from 'react';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from '../store';
import { getUserInfo } from '../store/userSlice';
import Layout from '../components/Layout/Layout';

// 用于在页面加载时检查用户登录状态的组件
function UserAuthWrapper({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.user);
  
  useEffect(() => {
    // 检查是否有token，如果有则获取用户信息
    const savedToken = localStorage.getItem('token');
    if (savedToken && !userInfo) {
      dispatch(getUserInfo());
    }
    
    // 简单的路由保护：如果不是登录页面且没有token，则跳转到登录页
    const protectedRoutes = ['/'];
    if (!savedToken && protectedRoutes.includes(router.pathname)) {
      router.push('/login');
    }
  }, [router.pathname, dispatch, userInfo]);
  
  return children;
}

// 主应用组件
function AppContent({ Component, pageProps }) {
  const router = useRouter();
  
  // 不需要显示导航的页面
  const noNavPages = ['/login'];
  const shouldShowNav = !noNavPages.includes(router.pathname);

  // 根据当前页面设置TopNav标题
  const getPageTitle = () => {
    const pageTitles = {
      '/': '首页',
      '/popular-departments': '热门科室',
      '/departments': '科室导航',
      '/doctors': '医生列表',
      '/appointment': '预约挂号',
      '/appointment-records': '预约记录',
      '/consultations': '在线咨询',
      '/reports': '检查报告',
      '/profile': '个人中心',
      '/statistics': '数据统计',
      '/appointments': '预约管理',
      '/patients': '患者管理'
    };
    return pageTitles[router.pathname] || '医院信息系统';
  };

  return (
    <UserAuthWrapper>
      {shouldShowNav ? (
        <Layout title={getPageTitle()}>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
    </UserAuthWrapper>
  );
}

// 导出包装了Redux Provider的应用组件
export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <AppContent Component={Component} pageProps={pageProps} />
    </Provider>
  );
}