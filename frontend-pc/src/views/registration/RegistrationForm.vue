<template>
  <div class="registration-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑挂号' : '创建挂号' }}</span>
        </div>
      </template>
      
      <el-form
        :model="registrationForm"
        :rules="rules"
        ref="registrationFormRef"
        label-width="120px"
        class="demo-ruleForm"
      >
        <el-form-item label="患者姓名" prop="patientName">
          <el-input v-model="registrationForm.patientName" placeholder="请输入患者姓名" />
        </el-form-item>
        
        <el-form-item label="患者性别" prop="patientGender">
          <el-radio-group v-model="registrationForm.patientGender">
            <el-radio label="男" />
            <el-radio label="女" />
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="患者年龄" prop="patientAge">
          <el-input v-model.number="registrationForm.patientAge" placeholder="请输入患者年龄" type="number" />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="patientPhone">
          <el-input v-model="registrationForm.patientPhone" placeholder="请输入联系电话" />
        </el-form-item>
        
        <el-form-item label="选择科室" prop="departmentId">
          <el-select v-model="registrationForm.departmentId" placeholder="请选择科室">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="选择医生" prop="doctorId">
          <el-select v-model="registrationForm.doctorId" placeholder="请选择医生">
            <el-option v-for="doctor in doctors" :key="doctor.id" :label="doctor.name" :value="doctor.id" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="预约日期" prop="appointmentDate">
          <el-date-picker
            v-model="registrationForm.appointmentDate"
            type="date"
            placeholder="请选择预约日期"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        
        <el-form-item label="预约时段" prop="timeSlot">
          <el-select v-model="registrationForm.timeSlot" placeholder="请选择预约时段">
            <el-option label="上午" value="上午" />
            <el-option label="下午" value="下午" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="症状描述" prop="symptoms">
          <el-input
            v-model="registrationForm.symptoms"
            type="textarea"
            :rows="3"
            placeholder="请简要描述症状"
          />
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
  name: 'RegistrationForm',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const registrationFormRef = ref()
    const registrationId = route.params.id
    
    // 判断是否为编辑模式
    const isEdit = computed(() => !!registrationId)
    
    // 科室列表（模拟数据）
    const departments = ref([
      { id: 1, name: '内科' },
      { id: 2, name: '外科' },
      { id: 3, name: '妇产科' },
      { id: 4, name: '儿科' },
      { id: 5, name: '眼科' }
    ])
    
    // 医生列表（模拟数据）
    const doctors = ref([
      { id: 1, name: '王医生', departmentId: 1 },
      { id: 2, name: '李医生', departmentId: 2 },
      { id: 3, name: '张医生', departmentId: 3 },
      { id: 4, name: '刘医生', departmentId: 4 },
      { id: 5, name: '陈医生', departmentId: 5 }
    ])
    
    // 表单数据
    const registrationForm = reactive({
      patientName: '',
      patientGender: '男',
      patientAge: '',
      patientPhone: '',
      departmentId: '',
      doctorId: '',
      appointmentDate: '',
      timeSlot: '',
      symptoms: ''
    })
    
    // 表单验证规则
    const rules = {
      patientName: [
        { required: true, message: '请输入患者姓名', trigger: 'blur' },
        { min: 1, max: 20, message: '姓名长度在 1 到 20 个字符', trigger: 'blur' }
      ],
      patientGender: [
        { required: true, message: '请选择患者性别', trigger: 'change' }
      ],
      patientAge: [
        { required: true, message: '请输入患者年龄', trigger: 'blur' },
        { type: 'number', min: 1, max: 120, message: '年龄在 1 到 120 之间', trigger: 'blur' }
      ],
      patientPhone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ],
      departmentId: [
        { required: true, message: '请选择科室', trigger: 'change' }
      ],
      doctorId: [
        { required: true, message: '请选择医生', trigger: 'change' }
      ],
      appointmentDate: [
        { required: true, message: '请选择预约日期', trigger: 'change' }
      ],
      timeSlot: [
        { required: true, message: '请选择预约时段', trigger: 'change' }
      ],
      symptoms: [
        { required: true, message: '请描述症状', trigger: 'blur' },
        { min: 5, max: 200, message: '症状描述长度在 5 到 200 个字符', trigger: 'blur' }
      ]
    }
    
    // 禁用过去的日期
    const disabledDate = (time) => {
      return time.getTime() < Date.now() - 8.64e7
    }
    
    // 获取挂号信息（编辑模式）
    const getRegistrationInfo = () => {
      // 模拟获取挂号数据
      registrationForm.patientName = '张三'
      registrationForm.patientGender = '男'
      registrationForm.patientAge = 30
      registrationForm.patientPhone = '13800138000'
      registrationForm.departmentId = 1
      registrationForm.doctorId = 1
      registrationForm.appointmentDate = '2024-01-20'
      registrationForm.timeSlot = '上午'
      registrationForm.symptoms = '头痛、发热，持续两天'
    }
    
    // 提交表单
    const submitForm = async () => {
      try {
        await registrationFormRef.value.validate()
        // 模拟提交数据
        setTimeout(() => {
          ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
          router.push('/registration/list')
        }, 500)
      } catch (error) {
        console.error('表单验证失败:', error)
      }
    }
    
    // 重置表单
    const resetForm = () => {
      registrationFormRef.value.resetFields()
    }
    
    // 返回列表
    const goBack = () => {
      router.push('/registration/list')
    }
    
    onMounted(() => {
      if (isEdit.value) {
        getRegistrationInfo()
      }
    })
    
    return {
      registrationFormRef,
      registrationForm,
      rules,
      isEdit,
      departments,
      doctors,
      disabledDate,
      submitForm,
      resetForm,
      goBack
    }
  }
}
</script>

<style scoped>
.registration-form {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>