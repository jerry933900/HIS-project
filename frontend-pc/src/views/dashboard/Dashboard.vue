<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">首页</h1>
      <div class="current-time">
        <span class="date">{{ currentDate }}</span>
        <span class="time">{{ currentTime }}</span>
      </div>
    </div>

    <!-- 快捷操作区域 -->
    <div class="quick-actions">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button
            type="primary"
            icon="el-icon-circle-plus"
            size="large"
            class="action-button"
            @click="createRegistration"
          >
            创建挂号
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button
            type="success"
            icon="el-icon-user-plus"
            size="large"
            class="action-button"
            @click="createPatient"
          >
            添加患者
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button
            type="warning"
            icon="el-icon-document"
            size="large"
            class="action-button"
            @click="generateReport"
          >
            生成报表
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button
            type="info"
            icon="el-icon-search"
            size="large"
            class="action-button"
            @click="searchPatient"
          >
            查询患者
          </el-button>
        </el-col>
      </el-row>
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

    <!-- 医院公告和今日值班医生 -->
    <div class="additional-info">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="announcement-card">
            <template #header>
              <div class="card-header">
                <span class="announcement-icon"
                  ><el-icon><warning /></el-icon
                ></span>
                <span>医院公告</span>
              </div>
            </template>
            <el-timeline>
              <el-timeline-item timestamp="2024-01-15" placement="top">
                <el-card shadow="hover">
                  <h4>春节期间门诊安排</h4>
                  <p>
                    春节期间（2月10日-2月17日）我院门诊时间调整为8:30-16:00，请广大患者合理安排就诊时间。
                  </p>
                </el-card>
              </el-timeline-item>
              <el-timeline-item timestamp="2024-01-10" placement="top">
                <el-card shadow="hover">
                  <h4>新设备投入使用</h4>
                  <p>我院新引进的高端CT设备已投入使用，预约检查时间缩短至1-2个工作日。</p>
                </el-card>
              </el-timeline-item>
              <el-timeline-item timestamp="2024-01-05" placement="top">
                <el-card shadow="hover">
                  <h4>专家门诊信息更新</h4>
                  <p>每周三上午新增心内科张教授专家门诊，请提前一周预约。</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <div class="view-more">
              <el-link type="primary" :underline="false">查看更多公告</el-link>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="on-duty-card">
            <template #header>
              <div class="card-header">
                <span class="duty-icon"
                  ><el-icon><user /></el-icon
                ></span>
                <span>今日值班医生</span>
              </div>
            </template>
            <el-table :data="onDutyDoctors" style="width: 100%" stripe>
              <el-table-column prop="name" label="医生姓名" width="120" />
              <el-table-column prop="department" label="科室" width="150" />
              <el-table-column prop="title" label="职称" width="100" />
              <el-table-column prop="dutyTime" label="值班时间" width="180" />
              <el-table-column prop="status" label="当前状态" width="100">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.status === 'available' ? 'success' : 'warning'"
                  >
                    {{ scope.row.status === "available" ? "可接诊" : "忙碌" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button
                    size="small"
                    type="primary"
                    link
                    @click="viewDoctorSchedule(scope.row)"
                  >
                    查看排班
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 患者满意度统计 -->
    <div class="satisfaction-section">
      <el-card class="satisfaction-card">
        <template #header>
          <div class="card-header">
            <span>患者满意度统计</span>
            <el-select v-model="satisfactionPeriod" placeholder="选择时间段" size="small">
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
              <el-option label="本季度" value="quarter" />
            </el-select>
          </div>
        </template>
        <div class="satisfaction-content">
          <div class="satisfaction-overview">
            <div class="satisfaction-score">{{ satisfactionScore }}</div>
            <div class="satisfaction-label">综合满意度</div>
          </div>
          <div class="satisfaction-details">
            <el-row :gutter="10">
              <el-col :span="6" class="score-item excellent">
                <div class="score">98%</div>
                <div class="label">非常满意</div>
              </el-col>
              <el-col :span="6" class="score-item good">
                <div class="score">92%</div>
                <div class="label">满意</div>
              </el-col>
              <el-col :span="6" class="score-item average">
                <div class="score">78%</div>
                <div class="label">一般</div>
              </el-col>
              <el-col :span="6" class="score-item poor">
                <div class="score">2%</div>
                <div class="label">不满意</div>
              </el-col>
            </el-row>
          </div>
        </div>
        <div id="satisfactionChart" class="satisfaction-chart"></div>
      </el-card>
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

    <!-- 系统状态信息 -->
    <div class="system-status">
      <el-card class="status-card">
        <div class="status-content">
          <div class="status-item">
            <span class="status-label">系统版本：</span>
            <span class="status-value">v2.5.0</span>
          </div>
          <div class="status-item">
            <span class="status-label">数据更新时间：</span>
            <span class="status-value">{{ lastUpdateTime }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">在线用户：</span>
            <span class="status-value">{{ onlineUsers }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">服务器状态：</span>
            <span class="status-value"><el-tag type="success">正常</el-tag></span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import * as echarts from "echarts";
import {
  User,
  OfficeBuilding,
  Document,
  Timer,
  Warning,
  CirclePlus,
  Search,
} from "@element-plus/icons-vue";

export default {
  name: "Dashboard",
  components: {
    User,
    OfficeBuilding,
    Document,
    Timer,
    Warning,
    CirclePlus,
    Search,
  },
  setup() {
    // 当前日期和时间
    const currentDate = ref("");
    const currentTime = ref("");
    const lastUpdateTime = ref("");

    // 格式化日期时间
    const formatDateTime = () => {
      const now = new Date();

      // 格式化日期
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      const weekDay = weekDays[now.getDay()];
      currentDate.value = `${year}-${month}-${day} ${weekDay}`;

      // 格式化时间
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      currentTime.value = `${hours}:${minutes}:${seconds}`;
    };

    let timer = null;
    const router = useRouter();
    const timeRange = ref("7");
    const satisfactionPeriod = ref("week");

    // 统计数据
    const totalUsers = ref(0);
    const totalDepartments = ref(0);
    const todayRegistrations = ref(0);
    const pendingConsultations = ref(0);
    const onlineUsers = ref(0);
    const satisfactionScore = ref(0);

    // 今日值班医生数据
    const onDutyDoctors = ref([]);

    // 最近挂号记录
    const recentRegistrations = ref([]);

    // 图表实例
    let registrationChart = null;
    let departmentChart = null;
    let satisfactionChart = null;

    // 获取统计数据
    const fetchStatistics = async () => {
      // 模拟API调用
      // const response = await getDashboardStatistics()
      // const data = response.data

      // 模拟数据
      totalUsers.value = 128;
      totalDepartments.value = 24;
      todayRegistrations.value = 86;
      pendingConsultations.value = 12;
      onlineUsers.value = 15;
      satisfactionScore.value = 96;

      // 设置最后更新时间
      const now = new Date();
      lastUpdateTime.value = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    };

    // 获取今日值班医生
    const fetchOnDutyDoctors = async () => {
      // 模拟API调用
      // const response = await getOnDutyDoctors()
      // onDutyDoctors.value = response.data

      // 模拟数据
      onDutyDoctors.value = [
        {
          id: "1",
          name: "李医生",
          department: "内科",
          title: "主任医师",
          dutyTime: "8:00 - 12:00",
          status: "available",
        },
        {
          id: "2",
          name: "王医生",
          department: "外科",
          title: "副主任医师",
          dutyTime: "9:00 - 17:00",
          status: "busy",
        },
        {
          id: "3",
          name: "张医生",
          department: "儿科",
          title: "主治医师",
          dutyTime: "8:00 - 16:00",
          status: "available",
        },
        {
          id: "4",
          name: "刘医生",
          department: "妇产科",
          title: "主任医师",
          dutyTime: "13:00 - 17:00",
          status: "available",
        },
        {
          id: "5",
          name: "陈医生",
          department: "眼科",
          title: "副主任医师",
          dutyTime: "8:00 - 12:00",
          status: "busy",
        },
      ];
    };

    // 获取最近挂号记录
    const fetchRecentRegistrations = async () => {
      // 模拟API调用
      // const response = await getRecentRegistrations()
      // recentRegistrations.value = response.data

      // 模拟数据
      recentRegistrations.value = [
        {
          id: "1",
          patientName: "张三",
          departmentName: "内科",
          doctorName: "李医生",
          registrationTime: "2024-01-15 09:30:00",
          status: "pending",
        },
        {
          id: "2",
          patientName: "李四",
          departmentName: "外科",
          doctorName: "王医生",
          registrationTime: "2024-01-15 10:00:00",
          status: "completed",
        },
        {
          id: "3",
          patientName: "王五",
          departmentName: "儿科",
          doctorName: "张医生",
          registrationTime: "2024-01-15 10:30:00",
          status: "cancelled",
        },
        {
          id: "4",
          patientName: "赵六",
          departmentName: "妇产科",
          doctorName: "刘医生",
          registrationTime: "2024-01-15 11:00:00",
          status: "pending",
        },
        {
          id: "5",
          patientName: "钱七",
          departmentName: "眼科",
          doctorName: "陈医生",
          registrationTime: "2024-01-15 11:30:00",
          status: "pending",
        },
      ];
    };

    // 初始化挂号趋势图表
    const initRegistrationChart = () => {
      const chartDom = document.getElementById("registrationChart");
      registrationChart = echarts.init(chartDom);

      const option = {
        tooltip: {
          trigger: "axis",
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [
            "1月10日",
            "1月11日",
            "1月12日",
            "1月13日",
            "1月14日",
            "1月15日",
            "1月16日",
          ],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "内科",
            type: "line",
            stack: "总量",
            areaStyle: {},
            emphasis: {
              focus: "series",
            },
            data: [120, 132, 101, 134, 90, 230, 210],
          },
          {
            name: "外科",
            type: "line",
            stack: "总量",
            areaStyle: {},
            emphasis: {
              focus: "series",
            },
            data: [220, 182, 191, 234, 290, 330, 310],
          },
          {
            name: "其他科室",
            type: "line",
            stack: "总量",
            areaStyle: {},
            emphasis: {
              focus: "series",
            },
            data: [150, 232, 201, 154, 190, 330, 410],
          },
        ],
      };

      registrationChart.setOption(option);
    };

    // 初始化科室分布图表
    const initDepartmentChart = () => {
      const chartDom = document.getElementById("departmentChart");
      departmentChart = echarts.init(chartDom);

      const option = {
        tooltip: {
          trigger: "item",
        },
        legend: {
          orient: "vertical",
          left: "left",
        },
        series: [
          {
            name: "科室分布",
            type: "pie",
            radius: "50%",
            data: [
              { value: 335, name: "内科" },
              { value: 310, name: "外科" },
              { value: 234, name: "儿科" },
              { value: 135, name: "妇产科" },
              { value: 1548, name: "其他科室" },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };

      departmentChart.setOption(option);
    };

    // 初始化患者满意度图表
    const initSatisfactionChart = () => {
      const chartDom = document.getElementById("satisfactionChart");
      satisfactionChart = echarts.init(chartDom);

      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: ["非常满意", "满意", "一般", "不满意"],
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "{value}%",
          },
        },
        series: [
          {
            name: "满意度",
            type: "bar",
            data: [
              { value: 98, itemStyle: { color: "#67c23a" } },
              { value: 92, itemStyle: { color: "#409eff" } },
              { value: 78, itemStyle: { color: "#e6a23c" } },
              { value: 2, itemStyle: { color: "#f56c6c" } },
            ],
          },
        ],
      };

      satisfactionChart.setOption(option);
    };

    // 获取状态类型
    const getStatusType = (status) => {
      const statusMap = {
        pending: "warning",
        completed: "success",
        cancelled: "danger",
      };
      return statusMap[status] || "info";
    };

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        pending: "待就诊",
        completed: "已完成",
        cancelled: "已取消",
      };
      return statusMap[status] || "未知";
    };

    // 查看所有记录
    const viewAllRecords = () => {
      router.push("/registrations/list");
    };

    // 查看详情
    const viewDetails = (row) => {
      router.push(`/registrations/detail/${row.id}`);
    };

    // 查看医生排班
    const viewDoctorSchedule = (row) => {
      router.push(`/doctors/schedule/${row.id}`);
    };

    // 快捷操作方法
    const createRegistration = () => {
      router.push("/registration/create");
    };

    const createPatient = () => {
      router.push("/patients/create");
    };

    const generateReport = () => {
      router.push("/reports/generate");
    };

    const searchPatient = () => {
      router.push("/patients/search");
    };

    // 处理窗口大小变化
    const handleResize = () => {
      if (registrationChart) {
        registrationChart.resize();
      }
      if (departmentChart) {
        departmentChart.resize();
      }
      if (satisfactionChart) {
        satisfactionChart.resize();
      }
    };

    // 组件挂载
    onMounted(async () => {
      // 初始化时间
      formatDateTime();
      // 每秒更新一次
      timer = setInterval(formatDateTime, 1000);

      // 获取统计数据
      await fetchStatistics();
      await fetchRecentRegistrations();
      await fetchOnDutyDoctors();

      // 初始化图表
      setTimeout(() => {
        initRegistrationChart();
        initDepartmentChart();
        initSatisfactionChart();
      }, 100);

      // 监听窗口大小变化
      window.addEventListener("resize", handleResize);
    });

    // 组件卸载
    onUnmounted(() => {
      // 清除定时器
      if (timer) {
        clearInterval(timer);
      }

      // 销毁图表
      if (registrationChart) {
        registrationChart.dispose();
      }
      if (departmentChart) {
        departmentChart.dispose();
      }
      if (satisfactionChart) {
        satisfactionChart.dispose();
      }

      // 移除事件监听
      window.removeEventListener("resize", handleResize);
    });

    return {
      timeRange,
      satisfactionPeriod,
      totalUsers,
      totalDepartments,
      todayRegistrations,
      pendingConsultations,
      recentRegistrations,
      onDutyDoctors,
      satisfactionScore,
      lastUpdateTime,
      onlineUsers,
      getStatusType,
      getStatusText,
      viewAllRecords,
      viewDetails,
      viewDoctorSchedule,
      createRegistration,
      createPatient,
      generateReport,
      searchPatient,
      currentDate,
      currentTime,
    };
  },
};
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

/* 快捷操作样式 */
.quick-actions {
  margin-bottom: 20px;
}

.action-button {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
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

/* 附加信息区域样式 */
.additional-info {
  margin-bottom: 20px;
}

.announcement-card,
.on-duty-card {
  min-height: 400px;
}

.announcement-icon,
.duty-icon {
  margin-right: 5px;
  font-size: 16px;
}

.announcement-icon {
  color: #e6a23c;
}

.duty-icon {
  color: #409eff;
}

.view-more {
  text-align: right;
  margin-top: 10px;
}

/* 患者满意度样式 */
.satisfaction-section {
  margin-bottom: 20px;
}

.satisfaction-card {
  min-height: 400px;
}

.satisfaction-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.satisfaction-overview {
  text-align: center;
  flex: 1;
}

.satisfaction-score {
  font-size: 48px;
  font-weight: 700;
  color: #67c23a;
  margin-bottom: 10px;
}

.satisfaction-label {
  font-size: 16px;
  color: var(--text-secondary);
}

.satisfaction-details {
  flex: 2;
}

.score-item {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  color: white;
}

.score-item .score {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
}

.score-item.excellent {
  background-color: #67c23a;
}

.score-item.good {
  background-color: #409eff;
}

.score-item.average {
  background-color: #e6a23c;
}

.score-item.poor {
  background-color: #f56c6c;
}

.satisfaction-chart {
  height: 250px;
  margin-top: 20px;
}

.recent-records .record-card {
  margin-bottom: 20px;
}

/* 系统状态信息样式 */
.system-status {
  margin-bottom: 20px;
}

.status-card {
  background-color: #f5f7fa;
}

.status-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
}

.status-item {
  margin: 10px 20px;
}

.status-label {
  font-weight: 500;
  color: var(--text-secondary);
  margin-right: 5px;
}

.status-value {
  color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .satisfaction-content {
    flex-direction: column;
  }

  .status-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .status-item {
    margin: 5px 0;
  }
}
</style>
