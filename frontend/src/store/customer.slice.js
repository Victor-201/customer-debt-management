import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customerApi } from "@/api/customer.api";

/* =======================
   ASYNC THUNKS
======================= */

// Lấy danh sách khách hàng
export const fetchCustomers = createAsyncThunk(
  "customer/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await customerApi.getAllCustomers();
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Lấy khách hàng theo ID
export const fetchCustomerById = createAsyncThunk(
  "customer/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await customerApi.getCustomerById(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Tạo khách hàng mới
export const createCustomer = createAsyncThunk(
  "customer/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await customerApi.createCustomer(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Cập nhật khách hàng
export const updateCustomer = createAsyncThunk(
  "customer/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await customerApi.updateCustomer(id, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Xóa khách hàng
export const deleteCustomer = createAsyncThunk(
  "customer/delete",
  async (id, { rejectWithValue }) => {
    try {
      await customerApi.deleteCustomer(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* =======================
   SLICE
======================= */

const customerSlice = createSlice({
  name: "customer",
  initialState: {
    list: [],
    selectedCustomer: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearSelectedCustomer(state) {
      state.selectedCustomer = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH BY ID
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.selectedCustomer = action.payload;
      })

      // CREATE
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      // UPDATE
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.selectedCustomer = action.payload;
      })

      // DELETE
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (c) => c.id !== action.payload
        );
      });
  },
});

export const { clearSelectedCustomer } = customerSlice.actions;

// Selectors
export const selectCustomerOptions = (state) => state.customer.list;

export default customerSlice.reducer;
