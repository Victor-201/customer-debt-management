import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerApi } from '../api/customer.api.js';

// Async thunks
export const fetchCustomers = createAsyncThunk(
    'customers/fetchAll',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await customerApi.getAll(filters);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCustomerById = createAsyncThunk(
    'customers/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await customerApi.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCustomerOptions = createAsyncThunk(
    'customers/fetchOptions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await customerApi.getOptions();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    list: [],
    options: [],
    current: null,
    total: 0,
    loading: false,
    error: null
};

const customerSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {
        clearCurrentCustomer: (state) => {
            state.current = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data;
                state.total = action.payload.total;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchCustomerById.fulfilled, (state, action) => {
                state.current = action.payload;
            })
            .addCase(fetchCustomerOptions.fulfilled, (state, action) => {
                state.options = action.payload;
            });
    }
});

export const { clearCurrentCustomer, clearError } = customerSlice.actions;

// Selectors
export const selectCustomers = (state) => state.customers.list;
export const selectCustomerOptions = (state) => state.customers.options;
export const selectCurrentCustomer = (state) => state.customers.current;
export const selectCustomersLoading = (state) => state.customers.loading;

export default customerSlice.reducer;
