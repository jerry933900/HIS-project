import React from 'react';
import '../styles/globals.css';
import BottomNavigation from '../components/BottomNavigation';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  // 不需要显示底部导航的页面
  const noNavPages = ['/login', '/register'];
  const shouldShowNav = !noNavPages.includes(router.pathname);

  return (
    <>
      <Component {...pageProps} />
      {shouldShowNav && <BottomNavigation />}
    </>
  );
}