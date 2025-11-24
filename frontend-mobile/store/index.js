import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import appointmentReducer from './appointmentSlice';
import departmentReducer from './departmentSlice';
import doctorReducer from './doctorSlice';

// 使用Redux Toolkit创建store
const store = configureStore({
  reducer: {
    user: userReducer,
    appointment: appointmentReducer,
    department: departmentReducer,
    doctor: doctorReducer,
  },
});

export default store;