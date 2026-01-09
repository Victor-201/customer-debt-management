import { Router } from "express";

export function buildArRoutes({ controllers }) {
  const router = Router();

  // REPORTS
  router.get("/reports/aging", controllers.agingController.getAgingReport);

  // DASHBOARD
  router.get("/dashboard/ar", controllers.dashboardController.getArMetrics);

  // RISK
  router.post("/risk/assess", controllers.riskController.assessBatch);
  router.post("/risk/assess/:customerId", controllers.riskController.assessOne);

  // AUTOMATION
  router.post("/automation/reminders/run", controllers.automationController.runReminders);

  return router;
}
