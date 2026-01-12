import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentApi } from '../api/payment.api.js';

// ============ Async Thunks ============

/**
 * Fetch all payments with filters
 */
export const fetchPayments = createAsyncThunk(
    'payments/fetchAll',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await paymentApi.getAll(filters);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Fetch payments for a specific invoice
 */
export const fetchPaymentsByInvoice = createAsyncThunk(
    'payments/fetchByInvoice',
    async (invoiceId, { rejectWithValue }) => {
        try {
            const response = await paymentApi.getByInvoiceId(invoiceId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Fetch a single payment by ID
 */
export const fetchPaymentById = createAsyncThunk(
    'payments/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await paymentApi.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Create a new payment (record payment for invoice)
 */
export const createPayment = createAsyncThunk(
    'payments/create',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await paymentApi.create(paymentData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Delete a payment (reverse payment)
 */
export const deletePayment = createAsyncThunk(
    'payments/delete',
    async (id, { rejectWithValue }) => {
        try {
            const response = await paymentApi.delete(id);
            return { id, ...response };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Fetch payment summary
 */
export const fetchPaymentSummary = createAsyncThunk(
    'payments/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await paymentApi.getSummary();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Fetch recent payments
 */
export const fetchRecentPayments = createAsyncThunk(
    'payments/fetchRecent',
    async (limit = 5, { rejectWithValue }) => {
        try {
            const response = await paymentApi.getRecent(limit);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// ============ Initial State ============

const initialState = {
    // List data
    list: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,

    // Payments for current invoice
    invoicePayments: [],

    // Recent payments (for dashboard)
    recentPayments: [],

    // Current payment (for detail view)
    current: null,

    // Summary data
    summary: null,

    // UI state
    loading: false,
    saving: false,
    error: null,
    successMessage: null,

    // Filters
    filters: {
        search: '',
        invoiceId: null,
        paymentMethod: null,
        startDate: null,
        endDate: null
    }
};

// ============ Slice ============

const paymentSlice = createSlice({
    name: 'payments',
    initialState,
    reducers: {
        // Clear invoice payments
        clearInvoicePayments: (state) => {
            state.invoicePayments = [];
        },

        // Clear current payment
        clearCurrentPayment: (state) => {
            state.current = null;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Clear success message
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },

        // Set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        // Reset filters
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },

        // Set page
        setPage: (state, action) => {
            state.page = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // -------- Fetch All --------
            .addCase(fetchPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // -------- Fetch By Invoice --------
            .addCase(fetchPaymentsByInvoice.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPaymentsByInvoice.fulfilled, (state, action) => {
                state.loading = false;
                state.invoicePayments = action.payload;
            })
            .addCase(fetchPaymentsByInvoice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // -------- Fetch By ID --------
            .addCase(fetchPaymentById.fulfilled, (state, action) => {
                state.current = action.payload;
            })

            // -------- Create --------
            .addCase(createPayment.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createPayment.fulfilled, (state, action) => {
                state.saving = false;
                state.list.unshift(action.payload.payment);
                state.invoicePayments.unshift(action.payload.payment);
                state.total += 1;
                state.successMessage = 'Ghi nhận thanh toán thành công';
            })
            .addCase(createPayment.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            // -------- Delete --------
            .addCase(deletePayment.pending, (state) => {
                state.loading = true;
            })
            .addCase(deletePayment.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.filter(pay => pay.id !== action.payload.id);
                state.invoicePayments = state.invoicePayments.filter(pay => pay.id !== action.payload.id);
                state.total -= 1;
                state.successMessage = 'Đã hủy phiếu thu';
            })
            .addCase(deletePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // -------- Summary --------
            .addCase(fetchPaymentSummary.fulfilled, (state, action) => {
                state.summary = action.payload;
            })

            // -------- Recent Payments --------
            .addCase(fetchRecentPayments.fulfilled, (state, action) => {
                state.recentPayments = action.payload;
            });
    }
});

// Export actions
export const {
    clearInvoicePayments,
    clearCurrentPayment,
    clearError,
    clearSuccessMessage,
    setFilters,
    resetFilters,
    setPage
} = paymentSlice.actions;

// Export selectors
export const selectPayments = (state) => state.payments.list;
export const selectInvoicePayments = (state) => state.payments.invoicePayments;
export const selectRecentPayments = (state) => state.payments.recentPayments;
export const selectCurrentPayment = (state) => state.payments.current;
export const selectPaymentsLoading = (state) => state.payments.loading;
export const selectPaymentsSaving = (state) => state.payments.saving;
export const selectPaymentsError = (state) => state.payments.error;
export const selectPaymentsSuccess = (state) => state.payments.successMessage;
export const selectPaymentsFilters = (state) => state.payments.filters;
export const selectPaymentsPagination = (state) => ({
    page: state.payments.page,
    limit: state.payments.limit,
    total: state.payments.total,
    totalPages: state.payments.totalPages
});

// Export reducer
export default paymentSlice.reducer;
