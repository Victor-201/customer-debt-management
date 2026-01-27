import apiClient from "./axiosClient";

export const automationApi = {
    /**
     * Trigger gửi email nhắc nợ thủ công
     * POST /api/ar/automation/reminders/run
     * Response: { data: { sent, failed, errors } }
     */
    runReminders() {
        return apiClient.post("/api/ar/automation/reminders/run");
    },

    /**
     * Lấy báo cáo aging từ AR module
     * GET /api/ar/reports/aging
     */
    getARAgingReport() {
        return apiClient.get("/api/ar/reports/aging");
    },
};
