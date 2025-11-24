import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 模拟API调用 - 获取预约列表
export const fetchAppointments = createAsyncThunk(
  'appointment/fetchAppointments',
  async (_, { rejectWithValue }) => {
    try {
      // 模拟API响应
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockAppointments = [
            {
              id: '1',
              appointmentNumber: 'REG20240101001',
              departmentName: '内科',
              doctorName: '张医生',
              appointmentDate: '2024-01-01',
              appointmentTime: '09:00',
              status: 'pending',
              fee: 15,
            },
            {
              id: '2',
              appointmentNumber: 'REG20240102001',
              departmentName: '儿科',
              doctorName: '李医生',
              appointmentDate: '2024-01-02',
              appointmentTime: '14:30',
              status: 'completed',
              fee: 20,
            },
          ];
          resolve(mockAppointments);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message || '获取预约列表失败');
    }
  }
);

// 模拟API调用 - 获取可用医生
export const fetchAvailableDoctors = createAsyncThunk(
  'appointment/fetchAvailableDoctors',
  async (departmentId, { rejectWithValue }) => {
    try {
      // 模拟API响应
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockDoctors = [
            {
              id: '1',
              name: '张医生',
              title: '主任医师',
              department: '内科',
              rating: 4.9,
              description: '从事内科临床工作20年，擅长心血管疾病诊治',
              availableCount: 5,
            },
            {
              id: '2',
              name: '李医生',
              title: '副主任医师',
              department: '内科',
              rating: 4.8,
              description: '从事内科临床工作15年，擅长消化系统疾病诊治',
              availableCount: 8,
            },
          ];
          resolve(mockDoctors);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message || '获取医生列表失败');
    }
  }
);

// 模拟API调用 - 获取可用时间段
export const fetchAvailableTimeSlots = createAsyncThunk(
  'appointment/fetchAvailableTimeSlots',
  async ({ doctorId, date }, { rejectWithValue }) => {
    try {
      // 模拟API响应
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockTimeSlots = [
            { id: '1', time: '09:00', available: true },
            { id: '2', time: '09:30', available: true },
            { id: '3', time: '10:00', available: false },
            { id: '4', time: '10:30', available: true },
            { id: '5', time: '14:00', available: true },
            { id: '6', time: '14:30', available: true },
            { id: '7', time: '15:00', available: false },
            { id: '8', time: '15:30', available: true },
          ];
          resolve(mockTimeSlots);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.message || '获取时间段失败');
    }
  }
);

// 模拟API调用 - 创建预约
export const createAppointment = createAsyncThunk(
  'appointment/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      // 模拟API响应
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 模拟随机失败情况
          if (Math.random() > 0.1) {
            const mockAppointment = {
              id: Date.now().toString(),
              appointmentNumber: `REG${Date.now()}`,
              ...appointmentData,
              status: 'pending',
              createdAt: new Date().toISOString(),
            };
            resolve(mockAppointment);
          } else {
            reject(new Error('预约失败，请稍后重试'));
          }
        }, 1000);
      });
    } catch (error) {
      return rejectWithValue(error.message || '创建预约失败');
    }
  }
);

// 模拟API调用 - 取消预约
export const cancelAppointment = createAsyncThunk(
  'appointment/cancelAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      // 模拟API响应
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 模拟随机失败情况
          if (Math.random() > 0.1) {
            resolve({ success: true, appointmentId });
          } else {
            reject(new Error('取消预约失败，请稍后重试'));
          }
        }, 800);
      });
    } catch (error) {
      return rejectWithValue(error.message || '取消预约失败');
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState: {
    appointments: [],
    currentAppointment: null,
    availableDoctors: [],
    availableTimeSlots: [],
    isLoading: false,
    error: null,
    lastCreatedAppointment: null
  },
  reducers: {
    clearAppointmentError: (state) => {
      state.error = null;
    },
    clearLastCreatedAppointment: (state) => {
      state.lastCreatedAppointment = null;
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAppointments 处理
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // fetchAvailableDoctors 处理
      .addCase(fetchAvailableDoctors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableDoctors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableDoctors = action.payload;
      })
      .addCase(fetchAvailableDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // fetchAvailableTimeSlots 处理
      .addCase(fetchAvailableTimeSlots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableTimeSlots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableTimeSlots = action.payload;
      })
      .addCase(fetchAvailableTimeSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // createAppointment 处理
      .addCase(createAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments.push(action.payload);
        state.currentAppointment = action.payload;
        state.lastCreatedAppointment = action.payload;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // cancelAppointment 处理
      .addCase(cancelAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = state.appointments.map(app => 
          app.id === action.payload.appointmentId 
            ? { ...app, status: 'cancelled' } 
            : app
        );
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearAppointmentError, 
  clearLastCreatedAppointment,
  clearCurrentAppointment 
} = appointmentSlice.actions;

export default appointmentSlice.reducer;