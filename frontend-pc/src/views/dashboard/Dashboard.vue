<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">首页</h1>
      <div class="current-time">
        <span class="date">{{ currentDate }}</span>
        <span class="time">{{ currentTime }}</span>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card primary">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><user /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalUsers }}</div>
                <div class="stat-label">总用户数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card success">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><office-building /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalDepartments }}</div>
                <div class="stat-label">科室数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card warning">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ todayRegistrations }}</div>
                <div class="stat-label">今日挂号</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card danger">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><timer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ pendingConsultations }}</div>
                <div class="stat-label">待就诊</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 图表和数据展示区 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>挂号趋势</span>
                <el-select v-model="timeRange" placeholder="选择时间范围" size="small">
                  <el-option label="最近7天" value="7" />
                  <el-option label="最近30天" value="30" />
                  <el-option label="最近90天" value="90" />
                </el-select>
              </div>
            </template>
            <div id="registrationChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>科室挂号分布</span>
                <el-button type="primary" size="small" plain>详情</el-button>
              </div>
            </template>
            <div id="departmentChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 最近挂号记录 -->
    <div class="recent-records">
      <el-card class="record-card">
        <template #header>
          <div class="card-header">
            <span>最近挂号记录</span>
            <el-link type="primary" :underline="false" @click="viewAllRecords">
              查看全部
            </el-link>
          </div>
        </template>
        <el-table :data="recentRegistrations" style="width: 100%">
          <el-table-column prop="patientName" label="患者姓名" width="120" />
          <el-table-column prop="departmentName" label="科室" width="150" />
          <el-table-column prop="doctorName" label="医生" width="120" />
          <el-table-column prop="registrationTime" label="挂号时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" link @click="viewDetails(scope.row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { 
  User, 
  OfficeBuilding, 
  Document, 
  Timer 
} from '@element-plus/icons-vue'

