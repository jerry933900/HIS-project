<template>
  <div class="registration-list">
    <div class="page-header">
      <h1 class="page-title">挂号管理</h1>
    </div>
    
    <el-card class="content-wrapper">
      <!-- 搜索和操作栏 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="5">
            <el-input
              v-model="searchForm.patientName"
              placeholder="请输入患者姓名"
              prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </el-col>
          <el-col :span="5">
            <el-input
              v-model="searchForm.patientId"
              placeholder="请输入患者ID/就诊卡号"
              prefix-icon="DocumentCopy"
              clearable
              @input="handleSearch"
            />
          </el-col>
          <el-col :span="5">
            <el-select
              v-model="searchForm.departmentId"
              placeholder="请选择科室"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部科室" value="" />
              <el-option
                v-for="dept in departments"
                :key="dept._id"
                :label="dept.name"
                :value="dept._id"
              />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="待就诊" value="pending" />
              <el-option label="已就诊" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-date-picker
              v-model="searchForm.registrationDate"
              type="date"
              placeholder="选择挂号日期"
              value-format="YYYY-MM-DD"
              clearable
              @change="handleSearch"
            />
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 15px;">
          <el-col :span="6">
            <el-select
              v-model="searchForm.doctorId"
              placeholder="请选择医生"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部医生" value="" />
              <el-option
                v-for="doctor in doctors"
                :key="doctor._id"
                :label="doctor.name"
                :value="doctor._id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="searchForm.type"
              placeholder="请选择挂号类型"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="普通号" value="regular" />
              <el-option label="专家号" value="expert" />
              <el-option label="特需号" value="special" />
            </el-select>
          </el-col>
          <el-col :span="12" class="text-right">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新增挂号
            </el-button>
          </el-col>
        </el-row>
      </div>
      
      <!-- 挂号列表 -->
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="registrationsData"
          style="width: 100%"
          border
          row-key="_id"
        >
          <el-table-column prop="registrationNumber" label="挂号单号" width="180" />
          <el-table-column prop="patientName" label="患者姓名" width="120" />
          <el-table-column prop="patientId" label="就诊卡号" width="150" />
          <el-table-column prop="patientAge" label="年龄" width="80" />
          <el-table-column prop="patientGender" label="性别" width="80">
            <template #default="scope">
              {{ scope.row.patientGender === 'male' ? '男' : '女' }}
            </template>
          </el-table-column>
          <el-table-column prop="departmentName" label="科室" width="150" />
          <el-table-column prop="doctorName" label="医生" width="120" />
          <el-table-column prop="type" label="挂号类型" width="120">
            <template #default="scope">
              <el-tag :type="getTypeTagType(scope.row.type)">
                {{ getTypeName(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="registrationDate" label="挂号日期" width="120" />
          <el-table-column prop="registrationTime" label="挂号时间" width="180" />
          <el-table-column prop="fee" label="挂号费用(元)" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusName(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" link @click="handleView(scope.row)"
                >详情</el-button
              >
              <template v-if="scope.row.status === 'pending'">
                <el-button size="small" type="warning" link @click="handleComplete(scope.row)"
                  >完成</el-button
                >
                <el-button size="small" type="danger" link @click="handleCancel(scope.row)"
                  >取消</el-button
                >
              </template>
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
    
    <!-- 挂号详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="挂号详情"
      width="800px"
    >
      <div class="registration-detail">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <span class="detail-label">挂号单号：</span>
              <span class="detail-value">{{ viewData.registrationNumber || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <span class="detail-label">挂号日期：</span>
              <span class="detail-value">{{ viewData.registrationDate || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <span class="detail-label">挂号时间：</span>
              <span class="detail-value">{{ viewData.registrationTime || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        
        <h3 class="detail-section-title">患者信息</h3>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="detail-item">
              <span class="detail-label">患者姓名：</span>
              <span class="detail-value">{{ viewData.patientName || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item">
              <span class="detail-label">就诊卡号：</span>
              <span class="detail-value">{{ viewData.patientId || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item">
              <span class="detail-label">年龄：</span>
              <span class="detail-value">{{ viewData.patientAge || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item">
              <span class="detail-label">性别：</span>
              <span class="detail-value">{{ viewData.patientGender === 'male' ? '男' : '女' || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        
        <h3 class="detail-section-title">就诊信息</h3>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="detail-item">
              <span class="detail-label">科室：</span>
              <span class="detail-value">{{ viewData.departmentName || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item">
              <span class="detail-label">医生：</span>
              <span class="detail-value">{{ viewData.doctorName || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item">
              <span class="detail-label">挂号类型：</span>
              <span class="detail-value">{{ getTypeName(viewData.type) }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item">
              <span class="detail-label">挂号费用：</span>
              <span class="detail-value">{{ viewData.fee || '-' }} 元</span>
            </div>
          </el-col>
        </el-row>
        
        <h3 class="detail-section-title">状态信息</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <span class="detail-label">当前状态：</span>
              <el-tag :type="getStatusTagType(viewData.status)">
                {{ getStatusName(viewData.status) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="detail-item">
              <span class="detail-label">备注：</span>
              <span class="detail-value">{{ viewData.remark || '-' }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, DocumentCopy, Plus } from '@element-plus/icons-vue'
import * as registrationApi from '../../api/registration'
import * as departmentApi from '../../api/department'
import * as doctorApi from '../../api/doctor'

export default {
  name: 'RegistrationList',
  components: {
    Search,
    DocumentCopy,
    Plus
  },
  setup() {
    // 状态变量
    const loading = ref(false)
    const registrationsData = ref([])
    const departments = ref([])
    const doctors = ref([])
    const viewDialogVisible = ref(false)
    const viewData = ref({})
    
    // 搜索表单
    const searchForm = reactive({
      patientName: '',
      patientId: '',
      departmentId: '',
      doctorId: '',
      type: '',
      status: '',
      registrationDate: ''
    })
    
    // 分页参数
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
    
    // 获取挂号类型名称
    const getTypeName = (type) => {
      const typeMap = {
        regular: '普通号',
        expert: '专家号',
        special: '特需号'
      }
      return typeMap[type] || '-'
    }
    
    // 获取挂号类型标签类型
    const getTypeTagType = (type) => {
      const typeMap = {
        regular: 'primary',
        expert: 'success',
        special: 'warning'
      }
      return typeMap[type] || 'info'
    }
    
    // 获取状态名称
    const getStatusName = (status) => {
      const statusMap = {
        pending: '待就诊',
        completed: '已就诊',
        cancelled: '已取消'
      }
      return statusMap[status] || '-'
    }
    
    // 获取状态标签类型
    const getStatusTagType = (status) => {
      const statusMap = {
        pending: 'primary',
        completed: 'success',
        cancelled: 'danger'
      }
      return statusMap[status] || 'info'
    }
    
    // 获取科室列表
    const fetchDepartments = async () => {
      try {
        // const response = await departmentApi.getDepartments({ pageSize: 100 })
        // departments.value = response.data.items
        
        // 模拟数据
        departments.value = [
          { _id: '1', name: '内科' },
          { _id: '1-1', name: '心内科' },
          { _id: '1-2', name: '消化内科' },
          { _id: '2', name: '外科' },
          { _id: '3', name: '儿科' }
        ]
      } catch (error) {
        console.error('获取科室列表失败:', error)
      }
    }
    
    // 获取医生列表
    const fetchDoctors = async () => {
      try {
        // const response = await doctorApi.getDoctors({ pageSize: 100 })
        // doctors.value = response.data.items
        
        // 模拟数据
        doctors.value = [
          { _id: '1', name: '张医生' },
          { _id: '2', name: '李医生' },
          { _id: '3', name: '王医生' }
        ]
      } catch (error) {
        console.error('获取医生列表失败:', error)
      }
    }
    
    // 获取挂号列表
    const fetchRegistrations = async () => {
      loading.value = true
      try {
        // 构建查询参数
        const params = {
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
          ...searchForm
        }
        
        // 调用API获取挂号列表
        // const response = await registrationApi.getRegistrations(params)
        // registrationsData.value = response.data.items
        // pagination.total = response.data.total
        
        // 模拟数据
        registrationsData.value = [
          {
            _id: '1',
            registrationNumber: 'REG20240101001',
            patientName: '张三',
            patientId: 'PAT2024001',
            patientAge: 35,
            patientGender: 'male',
            departmentId: '1',
            departmentName: '内科',
            doctorId: '1',
            doctorName: '张医生',
            type: 'regular',
            registrationDate: '2024-01-01',
            registrationTime: '2024-01-01 09:00:00',
            fee: 15,
            status: 'pending',
            remark: '',
            createdAt: '2024-01-01 08:30:00'
          },
          {
            _id: '2',
            registrationNumber: 'REG20240101002',
            patientName: '李四',
            patientId: 'PAT2024002',
            patientAge: 42,
            patientGender: 'female',
            departmentId: '1-1',
            departmentName: '心内科',
            doctorId: '2',
            doctorName: '李医生',
            type: 'expert',
            registrationDate: '2024-01-01',
            registrationTime: '2024-01-01 10:30:00',
            fee: 50,
            status: 'completed',
            remark: '常规检查',
            createdAt: '2024-01-01 09:00:00'
          },
          {
            _id: '3',
            registrationNumber: 'REG20240101003',
            patientName: '王五',
            patientId: 'PAT2024003',
            patientAge: 28,
            patientGender: 'male',
            departmentId: '2',
            departmentName: '外科',
            doctorId: '3',
            doctorName: '王医生',
            type: 'regular',
            registrationDate: '2024-01-01',
            registrationTime: '2024-01-01 14:00:00',
            fee: 15,
            status: 'pending',
            remark: '',
            createdAt: '2024-01-01 10:00:00'
          }
        ]
        pagination.total = 3
      } catch (error) {
        ElMessage.error('获取挂号列表失败')
        console.error('获取挂号列表失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    // 查看详情
    const handleView = (row) => {
      viewData.value = { ...row }
      viewDialogVisible.value = true
    }
    
    // 完成挂号
    const handleComplete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要将挂号单号「${row.registrationNumber}」标记为已就诊吗？`,
          '确认完成',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // await registrationApi.updateRegistrationStatus(row._id, { status: 'completed' })
        ElMessage.success('挂号已标记为已就诊')
        
        // 重新获取挂号列表
        await fetchRegistrations()
      } catch (error) {
        // 用户取消操作
      }
    }
    
    // 取消挂号
    const handleCancel = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要取消挂号单号「${row.registrationNumber}」吗？`,
          '确认取消',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'danger'
          }
        )
        
        // await registrationApi.updateRegistrationStatus(row._id, { status: 'cancelled' })
        ElMessage.success('挂号已取消')
        
        // 重新获取挂号列表
        await fetchRegistrations()
      } catch (error) {
        // 用户取消操作
      }
    }
    
    // 新增挂号
    const handleCreate = () => {
      // 跳转到新增挂号页面
      // 这里简化处理，实际应该跳转到专门的新增页面
      ElMessage.info('跳转到新增挂号页面')
    }
    
    // 搜索
    const handleSearch = () => {
      pagination.currentPage = 1
      fetchRegistrations()
    }
    
    // 分页大小变化
    const handleSizeChange = (size) => {
      pagination.pageSize = size
      fetchRegistrations()
    }
    
    // 当前页码变化
    const handleCurrentChange = (current) => {
      pagination.currentPage = current
      fetchRegistrations()
    }
    
    // 组件挂载时获取数据
    onMounted(async () => {
      await Promise.all([
        fetchDepartments(),
        fetchDoctors(),
        fetchRegistrations()
      ])
    })
    
    return {
      loading,
      registrationsData,
      departments,
      doctors,
      viewDialogVisible,
      viewData,
      searchForm,
      pagination,
      getTypeName,
      getTypeTagType,
      getStatusName,
      getStatusTagType,
      handleView,
      handleComplete,
      handleCancel,
      handleCreate,
      handleSearch,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.registration-list {
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

/* 详情页面样式 */
.registration-detail {
  padding: 10px 0;
}

.detail-section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-label {
  font-weight: 500;
  display: inline-block;
  width: 100px;
  color: #606266;
}

.detail-value {
  color: #303133;
}
</style>