<template>
  <div class="not-found">
    <div class="error-container">
      <div class="error-code">404</div>
      <div class="error-message">页面不存在</div>
      <p class="error-description">抱歉，您访问的页面不存在或已被移除</p>
      <el-button type="primary" @click="goBackHome">返回首页</el-button>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue'

export default {
  name: 'NotFound',
  setup() {
    const router = useRouter()
    
    const goBackHome = () => {
      router.push('/')
    }
    
    return {
      goBackHome
    }
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.error-container {
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #f56c6c;
  line-height: 1;
  margin-bottom: 20px;
}

.error-message {
  font-size: 24px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
}

.error-description {
  color: #909399;
  margin-bottom: 30px;
}
</style>