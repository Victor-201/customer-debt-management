import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth.slice";
import customerReducer from "./customer.slice";
import invoiceReducer from "./invoice.slice";
import paymentReducer from "./payment.slice";
import reportReducer from "./report.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    invoices: invoiceReducer,
    payments: paymentReducer,
    reports: reportReducer,
  },
});

export default store;
