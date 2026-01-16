export class AgingPresenter {
    static toViewModel(data) {
        if (!data) return null;

        const total = data.total || 0;
        const calculatePercent = (val) => (total > 0 ? (val / total) * 100 : 0);

        const buckets = [
            { label: "Current", amount: data.current, percent: calculatePercent(data.current) },
            { label: "1-30 Days", amount: data.overdue1To30, percent: calculatePercent(data.overdue1To30) },
            { label: "31-60 Days", amount: data.overdue31To60, percent: calculatePercent(data.overdue31To60) },
            { label: "61-90 Days", amount: data.overdue61To90, percent: calculatePercent(data.overdue61To90) },
            { label: "90+ Days", amount: data.overdue90Plus, percent: calculatePercent(data.overdue90Plus) },
        ];

        const riskAssessment = this.#assessRisk(data);

        return {
            summary: {
                totalOutstanding: total,
                totalOverdue: total - data.current,
                riskLevel: riskAssessment.level,
                status: riskAssessment.status,
            },
            buckets,
            alerts: riskAssessment.alerts,
            formattedAt: new Date().toISOString(),
        };
    }

    static #assessRisk(data) {
        const alerts = [];
        let level = "LOW";
        let status = "Healthy";

        const overdueRatio = data.total > 0 ? (data.total - data.current) / data.total : 0;

        if (data.overdue90Plus > 0) {
            level = "CRITICAL";
            status = "Critical Risk";
            alerts.push({
                type: "ERROR",
                message: `High priority: ${data.overdue90Plus.toLocaleString("vi-VN")} VND is overdue by more than 90 days.`,
            });
        } else if (data.overdue61To90 > 0 || overdueRatio > 0.5) {
            level = "HIGH";
            status = "High Risk";
            alerts.push({
                type: "WARNING",
                message: "Significant portion of debt is increasingly overdue.",
            });
        } else if (data.overdue31To60 > 0 || overdueRatio > 0.2) {
            level = "MEDIUM";
            status = "Moderate Risk";
            alerts.push({
                type: "INFO",
                message: "Some payments are lagging behind due dates.",
            });
        }

        if (overdueRatio === 0 && data.total > 0) {
            status = "All Current";
        }

        return { level, status, alerts };
    }
}
