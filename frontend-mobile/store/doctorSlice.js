import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/api';

// 模拟医生数据，用于演示
const mockDoctors = {
  '1': [ // 内科医生
    {
      id: 'd1',
      name: '张医生',
      title: '主任医师',
      departmentId: '1',
      departmentName: '内科',
      specialties: ['心血管疾病', '高血压'],
      availableCount: 5,
      registrationFee: 60,
      description: '从事内科临床工作20余年，擅长心血管疾病的诊治。'
    },
    {
      id: 'd2',
      name: '李医生',
      title: '副主任医师',
      departmentId: '1',
      departmentName: '内科',
      specialties: ['消化内科', '胃肠疾病'],
      availableCount: 8,
      registrationFee: 50,
      description: '擅长消化系统疾病的诊断和治疗。'
    }
  ],
  '2': [ // 外科医生
    {
      id: 'd3',
      name: '王医生',
      title: '主任医师',
      departmentId: '2',
      departmentName: '外科',
      specialties: ['普外科', '腹腔镜手术'],
      availableCount: 3,
      registrationFee: 60,
      description: '擅长腹腔镜微创手术，临床经验丰富。'
    },
    {
      id: 'd4',
      name: '刘医生',
      title: '主治医师',
      departmentId: '2',
      departmentName: '外科',
      specialties: ['骨科', '关节外科'],
      availableCount: 6,
      registrationFee: 40,
      description: '专注于骨关节疾病的诊断与治疗。'
    }
  ],
  '3': [ // 儿科医生
    {
      id: 'd5',
      name: '陈医生',
      title: '副主任医师',
      departmentId: '3',
      departmentName: '儿科',
      specialties: ['小儿呼吸', '儿童保健'],
      availableCount: 10,
      registrationFee: 50,
      description: '擅长儿童呼吸系统疾病的诊治和儿童保健指导。'
    },
    {
      id: 'd6',
      name: '赵医生',
      title: '主治医师',
      departmentId: '3',
      departmentName: '儿科',
      specialties: ['小儿消化', '儿童营养'],
      availableCount: 7,
      registrationFee: 40,
      description: '专注于儿童消化系统疾病和营养健康。'
    }
  ],
  '4': [ // 妇产科医生
    {
      id: 'd7',
      name: '孙医生',
      title: '主任医师',
      departmentId: '4',
      departmentName: '妇产科',
      specialties: ['产科', '高危妊娠'],
      availableCount: 4,
      registrationFee: 60,
      description: '从事妇产科工作25年，擅长高危妊娠的管理。'
    },
    {
      id: 'd8',
      name: '周医生',
      title: '副主任医师',
      departmentId: '4',
      departmentName: '妇产科',
      specialties: ['妇科内分泌', '不孕不育'],
      availableCount: 6,
      registrationFee: 50,
      description: '专注于妇科内分泌疾病和不孕不育的诊治。'
    }
  ],
  '5': [ // 眼科医生
    {
      id: 'd9',
      name: '吴医生',
      title: '主任医师',
      departmentId: '5',
      departmentName: '眼科',
      specialties: ['白内障', '青光眼'],
      availableCount: 3,
      registrationFee: 60,
      description: '擅长白内障、青光眼等常见眼病的诊治。'
    },
    {
      id: 'd10',
      name: '郑医生',
      title: '主治医师',
      departmentId: '5',
      departmentName: '眼科',
      specialties: ['眼底病', '视网膜病变'],
      availableCount: 5,
      registrationFee: 40,
      description: '专注于眼底疾病的诊断和治疗。'
    }
  ]
};

// 根据科室ID获取医生列表
const getDoctorsByDepartment = createAsyncThunk(
  'doctor/getDoctorsByDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      // 实际项目中应该调用真实API
      // const response = await axios.get(`/api/departments/${departmentId}/doctors`);
      // return response.data;
      
      // 使用模拟数据
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const doctors = mockDoctors[departmentId] || [];
          if (doctors.length > 0) {
            resolve(doctors);
          } else {
            resolve([]);
          }
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message || '获取医生列表失败');
    }
  }
);

// 获取单个医生详情
const getDoctorById = createAsyncThunk(
  'doctor/getDoctorById',
  async (doctorId, { rejectWithValue }) => {
    try {
      // 实际项目中应该调用真实API
      // const response = await axios.get(`/api/doctors/${doctorId}`);
      // return response.data;
      
      // 使用模拟数据
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let foundDoctor = null;
          Object.values(mockDoctors).forEach(doctors => {
            const doctor = doctors.find(d => d.id === doctorId);
            if (doctor) {
              foundDoctor = doctor;
            }
          });
          
          if (foundDoctor) {
            resolve(foundDoctor);
          } else {
            reject(new Error('医生不存在'));
          }
        }, 300);
      });
    } catch (error) {
      return rejectWithValue(error.message || '获取医生详情失败');
    }
  }
);

const doctorSlice = createSlice({
  name: 'doctor',
  initialState: {
    doctors: [],
    currentDoctor: null,
    loading: false,
    error: null
  },
  reducers: {
    clearDoctorError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getDoctorsByDepartment 处理
      .addCase(getDoctorsByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDoctorsByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(getDoctorsByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getDoctorById 处理
      .addCase(getDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDoctor = action.payload;
      })
      .addCase(getDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export { getDoctorsByDepartment, getDoctorById };
export const { clearDoctorError } = doctorSlice.actions;
export default doctorSlice.reducer;