import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth.slice";
import customerReducer from "./customer.slice";
import invoiceReducer from "./invoice.slice";
import paymentReducer from "./payment.slice";
import reportReducer from "./report.slice";
import userReducer from "./user.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    invoices: invoiceReducer,
    payments: paymentReducer,
    reports: reportReducer,
    users: userReducer,
  },
});

export default store;
