export class DashboardController {
  constructor({ getTotalARUseCase, getOverdueARUseCase, getHighRiskCustomersUseCase }) {
    this.getTotalARUseCase = getTotalARUseCase;
    this.getOverdueARUseCase = getOverdueARUseCase;
    this.getHighRiskCustomersUseCase = getHighRiskCustomersUseCase;
  }

  getArMetrics = async (req, res, next) => {
    try {
      const [totalAR, overdueAR, highRiskCustomers] = await Promise.all([
        this.getTotalARUseCase.execute(),
        this.getOverdueARUseCase.execute(),
        this.getHighRiskCustomersUseCase.execute()
      ]);

      return res.json({
        data: { totalAR, overdueAR, highRiskCustomers }
      });
    } catch (err) {
      next(err);
    }
  };
}