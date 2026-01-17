import { AgingPresenter } from "../presenters/aging.presenter.js";

export default class AgingController {
  constructor({ generateAgingReportUseCase }) {
    this.generateAgingReportUseCase = generateAgingReportUseCase;
  }

  getAgingReport = async (req, res, next) => {
    try {
      const groupBy = (req.query.groupBy || "customer").toLowerCase();
      const customerId = req.query.customerId ? Number(req.query.customerId) : null;

      if (!["customer", "invoice"].includes(groupBy)) {
        return res.status(400).json({ message: "groupBy must be customer|invoice" });
      }

      const data = await this.generateAgingReportUseCase.execute({
        groupBy,
        customerId
      });

      const viewModel = AgingPresenter.toViewModel(data);

      return res.json({ data: viewModel });
    } catch (err) {
      next(err);
    }
  };
}
