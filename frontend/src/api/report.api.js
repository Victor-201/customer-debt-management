import apiClient from "./axiosClient";

export const reportApi = {
    /**
     * Báo cáo tuổi nợ (Aging Report)
     * GET /api/report/aging
     * Response: { data: { current, overdue_1_30, overdue_31_60, overdue_61_90, overdue_90_plus } }
     */
    getAgingReport() {
        return apiClient.get("/api/report/aging");
    },

    /**
     * Danh sách khách hàng rủi ro cao
     * GET /api/report/high-risk-customers
     * Response: { data: [{ customer, totalDebt, oldestOverdueDays, riskLevel }] }
     */
    getHighRiskCustomers() {
        return apiClient.get("/api/report/high-risk-customers");
    },

    /**
     * Báo cáo công nợ quá hạn
     * GET /api/report/overdue-report
     * Response: { data: { totalOverdueAmount, totalOverdueCount, invoices } }
     */
    getOverdueReport() {
        return apiClient.get("/api/report/overdue-report");
    },

    /**
     * Tổng công nợ phải thu
     * GET /api/report/total-ar
     * Response: { data: { totalAR, totalPaid, totalUnpaid } }
     */
    getTotalAR() {
        return apiClient.get("/api/report/total-ar");
    },
};
