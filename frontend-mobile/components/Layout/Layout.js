import React, { useEffect, useRef } from "react";
import styles from "./Layout.module.css";
import Navigation from "./Navigation";
import TopNav from "./TopNav";
import { useRouter } from "next/router";

const Layout = ({
  children,
  title,
  showBackButton = true,
  backLink = "/",
  rightIcon = null,
  rightAction = null,
  gradientColors = ["#ffffff", "#fafafa"],
}) => {
  const router = useRouter();
  const pathname = router.pathname;
  const mainRef = useRef(null);

  // 首页、预约、个人中心、在线咨询和咨询聊天页面不需要显示TopNav
  const noTopNavPages = [
    "/",
    "/appointments",
    "/appointment",
    "/profile",
    "/consultations",
    "/reports",
    "/statistics",
  ];
  const shouldShowTopNav = !noTopNavPages.includes(pathname) && !pathname.startsWith("/consultation-chat/");

  // 动态调整main的padding-top，适配新的TopNav高度
  useEffect(() => {
    if (mainRef.current) {
      if (shouldShowTopNav) {
        // 为显示TopNav的页面添加padding-top，适配新的56px高度
        mainRef.current.style.paddingTop = "72px"; // 56px + 16px 间距
      } else {
        // 为不显示TopNav的页面恢复默认padding
        mainRef.current.style.paddingTop = "16px";
      }
    }
  }, [shouldShowTopNav]);

  return (
    <div className={styles.container}>
      {shouldShowTopNav && (
        <TopNav
          title={title}
          showBackButton={showBackButton}
          backLink={backLink}
          rightIcon={rightIcon}
          rightAction={rightAction}
          gradientColors={gradientColors}
        />
      )}
      <main className={styles.main} ref={mainRef}>
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
