class CustomerController {
  constructor({
    createCustomerUseCase,
    updateCustomerUseCase,
    deleteCustomerUseCase,
    getAllCustomersUseCase,
    getCustomerByIdUseCase,
    listCustomersUseCase,
    updateCustomerStatusUseCase,
    assessCustomerRiskUseCase,
  }) {
    this.createCustomerUseCase = createCustomerUseCase;
    this.updateCustomerUseCase = updateCustomerUseCase;
    this.deleteCustomerUseCase = deleteCustomerUseCase;
    this.getAllCustomersUseCase = getAllCustomersUseCase;
    this.getCustomerByIdUseCase = getCustomerByIdUseCase;
    this.listCustomersUseCase = listCustomersUseCase;
    this.updateCustomerStatusUseCase = updateCustomerStatusUseCase;
    this.assessCustomerRiskUseCase = assessCustomerRiskUseCase;
  }

  createCustomer = async (req, res) => {
    try {
      const customer = await this.createCustomerUseCase.execute(req.body);
      res.status(201).json(customer.toResponse());
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
      const customer = await this.getCustomerByIdUseCase.execute(req.params.customerId);
      res.json(customer);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  updateCustomer = async (req, res) => {
    try {
      const customer = await this.updateCustomerUseCase.execute(
        req.params.customerId,
        req.body
      );
      res.json(customer.toResponse());
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  updateCustomerStatus = async (req, res) => {
    try {
      const customer = await this.updateCustomerStatusUseCase.execute(
        req.params.customerId,
        req.body.status
      );
      res.json({ status: customer.status });
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  assessCustomerRisk = async (req, res) => {
    try {
      const result = await this.assessCustomerRiskUseCase.execute(req.params.customerId);
      res.json(result);
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  deleteCustomer = async (req, res) => {
    try {
      await this.deleteCustomerUseCase.execute(req.params.customerId);
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      this.#handleError(res, error);
    }
  };

  #handleError(res, error) {
    if (error.name === "BusinessRuleError") {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default CustomerController;
