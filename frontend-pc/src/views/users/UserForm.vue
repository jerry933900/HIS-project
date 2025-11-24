<template>
  <div class="user-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑用户' : '创建用户' }}</span>
        </div>
      </template>
      
      <el-form
        :model="userForm"
        :rules="rules"
        ref="userFormRef"
        label-width="120px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="密码" :prop="isEdit ? undefined : 'password'">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            :disabled="isEdit"
            show-password
          />
          <div v-if="isEdit" class="form-tip">编辑时无需输入密码，留空则保持原密码</div>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="管理员" />
            <el-option label="医生" value="医生" />
            <el-option label="护士" value="护士" />
            <el-option label="普通用户" value="普通用户" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="启用" />
            <el-radio label="禁用" />
          </el-radio-group>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="goBack">返回列表</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'UserForm',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userFormRef = ref()
    const userId = route.params.id
    
    // 判断是否为编辑模式
    const isEdit = computed(() => !!userId)
    
    // 表单数据
    const userForm = reactive({
      username: '',
      name: '',
      password: '',
      email: '',
      phone: '',
      role: '',
      status: '启用'
    })
    
    // 表单验证规则
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 1, max: 20, message: '姓名长度在 1 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: !isEdit.value, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ],
      role: [
        { required: true, message: '请选择角色', trigger: 'change' }
      ],
      status: [
        { required: true, message: '请选择状态', trigger: 'change' }
      ]
    }
    
    // 获取用户信息（编辑模式）
    const getUserInfo = () => {
      // 模拟获取用户数据
      userForm.username = 'testuser'
      userForm.name = '测试用户'
      userForm.email = 'test@example.com'
      userForm.phone = '13800138000'
      userForm.role = '医生'
      userForm.status = '启用'
    }
    
    // 提交表单
    const submitForm = async () => {
      try {
        await userFormRef.value.validate()
        // 模拟提交数据
        setTimeout(() => {
          ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
          router.push('/users/list')
        }, 500)
      } catch (error) {
        console.error('表单验证失败:', error)
      }
    }
    
    // 重置表单
    const resetForm = () => {
      userFormRef.value.resetFields()
    }
    
    // 返回列表
    const goBack = () => {
      router.push('/users/list')
    }
    
    onMounted(() => {
      if (isEdit.value) {
        getUserInfo()
      }
    })
    
    return {
      userFormRef,
      userForm,
      rules,
      isEdit,
      submitForm,
      resetForm,
      goBack
    }
  }
}
</script>

<style scoped>
.user-form {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}
</style>