import express from "express";

import CustomerController from "../../presentation/controllers/customer.controller.js";

import CustomerRepository from "../../infrastructure/database/repositories/customer.repository.js";

import CreateCustomerUseCase from "../../application/use-cases/customer/createCustomer.usecase.js";
import UpdateCustomerUseCase from "../../application/use-cases/customer/updateCustomer.usecase.js";
import DeleteCustomerUseCase from "../../application/use-cases/customer/deleteCustomer.usecase.js";
import GetAllCustomersUseCase from "../../application/use-cases/customer/getAllCustomers.usecase.js";
import GetCustomerByIdUseCase from "../../application/use-cases/customer/getCustomerById.usecase.js";
import ListCustomersUseCase from "../../application/use-cases/customer/listCustomers.usecase.js";
import UpdateCustomerStatusUseCase from "../../application/use-cases/customer/updateCustomerStatus.usecase.js";
import AssessCustomerRiskUseCase from "../../application/use-cases/customer/assessCustomerRisk.usecase.js";

import { sequelize } from "../config/database.js";
import initCustomerModel from "../../infrastructure/database/models/customer.model.js";
import initInvoiceModel from "../../infrastructure/database/models/invoice.model.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import permissionMiddleware from "../middlewares/permission.middleware.js";
import validateMiddleware from "../middlewares/validate.middleware.js";

import { CUSTOMER_PERMISSIONS } from "../../shared/constants/permissions.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
  updateCustomerStatusSchema,
} from "../../presentation/validators/customer.schema.js";

const router = express.Router();

const CustomerModel = initCustomerModel(sequelize);
const InvoiceModel = initInvoiceModel(sequelize);

const customerRepository = new CustomerRepository({
  CustomerModel,
  InvoiceModel,
});

const createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
const updateCustomerUseCase = new UpdateCustomerUseCase(customerRepository);
const deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepository);
const getAllCustomersUseCase = new GetAllCustomersUseCase(customerRepository);
const getCustomerByIdUseCase = new GetCustomerByIdUseCase(customerRepository);
const listCustomersUseCase = new ListCustomersUseCase(customerRepository);
const updateCustomerStatusUseCase =
  new UpdateCustomerStatusUseCase(customerRepository);
const assessCustomerRiskUseCase =
  new AssessCustomerRiskUseCase(customerRepository);

const customerController = new CustomerController({
  createCustomerUseCase,
  updateCustomerUseCase,
  deleteCustomerUseCase,
  getAllCustomersUseCase,
  getCustomerByIdUseCase,
  listCustomersUseCase,
  updateCustomerStatusUseCase,
  assessCustomerRiskUseCase,
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
