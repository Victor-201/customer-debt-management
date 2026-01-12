import express from "express";

import CustomerController from "../../presentation/controllers/customer.controller.js";
import CustomerRepository from "../../application/interfaces/repositories/customer.repository.interface.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import permissionMiddleware from "../middlewares/permission.middleware.js";
import validateMiddleware from "../middlewares/validate.middleware.js";

import { CUSTOMER_PERMISSIONS } from "../../shared/constants/permissions.js";
import { execute } from "../../main/config/database.js";

import {
  createCustomerSchema,
  updateCustomerSchema,
  updateCustomerStatusSchema,
} from "../../presentation/validators/customer.schema.js";

const router = express.Router();

const customerRepository = new CustomerRepository({ execute });
const customerController = new CustomerController(customerRepository, {
  execute,
});

router.use(authMiddleware);

router.post(
  "/",
  permissionMiddleware(CUSTOMER_PERMISSIONS.CREATE),
  validateMiddleware(createCustomerSchema),
  customerController.createCustomer
);

router.get(
  "/",
  permissionMiddleware(CUSTOMER_PERMISSIONS.READ),
  customerController.getAllCustomers
);

router.get(
  "/active",
  permissionMiddleware(CUSTOMER_PERMISSIONS.READ),
  customerController.listActiveCustomers
);

router.get(
  "/:customerId",
  permissionMiddleware(CUSTOMER_PERMISSIONS.READ),
  customerController.getCustomerById
);

router.put(
  "/:customerId",
  permissionMiddleware(CUSTOMER_PERMISSIONS.UPDATE),
  validateMiddleware(updateCustomerSchema),
  customerController.updateCustomer
);

router.patch(
  "/:customerId/status",
  permissionMiddleware(CUSTOMER_PERMISSIONS.UPDATE),
  validateMiddleware(updateCustomerStatusSchema),
  customerController.updateCustomerStatus
);

router.patch(
  "/:customerId/assess-risk",
  permissionMiddleware(CUSTOMER_PERMISSIONS.UPDATE),
  customerController.assessCustomerRisk
);

router.delete(
  "/:customerId",
  permissionMiddleware(CUSTOMER_PERMISSIONS.DELETE),
  customerController.deleteCustomer
);

export default router;