export default {
  name: 'Dashboard',
  components: {
    User,
    OfficeBuilding,
    Document,
    Timer
  },
  setup() {
    // 当前日期和时间
    const currentDate = ref('')
    const currentTime = ref('')
    
    // 格式化日期时间
    const formatDateTime = () => {
      const now = new Date()
      
      // 格式化日期
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekDay = weekDays[now.getDay()]
      currentDate.value = `${year}-${month}-${day} ${weekDay}`
      
      // 格式化时间
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      currentTime.value = `${hours}:${minutes}:${seconds}`
    }
    
    let timer = null
    const router = useRouter()
    const timeRange = ref('7')
    
    // 统计数据
    const totalUsers = ref(0)
    const totalDepartments = ref(0)
    const todayRegistrations = ref(0)
    const pendingConsultations = ref(0)
    
    // 最近挂号记录
    const recentRegistrations = ref([])
    
    // 图表实例
    let registrationChart = null
    let departmentChart = null
    
    // 获取统计数据
    const fetchStatistics = async () => {
      // 模拟API调用
      // const response = await getDashboardStatistics()
      // const data = response.data
      
      // 模拟数据
      totalUsers.value = 128
      totalDepartments.value = 24
      todayRegistrations.value = 86
      pendingConsultations.value = 12
    }
    
    // 获取最近挂号记录
    const fetchRecentRegistrations = async () => {
      // 模拟API调用
      // const response = await getRecentRegistrations()
      // recentRegistrations.value = response.data
      
      // 模拟数据
      recentRegistrations.value = [
        {
          id: '1',
          patientName: '张三',
          departmentName: '内科',
          doctorName: '李医生',
          registrationTime: '2024-01-15 09:30:00',
          status: 'pending'
        },
        {
          id: '2',
          patientName: '李四',
          departmentName: '外科',
          doctorName: '王医生',
          registrationTime: '2024-01-15 10:00:00',
          status: 'completed'
        },
        {
          id: '3',
          patientName: '王五',
          departmentName: '儿科',
          doctorName: '张医生',
          registrationTime: '2024-01-15 10:30:00',
          status: 'cancelled'
        },
        {
          id: '4',
          patientName: '赵六',
          departmentName: '妇产科',
          doctorName: '刘医生',
          registrationTime: '2024-01-15 11:00:00',
          status: 'pending'
        }
      ]
    }
    
    // 初始化挂号趋势图表
    const initRegistrationChart = () => {
      const chartDom = document.getElementById('registrationChart')
      registrationChart = echarts.init(chartDom)
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1月10日', '1月11日', '1月12日', '1月13日', '1月14日', '1月15日', '1月16日']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '内科',
            type: 'line',
            stack: '总量',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
            name: '外科',
            type: 'line',
            stack: '总量',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [220, 182, 191, 234, 290, 330, 310]
          },
          {
            name: '其他科室',
            type: 'line',
            stack: '总量',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [150, 232, 201, 154, 190, 330, 410]
          }
        ]
      }
      
      registrationChart.setOption(option)
    }
    
    // 初始化科室分布图表
    const initDepartmentChart = () => {
      const chartDom = document.getElementById('departmentChart')
      departmentChart = echarts.init(chartDom)
      
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '科室分布',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 335, name: '内科' },
              { value: 310, name: '外科' },
              { value: 234, name: '儿科' },
              { value: 135, name: '妇产科' },
              { value: 1548, name: '其他科室' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      
      departmentChart.setOption(option)
    }
    
    // 获取状态类型
    const getStatusType = (status) => {
      const statusMap = {
        pending: 'warning',
        completed: 'success',
        cancelled: 'danger'
      }
      return statusMap[status] || 'info'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        pending: '待就诊',
        completed: '已完成',
        cancelled: '已取消'
      }
      return statusMap[status] || '未知'
    }
    
    // 查看所有记录
    const viewAllRecords = () => {
      router.push('/registrations/list')
    }
    
    // 查看详情
    const viewDetails = (row) => {
      router.push(`/registrations/detail/${row.id}`)
    }
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (registrationChart) {
        registrationChart.resize()
      }
      if (departmentChart) {
        departmentChart.resize()
      }
    }
    
    // 组件挂载
    onMounted(async () => {
      // 初始化时间
      formatDateTime()
      // 每秒更新一次
      timer = setInterval(formatDateTime, 1000)
      
      // 获取统计数据
      await fetchStatistics()
      await fetchRecentRegistrations()
      
      // 初始化图表
      setTimeout(() => {
        initRegistrationChart()
        initDepartmentChart()
      }, 100)
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
    })
    
    // 组件卸载
    onUnmounted(() => {
      // 清除定时器
      if (timer) {
        clearInterval(timer)
      }
      
      // 销毁图表
      if (registrationChart) {
        registrationChart.dispose()
      }
      if (departmentChart) {
        departmentChart.dispose()
      }
      
      // 移除事件监听
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      timeRange,
      totalUsers,
      totalDepartments,
      todayRegistrations,
      pendingConsultations,
      recentRegistrations,
      getStatusType,
      getStatusText,
      viewAllRecords,
      viewDetails,
      currentDate,
      currentTime
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.current-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: var(--text-secondary);
}

.current-time .date {
  font-size: 14px;
  margin-bottom: 4px;
}

.current-time .time {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
}

.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 32px;
  margin-right: 20px;
  opacity: 0.8;
}

.stat-info .stat-value {
  font-size: 24px;
  font-weight: 600;
}

.stat-info .stat-label {
  font-size: 14px;
  opacity: 0.8;
}

.stat-card.primary .stat-icon {
  color: #409eff;
}

.stat-card.success .stat-icon {
  color: #67c23a;
}

.stat-card.warning .stat-icon {
  color: #e6a23c;
}

.stat-card.danger .stat-icon {
  color: #f56c6c;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  height: calc(100% - 50px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-records .record-card {
  margin-bottom: 20px;
}
</style>