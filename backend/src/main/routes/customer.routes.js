import express from "express";
import CustomerController from "../../presentation/controllers/customer.controller.js";
import CustomerRepository from "../../application/interfaces/repositories/customer.repository.interface.js"
import authMiddleware from "../middlewares/auth.middleware.js";
import validateMiddleware from "../middlewares/validate.middleware.js";
import { execute } from "../../main/config/database.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../../presentation/validators/customer.schema.js";

const router = express.Router();

const customerRepository = new CustomerRepository({ execute });
const customerController = new CustomerController(customerRepository);

router.use(authMiddleware);

router.post("/", validateMiddleware(createCustomerSchema), (req, res) =>
  customerController.createCustomer(req, res)
);

router.get("/", (req, res) => customerController.getAllCustomers(req, res));

router.get("/:customerId", (req, res) =>
  customerController.getCustomerById(req, res)
);

router.put(
  "/:customerId",
  validateMiddleware(updateCustomerSchema),
  (req, res) => customerController.updateCustomer(req, res)
);

router.delete("/:customerId", (req, res) =>
  customerController.deleteCustomer(req, res)
);

router.patch("/:customerId/activate", (req, res) =>
  customerController.activateCustomer(req, res)
);

router.patch("/:customerId/deactivate", (req, res) =>
  customerController.deactivateCustomer(req, res)
);

export default router;
