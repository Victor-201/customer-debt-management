import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoiceApi } from '../api/invoice.api.js';

// ============ Async Thunks ============

/**
 * Fetch all invoices with filters
 */
export const fetchInvoices = createAsyncThunk(
    'invoices/fetchAll',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await invoiceApi.getAll(filters);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Fetch a single invoice by ID
 */
export const fetchInvoiceById = createAsyncThunk(
    'invoices/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await invoiceApi.getById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Create a new invoice
 */
export const createInvoice = createAsyncThunk(
    'invoices/create',
    async (invoiceData, { rejectWithValue }) => {
        try {
            const response = await invoiceApi.create(invoiceData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Update an existing invoice
 */
export const updateInvoice = createAsyncThunk(
    'invoices/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await invoiceApi.update(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Update invoice status
 */
export const updateInvoiceStatus = createAsyncThunk(
    'invoices/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await invoiceApi.updateStatus(id, status);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Send invoice (DRAFT -> PENDING)
 */
export const sendInvoice = createAsyncThunk(
    'invoices/send',
    async (id, { rejectWithValue }) => {
        try {
            const response = await invoiceApi.send(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Cancel an invoice
 */
export const cancelInvoice = createAsyncThunk(
    'invoices/cancel',
    async (id, { rejectWithValue }) => {
        try {
            const response = await invoiceApi.cancel(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Fetch invoice summary
 */
export const fetchInvoiceSummary = createAsyncThunk(
    'invoices/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await invoiceApi.getSummary();
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

    // Current invoice (for detail/edit view)
    current: null,

    // Summary data
    summary: null,

    // UI state
    loading: false,
    detailLoading: false,
    saving: false,
    error: null,

    // Filters
    filters: {
        status: 'ALL',
        search: '',
        customerId: null,
        startDate: null,
        endDate: null,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    }
};

// ============ Slice ============

const invoiceSlice = createSlice({
    name: 'invoices',
    initialState,
    reducers: {
        // Clear current invoice
        clearCurrentInvoice: (state) => {
            state.current = null;
            state.detailLoading = false;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
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
        },

        // Update invoice in list (used when payment is recorded)
        updateInvoiceInList: (state, action) => {
            const updatedInvoice = action.payload;
            const index = state.list.findIndex(inv => inv.id === updatedInvoice.id);
            if (index !== -1) {
                state.list[index] = updatedInvoice;
            }
            if (state.current && state.current.id === updatedInvoice.id) {
                state.current = updatedInvoice;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // -------- Fetch All --------
            .addCase(fetchInvoices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInvoices.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload?.data || [];
                state.total = action.payload?.total || 0;
                state.page = action.payload?.page || 1;
                state.limit = action.payload?.limit || 10;
                state.totalPages = action.payload?.totalPages || 0;
            })
            .addCase(fetchInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // -------- Fetch By ID --------
            .addCase(fetchInvoiceById.pending, (state) => {
                state.detailLoading = true;
                state.error = null;
            })
            .addCase(fetchInvoiceById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.current = action.payload;
            })
            .addCase(fetchInvoiceById.rejected, (state, action) => {
                state.detailLoading = false;
                state.error = action.payload;
            })

            // -------- Create --------
            .addCase(createInvoice.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createInvoice.fulfilled, (state, action) => {
                state.saving = false;
                state.list.unshift(action.payload);
                state.total += 1;
            })
            .addCase(createInvoice.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            // -------- Update --------
            .addCase(updateInvoice.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateInvoice.fulfilled, (state, action) => {
                state.saving = false;
                const index = state.list.findIndex(inv => inv.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
                if (state.current && state.current.id === action.payload.id) {
                    state.current = action.payload;
                }
            })
            .addCase(updateInvoice.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            // -------- Update Status --------
            .addCase(updateInvoiceStatus.fulfilled, (state, action) => {
                const index = state.list.findIndex(inv => inv.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
                if (state.current && state.current.id === action.payload.id) {
                    state.current = action.payload;
                }
            })

            // -------- Send Invoice --------
            .addCase(sendInvoice.fulfilled, (state, action) => {
                const index = state.list.findIndex(inv => inv.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
                if (state.current && state.current.id === action.payload.id) {
                    state.current = action.payload;
                }
            })

            // -------- Cancel Invoice --------
            .addCase(cancelInvoice.fulfilled, (state, action) => {
                const index = state.list.findIndex(inv => inv.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
                if (state.current && state.current.id === action.payload.id) {
                    state.current = action.payload;
                }
            })

            // -------- Summary --------
            .addCase(fetchInvoiceSummary.fulfilled, (state, action) => {
                state.summary = action.payload;
            });
    }
});

// Export actions
export const {
    clearCurrentInvoice,
    clearError,
    setFilters,
    resetFilters,
    setPage,
    updateInvoiceInList
} = invoiceSlice.actions;

// Export selectors
export const selectInvoices = (state) => state.invoices.list;
export const selectCurrentInvoice = (state) => state.invoices.current;
export const selectInvoicesLoading = (state) => state.invoices.loading;
export const selectInvoicesSaving = (state) => state.invoices.saving;
export const selectInvoicesError = (state) => state.invoices.error;
export const selectInvoicesFilters = (state) => state.invoices.filters;
export const selectInvoicesPagination = (state) => ({
    page: state.invoices.page,
    limit: state.invoices.limit,
    total: state.invoices.total,
    totalPages: state.invoices.totalPages
});

// Export reducer
export default invoiceSlice.reducer;
