import React, { useState, useEffect } from 'react';
import styles from './BannerCarousel.module.css';

/**
 * 轮播图组件 - 支持SSR的响应式轮播展示
 * 
 * @param {Object} props - 组件属性
 * @param {Array} props.banners - 轮播图数据数组
 * @param {number} props.autoPlayInterval - 自动播放间隔（毫秒）
 * @returns {JSX.Element}
 */
const BannerCarousel = ({ banners = [], autoPlayInterval = 5000 }) => {
  // 在客户端使用useState，服务端渲染时默认为0
  const [currentIndex, setCurrentIndex] = useState(0);

  // 仅在客户端执行的自动播放逻辑
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [banners.length, autoPlayInterval]);

  // 如果没有数据，显示占位内容
  if (!banners || banners.length === 0) {
    return (
      <div className={styles.bannerContainer}>
        <div className={styles.placeholderBanner}>加载中...</div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.banner}>
        <img 
          src={currentBanner.image} 
          alt={currentBanner.title} 
          className={styles.bannerImage}
          // 优化图片加载
          loading="eager" // 在SSR环境下优先加载
        />
        <div className={styles.bannerContent}>
          <h3 className={styles.bannerTitle}>{currentBanner.title}</h3>
          <p className={styles.bannerDescription}>{currentBanner.description}</p>
        </div>
      </div>
      
      {/* 轮播指示器 */}
      {banners.length > 1 && (
        <div className={styles.bannerIndicators}>
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              className={index === currentIndex ? styles.activeIndicator : styles.indicator}
              onClick={() => setCurrentIndex(index)}
              aria-label={`切换到轮播图 ${index + 1}`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;