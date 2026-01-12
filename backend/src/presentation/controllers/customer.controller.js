import CreateCustomerUseCase from "../../application/use-cases/customer/createCustomer.usecase.js";
import UpdateCustomerUseCase from "../../application/use-cases/customer/updateCustomer.usecase.js";
import DeleteCustomerUseCase from "../../application/use-cases/customer/deleteCustomer.usecase.js";
import GetAllCustomersUseCase from "../../application/use-cases/customer/getAllCustomers.usecase.js";
import GetCustomerByIdUseCase from "../../application/use-cases/customer/getCustomerById.usecase.js";
import ListCustomersUseCase from "../../application/use-cases/customer/listCustomers.usecase.js";
import UpdateCustomerStatusUseCase from "../../application/use-cases/customer/updateCustomerStatus.usecase.js";
import AssessCustomerRiskUseCase from "../../application/use-cases/customer/assessCustomerRisk.usecase.js";

class CustomerController {
  constructor(customerRepository, database) {
    this.createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
    this.updateCustomerUseCase = new UpdateCustomerUseCase(customerRepository);
    this.deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepository);
    this.getAllCustomersUseCase = new GetAllCustomersUseCase(customerRepository);
    this.getCustomerByIdUseCase = new GetCustomerByIdUseCase(customerRepository);
    this.listCustomersUseCase = new ListCustomersUseCase(customerRepository);
    this.updateCustomerStatusUseCase =
      new UpdateCustomerStatusUseCase(customerRepository);
    this.assessCustomerRiskUseCase = new AssessCustomerRiskUseCase(
      customerRepository,
      database
    );
  }

  createCustomer = async (req, res) => {
    try {
      const customer = await this.createCustomerUseCase.execute(req.body);

      res.status(201).json({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        paymentTerm: customer.paymentTerm.value,
        creditLimit: customer.creditLimit.amount,
        riskLevel: customer.riskLevel,
        status: customer.status,
        createdAt: customer.createdAt,
      });
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  getAllCustomers = async (req, res) => {
    try {
      const customers = await this.getAllCustomersUseCase.execute();
      res.json(customers);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  listActiveCustomers = async (req, res) => {
    try {
      const customers = await this.listCustomersUseCase.execute();
      res.json(customers);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  getCustomerById = async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await this.getCustomerByIdUseCase.execute(customerId);
      res.json(customer);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  updateCustomer = async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await this.updateCustomerUseCase.execute(
        customerId,
        req.body
      );

      res.json({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        paymentTerm: customer.paymentTerm.value,
        creditLimit: customer.creditLimit.amount,
        riskLevel: customer.riskLevel,
        status: customer.status,
        updatedAt: customer.updatedAt,
      });
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  updateCustomerStatus = async (req, res) => {
    try {
      const { customerId } = req.params;
      const { status } = req.body;

      const customer = await this.updateCustomerStatusUseCase.execute(
        customerId,
        status
      );

      res.json({
        message: "Customer status updated successfully",
        status: customer.status,
      });
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  assessCustomerRisk = async (req, res) => {
    try {
      const { customerId } = req.params;
      const result = await this.assessCustomerRiskUseCase.execute(customerId);
      res.json(result);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  deleteCustomer = async (req, res) => {
    try {
      const { customerId } = req.params;
      const result = await this.deleteCustomerUseCase.execute(customerId);
      res.json(result);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  #handleError(res, error) {
    if (error.name === "BusinessRuleError") {
      return res.status(400).json({ error: error.message });
    }

    console.error("Customer error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default CustomerController;
