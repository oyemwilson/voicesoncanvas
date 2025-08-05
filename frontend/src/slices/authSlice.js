import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      // Store user info (without token since it's in HTTP-only cookie)
      const { token, ...userInfoWithoutToken } = action.payload;
      state.userInfo = userInfoWithoutToken;
      localStorage.setItem('userInfo', JSON.stringify(userInfoWithoutToken));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
      // Note: HTTP-only cookie will be cleared by backend logout endpoint
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;