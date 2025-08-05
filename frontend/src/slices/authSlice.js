import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null, // Don't persist sensitive data
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      // Store only non-sensitive user info
      const { token, ...userInfo } = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
