import CreateCustomerUseCase from "../../application/use-cases/customer/createCustomer.usecase.js";
import UpdateCustomerUseCase from "../../application/use-cases/customer/updateCustomer.usecase.js";
import DeleteCustomerUseCase from "../../application/use-cases/customer/deleteCustomer.usecase.js";
import GetAllCustomersUseCase from "../../application/use-cases/customer/getAllCustomers.usecase.js";
import GetCustomerByIdUseCase from "../../application/use-cases/customer/getCustomerById.usecase.js";

class CustomerController {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;

    this.createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
    this.updateCustomerUseCase = new UpdateCustomerUseCase(customerRepository);
    this.deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepository);
    this.getAllCustomersUseCase = new GetAllCustomersUseCase(customerRepository);
    this.getCustomerByIdUseCase = new GetCustomerByIdUseCase(customerRepository);
  }

  async createCustomer(req, res) {
    try {
      const customerData = req.body;
      const customer = await this.createCustomerUseCase.execute(customerData);

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
      if (error.name === "BusinessRuleError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Create customer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getAllCustomers(req, res) {
    try {
      const customers = await this.getAllCustomersUseCase.execute();
      res.json(customers);
    } catch (error) {
      console.error("Get all customers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCustomerById(req, res) {
    try {
      const { customerId } = req.params;
      const customer = await this.getCustomerByIdUseCase.execute(customerId);
      res.json(customer);
    } catch (error) {
      if (error.name === "BusinessRuleError") {
        return res.status(404).json({ error: error.message });
      }
      console.error("Get customer by id error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const customerData = req.body;
      const customer = await this.updateCustomerUseCase.execute(customerId, customerData);

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
      if (error.name === "BusinessRuleError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Update customer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const result = await this.deleteCustomerUseCase.execute(customerId);
      res.json(result);
    } catch (error) {
      if (error.name === "BusinessRuleError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Delete customer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async activateCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const customer = await this.customerRepository.findById(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      customer.activate();
      await this.customerRepository.update(customer);
      res.json({ message: "Customer activated successfully" });
    } catch (error) {
      console.error("Activate customer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deactivateCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const customer = await this.customerRepository.findById(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      customer.deactivate();
      await this.customerRepository.update(customer);
      res.json({ message: "Customer deactivated successfully" });
    } catch (error) {
      console.error("Deactivate customer error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default CustomerController;
