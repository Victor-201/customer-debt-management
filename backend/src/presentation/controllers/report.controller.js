import { AgingPresenter } from "../presenters/aging.presenter.js";

class ReportController {
    constructor({
        generateAgingReportUseCase,
        getHighRiskCustomersUseCase,
        getOverdueArUseCase,
        getTotalARUseCase,
    }) {
        this.generateAgingReportUseCase = generateAgingReportUseCase;
        this.getHighRiskCustomersUseCase = getHighRiskCustomersUseCase;
        this.getOverdueArUseCase = getOverdueArUseCase;
        this.getTotalARUseCase = getTotalARUseCase;
    }

    getAgingReport = async (req, res) => {
        try {
            const data = await this.generateAgingReportUseCase.execute();
            const viewModel = AgingPresenter.toViewModel(data);
            res.json({ data: viewModel });
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
