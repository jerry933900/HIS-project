import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/api';

// 模拟数据，用于演示
const mockDepartments = [
  {
    id: '1',
    name: '内科',
    description: '内科是医院的基础科室，负责诊治内脏器官疾病，包括心血管、呼吸、消化、内分泌等多个专业方向。',
    doctorCount: 12
  },
  {
    id: '2', 
    name: '外科',
    description: '外科主要通过手术方法治疗疾病，包括普外科、神经外科、胸外科、泌尿外科等专业。',
    doctorCount: 8
  },
  {
    id: '3',
    name: '儿科',
    description: '儿科专注于婴幼儿及青少年的健康保健和疾病诊疗，为儿童提供专业的医疗服务。',
    doctorCount: 10
  },
  {
    id: '4',
    name: '妇产科',
    description: '妇产科负责女性生殖系统疾病的诊治和孕产期保健，包括妇科、产科、生殖内分泌等专业。',
    doctorCount: 6
  },
  {
    id: '5',
    name: '眼科',
    description: '眼科专注于眼部疾病的诊断和治疗，包括白内障、青光眼、视网膜病变等多种眼病。',
    doctorCount: 5
  }
];

// 获取科室列表
const getDepartments = createAsyncThunk(
  'department/getDepartments',
  async (_, { rejectWithValue }) => {
    try {
      // 实际项目中应该调用真实API
      // const response = await axios.get('/api/departments');
      // return response.data;
      
      // 使用模拟数据
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockDepartments);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message || '获取科室列表失败');
    }
  }
);

// 获取单个科室详情
const getDepartmentById = createAsyncThunk(
  'department/getDepartmentById',
  async (id, { rejectWithValue }) => {
    try {
      // 实际项目中应该调用真实API
      // const response = await axios.get(`/api/departments/${id}`);
      // return response.data;
      
      // 使用模拟数据
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const department = mockDepartments.find(dept => dept.id === id);
          if (department) {
            resolve(department);
          } else {
            reject(new Error('科室不存在'));
          }
        }, 300);
      });
    } catch (error) {
      return rejectWithValue(error.message || '获取科室详情失败');
    }
  }
);

const departmentSlice = createSlice({
  name: 'department',
  initialState: {
    departments: [],
    currentDepartment: null,
    loading: false,
    error: null
  },
  reducers: {
    clearDepartmentError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getDepartments 处理
      .addCase(getDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(getDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getDepartmentById 处理
      .addCase(getDepartmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDepartmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDepartment = action.payload;
      })
      .addCase(getDepartmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export { getDepartments, getDepartmentById };
export const { clearDepartmentError } = departmentSlice.actions;
export default departmentSlice.reducer;