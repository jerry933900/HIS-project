import React from 'react';
import styles from './Layout.module.css';
import Navigation from './Navigation';

const Layout = ({ children }) => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;