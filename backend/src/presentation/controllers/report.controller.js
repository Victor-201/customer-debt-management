import GenerateAgingReportUseCase from "../../application/use-cases/report/generateAgingReport.usecase.js";
import GetHighRiskCustomersUseCase from "../../application/use-cases/report/getHighRiskCustomers.usecase.js";
import GetOverdueArUseCase from "../../application/use-cases/report/getOverdueAr.usecase.js";
import GetTotalARUseCase from "../../application/use-cases/report/getTotalAR.usecase.js";

class ReportController {
    constructor(invoiceRepository, customerRepository) {
        this.generateAgingReportUseCase = new GenerateAgingReportUseCase(invoiceRepository);
        this.getHighRiskCustomersUseCase = new GetHighRiskCustomersUseCase(customerRepository);
        this.getOverdueArUseCase = new GetOverdueArUseCase(invoiceRepository);
        this.getTotalARUseCase = new GetTotalARUseCase(invoiceRepository);
    }

    getAgingReport = async (req, res) => {
        try {
            const report = await this.generateAgingReportUseCase.execute();
            res.json(report);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    };

    getHighRiskCustomers = async (req, res) => {
        try {
            const customers = await this.getHighRiskCustomersUseCase.execute();
            res.json(customers);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    };

    getOverdueReport = async (req, res) => {
        try {
            const report = await this.getOverdueArUseCase.execute();
            res.json(report);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    };

    getTotalARReport = async (req, res) => {
        try {
            const report = await this.getTotalARUseCase.execute();
            res.json(report);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    };
}

export default ReportController;
