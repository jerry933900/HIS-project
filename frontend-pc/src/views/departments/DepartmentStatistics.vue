<template>
  <div class="department-statistics">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>科室统计</span>
        </div>
      </template>
      
      <div class="statistics-content">
        <!-- 统计卡片 -->
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card primary">
              <div class="stat-content">
                <div class="stat-number">{{ totalDepartments }}</div>
                <div class="stat-label">科室总数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card success">
              <div class="stat-content">
                <div class="stat-number">{{ totalDoctors }}</div>
                <div class="stat-label">医生总数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card warning">
              <div class="stat-content">
                <div class="stat-number">{{ totalPatients }}</div>
                <div class="stat-label">患者总数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card danger">
              <div class="stat-content">
                <div class="stat-number">{{ todayAppointments }}</div>
                <div class="stat-label">今日预约</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 图表区域 -->
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>科室医生数量分布</span>
                </div>
              </template>
              <div id="doctorDistributionChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>科室就诊量统计</span>
                </div>
              </template>
              <div id="appointmentVolumeChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 科室列表 -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>科室详细统计</span>
            </div>
          </template>
          <el-table :data="departmentStats" style="width: 100%">
            <el-table-column prop="name" label="科室名称" />
            <el-table-column prop="doctorCount" label="医生数量" />
            <el-table-column prop="patientCount" label="患者数量" />
            <el-table-column prop="appointmentCount" label="预约数量" />
            <el-table-column prop="averageWaitingTime" label="平均等待时间(分钟)" />
          </el-table>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'DepartmentStatistics',
  setup() {
    // 统计数据
    const totalDepartments = ref(5)
    const totalDoctors = ref(50)
    const totalPatients = ref(1500)
    const todayAppointments = ref(120)
    
    // 科室统计数据
    const departmentStats = ref([
      { name: '内科', doctorCount: 12, patientCount: 350, appointmentCount: 45, averageWaitingTime: 15 },
      { name: '外科', doctorCount: 10, patientCount: 320, appointmentCount: 38, averageWaitingTime: 20 },
      { name: '妇产科', doctorCount: 8, patientCount: 280, appointmentCount: 25, averageWaitingTime: 12 },
      { name: '儿科', doctorCount: 9, patientCount: 300, appointmentCount: 42, averageWaitingTime: 18 },
      { name: '眼科', doctorCount: 6, patientCount: 150, appointmentCount: 15, averageWaitingTime: 10 }
    ])
    
    // 初始化图表
    const initCharts = () => {
      nextTick(() => {
        // 医生分布饼图
        const doctorChart = echarts.init(document.getElementById('doctorDistributionChart'))
        doctorChart.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left'
          },
          series: [
            {
              name: '医生数量',
              type: 'pie',
              radius: '50%',
              data: departmentStats.value.map(dept => ({
                value: dept.doctorCount,
                name: dept.name
              })),
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        })
        
        // 就诊量柱状图
        const appointmentChart = echarts.init(document.getElementById('appointmentVolumeChart'))
        appointmentChart.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: departmentStats.value.map(dept => dept.name)
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: '预约数量',
              type: 'bar',
              data: departmentStats.value.map(dept => dept.appointmentCount),
              itemStyle: {
                color: '#67c23a'
              }
            }
          ]
        })
        
        // 响应式调整
        window.addEventListener('resize', () => {
          doctorChart.resize()
          appointmentChart.resize()
        })
      })
    }
    
    onMounted(() => {
      initCharts()
    })
    
    return {
      totalDepartments,
      totalDoctors,
      totalPatients,
      todayAppointments,
      departmentStats
    }
  }
}
</script>

<style scoped>
.department-statistics {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics-content {
  padding-top: 20px;
}

.stat-card {
  height: 120px;
  cursor: pointer;
}

.stat-card.primary {
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
}

.stat-card.success {
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
}

.stat-card.warning {
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
}

.stat-card.danger {
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
}

.stat-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>