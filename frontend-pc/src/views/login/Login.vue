<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-header">
        <h2>医院信息管理系统</h2>
        <p>请输入您的账号信息</p>
      </div>
      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            autocomplete="off"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
          <el-link type="primary" :underline="false" class="forgot-password">
            忘记密码？
          </el-link>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/user'
import { User, Lock } from '@element-plus/icons-vue'

export default {
  name: 'Login',
  components: {
    User,
    Lock
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const loginFormRef = ref()
    const loading = ref(false)
    
    // 登录表单数据
    const loginForm = reactive({
      username: '',
      password: '',
      rememberMe: false
    })
    
    // 表单验证规则
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ]
    }
    
    // 处理登录
    const handleLogin = async () => {
      // 验证表单
      await loginFormRef.value.validate().catch(() => {
        return
      })
      
      loading.value = true
      
      try {
        // 调用登录接口
        const response = await userStore.doLogin(loginForm.username, loginForm.password)
        console.log('登录成功', response)
        
        // 记住用户名
        if (loginForm.rememberMe) {
          localStorage.setItem('rememberedUsername', loginForm.username)
        } else {
          localStorage.removeItem('rememberedUsername')
        }
        
        // 登录成功提示
        ElMessage.success('登录成功')
        
        // 处理重定向，确保正确跳转
        const redirectPath = route.query.redirect ? String(route.query.redirect) : '/dashboard'
        // 使用setTimeout确保状态已更新后再跳转
        setTimeout(() => {
          router.push(redirectPath).then(() => {
            console.log('成功跳转到:', redirectPath)
          }).catch(error => {
            console.error('跳转失败:', error)
            // 失败时尝试直接跳转到dashboard
            router.push('/dashboard')
          })
        }, 100)
      } catch (error) {
        console.error('登录失败', error)
        // 登录失败，显示错误信息
        ElMessage.error(userStore.error || '登录失败，请重试')
      } finally {
        loading.value = false
      }
    }
    
    // 组件挂载时，检查是否有记住的用户名
    onMounted(() => {
      const rememberedUsername = localStorage.getItem('rememberedUsername')
      if (rememberedUsername) {
        loginForm.username = rememberedUsername
        loginForm.rememberMe = true
      }
    })
    
    return {
      loginFormRef,
      loginForm,
      rules,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form-wrapper {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #303133;
  font-size: 24px;
  margin-bottom: 10px;
}

.login-header p {
  color: #909399;
  font-size: 14px;
}

.login-form {
  width: 100%;
}

.login-form .el-form-item {
  margin-bottom: 24px;
}

.forgot-password {
  float: right;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}
</style>