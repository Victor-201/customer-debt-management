import { createSlice } from '@reduxjs/toolkit';

// Report slice placeholder - will be implemented when needed
const initialState = {
    agingReport: null,
    arSummary: null,
    loading: false,
    error: null
};

const reportSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        setAgingReport: (state, action) => {
            state.agingReport = action.payload;
        },
        setArSummary: (state, action) => {
            state.arSummary = action.payload;
        },
        clearReports: (state) => {
            state.agingReport = null;
            state.arSummary = null;
        }
    }
});

export const { setAgingReport, setArSummary, clearReports } = reportSlice.actions;

export const selectAgingReport = (state) => state.reports.agingReport;
export const selectArSummary = (state) => state.reports.arSummary;

export default reportSlice.reducer;
