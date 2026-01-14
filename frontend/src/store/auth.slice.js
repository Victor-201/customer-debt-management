import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../api/auth.api";

export const login = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error || "Đăng nhập thất bại"
      );
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const refresh_token = localStorage.getItem("refresh_token");
      if (!refresh_token) throw new Error("No refresh token");

      const res = await authApi.refresh(refresh_token);
      return res.data;
    } catch (err) {
      return rejectWithValue("Phiên đăng nhập đã hết hạn");
    }
  }
);

export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
    } catch (err) {
      return rejectWithValue(null);
    }
  }
);

const initialState = {
  user: null,
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("refresh_token"),
    loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
    initialState,
    reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  },
  extraReducers: (builder) => {
    builder
      /* ================= LOGIN ================= */
      .addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { access_token, refresh_token, user } = action.payload;

            state.loading = false;
        state.user = user;
        state.accessToken = access_token;
        state.refreshToken = refresh_token;

        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
      })
      .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
      })

      /* ================= REFRESH ================= */
      .addCase(refreshToken.fulfilled, (state, action) => {
        const { access_token, refresh_token } = action.payload;

        state.accessToken = access_token;
        localStorage.setItem("access_token", access_token);

        if (refresh_token) {
          state.refreshToken = refresh_token;
          localStorage.setItem("refresh_token", refresh_token);
        }
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })

      /* ================= LOGOUT ================= */
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      });
  },
});

/* ================= SELECTORS ================= */
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectAccessToken = (state) =>
  state.auth.accessToken;
export const selectIsAuthenticated = (state) =>
  Boolean(state.auth.accessToken);
export const selectAuthLoading = (state) =>
  state.auth.loading;
export const selectAuthError = (state) =>
  state.auth.error;

/* ================= EXPORT ================= */
export const { logout } = authSlice.actions;
export default authSlice.reducer;
