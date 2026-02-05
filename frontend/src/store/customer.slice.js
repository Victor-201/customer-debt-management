import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customerApi } from "@/api/customer.api";

/* =======================
   ASYNC THUNKS
======================= */

// Lấy danh sách khách hàng (có phân trang)
export const fetchCustomers = createAsyncThunk(
  "customer/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await customerApi.getAllCustomers(params);
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
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
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
        // Handle paginated response: { data: [...], pagination: {...} }
        if (action.payload?.data && action.payload?.pagination) {
          state.list = action.payload.data;
          state.pagination = action.payload.pagination;
        } else {
          // Fallback for non-paginated response
          state.list = Array.isArray(action.payload) ? action.payload : [];
        }
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH BY ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedCustomer = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload || 'Không tìm thấy khách hàng';
        state.selectedCustomer = null;
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
export const selectCustomerOptions = (state) => state.customers.list;

export default customerSlice.reducer;
