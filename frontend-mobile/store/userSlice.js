// 用户状态管理
const initialState = {
  userInfo: null,
  token: null,
  isLoading: false,
  error: null,
};

// Action Types
const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
const USER_LOGIN_FAILURE = 'USER_LOGIN_FAILURE';
const USER_LOGOUT = 'USER_LOGOUT';
const USER_GET_INFO_REQUEST = 'USER_GET_INFO_REQUEST';
const USER_GET_INFO_SUCCESS = 'USER_GET_INFO_SUCCESS';
const USER_GET_INFO_FAILURE = 'USER_GET_INFO_FAILURE';

// Reducer
export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case USER_LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        token: action.payload.token,
        userInfo: action.payload.userInfo,
      };
    case USER_LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case USER_LOGOUT:
      return {
        ...state,
        userInfo: null,
        token: null,
      };
    case USER_GET_INFO_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case USER_GET_INFO_SUCCESS:
      return {
        ...state,
        isLoading: false,
        userInfo: action.payload,
      };
    case USER_GET_INFO_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

// Action Creators
export const loginRequest = () => ({ type: USER_LOGIN_REQUEST });
export const loginSuccess = (payload) => ({ type: USER_LOGIN_SUCCESS, payload });
export const loginFailure = (error) => ({ type: USER_LOGIN_FAILURE, payload: error });
export const logout = () => ({ type: USER_LOGOUT });
export const getUserInfoRequest = () => ({ type: USER_GET_INFO_REQUEST });
export const getUserInfoSuccess = (userInfo) => ({ type: USER_GET_INFO_SUCCESS, payload: userInfo });
export const getUserInfoFailure = (error) => ({ type: USER_GET_INFO_FAILURE, payload: error });

// Async Actions
export const login = (username, password) => async (dispatch) => {
  dispatch(loginRequest());
  try {
    // 实际项目中这里应该调用API
    // const response = await api.login(username, password);
    
    // 模拟API响应
    const mockResponse = {
      token: 'mock_token_123456',
      userInfo: {
        id: '1',
        username: username,
        name: '测试用户',
        phone: '13800138000',
        avatar: null,
      },
    };
    
    // 保存token到localStorage
    localStorage.setItem('token', mockResponse.token);
    
    dispatch(loginSuccess(mockResponse));
    return mockResponse;
  } catch (error) {
    dispatch(loginFailure(error.message || '登录失败'));
    throw error;
  }
};

export const logoutAction = () => (dispatch) => {
  // 清除localStorage中的token
  localStorage.removeItem('token');
  dispatch(logout());
};

export const getUserInfo = () => async (dispatch) => {
  dispatch(getUserInfoRequest());
  try {
    // 实际项目中这里应该调用API
    // const token = localStorage.getItem('token');
    // const response = await api.getUserInfo(token);
    
    // 模拟API响应
    const mockUserInfo = {
      id: '1',
      username: 'testuser',
      name: '测试用户',
      phone: '13800138000',
      avatar: null,
      gender: '男',
      age: 30,
      idCard: '1101********1234',
    };
    
    dispatch(getUserInfoSuccess(mockUserInfo));
    return mockUserInfo;
  } catch (error) {
    dispatch(getUserInfoFailure(error.message || '获取用户信息失败'));
    throw error;
  }
};