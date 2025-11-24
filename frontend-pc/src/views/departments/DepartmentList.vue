<template>
  <div class="department-list">
    <div class="page-header">
      <h1 class="page-title">科室管理</h1>
    </div>
    
    <el-card class="content-wrapper">
      <!-- 搜索和操作栏 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入科室名称"
              prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="searchForm.parentId"
              placeholder="请选择上级科室"
              clearable
              @change="handleSearch"
            >
              <el-option label="顶级科室" value="" />
              <el-option
                v-for="dept in departments"
                :key="dept._id"
                :label="dept.name"
                :value="dept._id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
          </el-col>
          <el-col :span="6" class="text-right">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新增科室
            </el-button>
          </el-col>
        </el-row>
      </div>
      
      <!-- 科室列表 -->
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="departmentsData"
          style="width: 100%"
          border
          row-key="_id"
          default-expand-all
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column prop="name" label="科室名称" width="200" />
          <el-table-column prop="code" label="科室编码" width="150" />
          <el-table-column prop="description" label="科室描述" show-overflow-tooltip />
          <el-table-column prop="parentName" label="上级科室" width="180" />
          <el-table-column prop="sort" label="排序" width="100" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" link @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" link @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 科室表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新增科室' : '编辑科室'"
      width="600px"
    >
      <el-form
        :model="departmentForm"
        :rules="rules"
        ref="departmentFormRef"
        label-width="120px"
      >
        <el-form-item label="科室名称" prop="name">
          <el-input
            v-model="departmentForm.name"
            placeholder="请输入科室名称"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="科室编码" prop="code">
          <el-input
            v-model="departmentForm.code"
            placeholder="请输入科室编码"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="上级科室" prop="parentId">
          <el-select
            v-model="departmentForm.parentId"
            placeholder="请选择上级科室"
            clearable
          >
            <el-option label="顶级科室" value="" />
            <el-option
              v-for="dept in departments"
              :key="dept._id"
              :label="dept.name"
              :value="dept._id"
              :disabled="departmentForm._id === dept._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="科室描述" prop="description">
          <el-input
            v-model="departmentForm.description"
            placeholder="请输入科室描述"
            type="textarea"
            rows="4"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="departmentForm.sort"
            :min="0"
            :max="9999"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="departmentForm.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import * as departmentApi from '../../api/department'

