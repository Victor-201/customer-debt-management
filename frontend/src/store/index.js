import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice.js';
import customerReducer from './customer.slice.js';
import invoiceReducer from './invoice.slice.js';
import paymentReducer from './payment.slice.js';
import reportReducer from './report.slice.js';

/**
 * Configure Redux store with all slices
 */
export const store = configureStore({
    reducer: {
        auth: authReducer,
        customers: customerReducer,
        invoices: invoiceReducer,
        payments: paymentReducer,
        reports: reportReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production'
});

// Export types for TypeScript (if needed in future)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

export default store;
