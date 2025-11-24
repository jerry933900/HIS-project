<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="createUser">
            <el-icon><plus /></el-icon>
            <span>新增用户</span>
          </el-button>
        </div>
      </template>
      
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="id" label="用户ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="editUser(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deleteUser(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'UserList',
  components: {
    Plus
  },
  setup() {
    const router = useRouter()
    const users = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    
    // 模拟获取用户列表数据
    const fetchUsers = () => {
      // 模拟数据
      users.value = [
        { id: 1, username: 'admin', name: '管理员', email: 'admin@example.com', phone: '13800138000', role: '管理员', status: '启用' },
        { id: 2, username: 'doctor', name: '医生', email: 'doctor@example.com', phone: '13900139000', role: '医生', status: '启用' },
        { id: 3, username: 'nurse', name: '护士', email: 'nurse@example.com', phone: '13700137000', role: '护士', status: '启用' }
      ]
      total.value = users.value.length
    }
    
    // 创建用户
    const createUser = () => {
      router.push('/users/create')
    }
    
    // 编辑用户
    const editUser = (user) => {
      router.push(`/users/edit/${user.id}`)
    }
    
    // 删除用户
    const deleteUser = async (id) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除该用户吗？',
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        // 模拟删除操作
        users.value = users.value.filter(user => user.id !== id)
        total.value = users.value.length
        ElMessage.success('删除成功')
      } catch {
        // 用户取消删除
      }
    }
    
    // 分页处理
    const handleSizeChange = (size) => {
      pageSize.value = size
      fetchUsers()
    }
    
    const handleCurrentChange = (current) => {
      currentPage.value = current
      fetchUsers()
    }
    
    onMounted(() => {
      fetchUsers()
    })
    
    return {
      users,
      currentPage,
      pageSize,
      total,
      createUser,
      editUser,
      deleteUser,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>