export default {
  name: 'DepartmentList',
  components: {
    Search,
    Plus
  },
  setup() {
    // 状态变量
    const loading = ref(false)
    const departmentsData = ref([])
    const departments = ref([])
    const dialogVisible = ref(false)
    const dialogType = ref('create')
    const departmentFormRef = ref()
    
    // 搜索表单
    const searchForm = reactive({
      name: '',
      parentId: '',
      status: ''
    })
    
    // 分页参数
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
    
    // 科室表单
    const departmentForm = reactive({
      _id: '',
      name: '',
      code: '',
      parentId: '',
      description: '',
      sort: 0,
      status: 'active'
    })
    
    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入科室名称', trigger: 'blur' },
        { min: 1, max: 50, message: '科室名称长度在 1 到 50 个字符', trigger: 'blur' }
      ],
      code: [
        { required: true, message: '请输入科室编码', trigger: 'blur' },
        { min: 1, max: 20, message: '科室编码长度在 1 到 20 个字符', trigger: 'blur' }
      ]
    }
    
    // 获取科室列表
    const fetchDepartments = async () => {
      loading.value = true
      try {
        // 构建查询参数
        const params = {
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
          ...searchForm
        }
        
        // 调用API获取科室列表
        // const response = await departmentApi.getDepartments(params)
        // departmentsData.value = response.data.items
        // pagination.total = response.data.total
        
        // 模拟数据
        departmentsData.value = [
          {
            _id: '1',
            name: '内科',
            code: 'NEIKE',
            description: '内科是医院的基础科室，负责诊断和治疗各种内科疾病',
            parentId: '',
            parentName: '',
            sort: 1,
            status: 'active',
            createdAt: '2024-01-01 00:00:00',
            hasChildren: true,
            children: [
              {
                _id: '1-1',
                name: '心内科',
                code: 'XINNEIKE',
                description: '心内科专注于心脏和血管疾病的诊断和治疗',
                parentId: '1',
                parentName: '内科',
                sort: 1,
                status: 'active',
                createdAt: '2024-01-01 00:00:00'
              },
              {
                _id: '1-2',
                name: '消化内科',
                code: 'XHNEIKE',
                description: '消化内科专注于消化系统疾病的诊断和治疗',
                parentId: '1',
                parentName: '内科',
                sort: 2,
                status: 'active',
                createdAt: '2024-01-01 00:00:00'
              }
            ]
          },
          {
            _id: '2',
            name: '外科',
            code: 'WAIKE',
            description: '外科主要通过手术等方式治疗疾病',
            parentId: '',
            parentName: '',
            sort: 2,
            status: 'active',
            createdAt: '2024-01-01 00:00:00'
          },
          {
            _id: '3',
            name: '儿科',
            code: 'ERKE',
            description: '儿科专门为儿童提供医疗服务',
            parentId: '',
            parentName: '',
            sort: 3,
            status: 'active',
            createdAt: '2024-01-01 00:00:00'
          }
        ]
        departments.value = departmentsData.value
        pagination.total = 3
      } catch (error) {
        ElMessage.error('获取科室列表失败')
        console.error('获取科室列表失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    // 重置表单
    const resetForm = () => {
      departmentForm._id = ''
      departmentForm.name = ''
      departmentForm.code = ''
      departmentForm.parentId = ''
      departmentForm.description = ''
      departmentForm.sort = 0
      departmentForm.status = 'active'
      
      if (departmentFormRef.value) {
        departmentFormRef.value.resetFields()
      }
    }
    
    // 打开新增对话框
    const handleCreate = () => {
      dialogType.value = 'create'
      resetForm()
      dialogVisible.value = true
    }
    
    // 打开编辑对话框
    const handleEdit = (row) => {
      dialogType.value = 'edit'
      // 复制行数据到表单
      Object.assign(departmentForm, row)
      dialogVisible.value = true
    }
    
    // 提交表单
    const handleSubmit = async () => {
      try {
        // 验证表单
        await departmentFormRef.value.validate()
        
        if (dialogType.value === 'create') {
          // 创建科室
          // await departmentApi.createDepartment(departmentForm)
          ElMessage.success('科室创建成功')
        } else {
          // 更新科室
          // await departmentApi.updateDepartment(departmentForm._id, departmentForm)
          ElMessage.success('科室更新成功')
        }
        
        // 关闭对话框
        dialogVisible.value = false
        
        // 重新获取科室列表
        await fetchDepartments()
      } catch (error) {
        console.error('保存科室失败:', error)
      }
    }
    
    // 删除科室
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除科室「${row.name}」吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // await departmentApi.deleteDepartment(row._id)
        ElMessage.success('科室删除成功')
        
        // 重新获取科室列表
        await fetchDepartments()
      } catch (error) {
        // 用户取消删除
      }
    }
    
    // 搜索
    const handleSearch = () => {
      pagination.currentPage = 1
      fetchDepartments()
    }
    
    // 分页大小变化
    const handleSizeChange = (size) => {
      pagination.pageSize = size
      fetchDepartments()
    }
    
    // 当前页码变化
    const handleCurrentChange = (current) => {
      pagination.currentPage = current
      fetchDepartments()
    }
    
    // 组件挂载时获取科室列表
    onMounted(() => {
      fetchDepartments()
    })
    
    return {
      loading,
      departmentsData,
      departments,
      dialogVisible,
      dialogType,
      departmentFormRef,
      searchForm,
      pagination,
      departmentForm,
      rules,
      handleCreate,
      handleEdit,
      handleSubmit,
      handleDelete,
      handleSearch,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.department-list {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}
</style>