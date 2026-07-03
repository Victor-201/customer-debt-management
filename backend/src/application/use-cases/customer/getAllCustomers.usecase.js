export default class GetAllCustomersUseCase {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async execute(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      paymentTerm,
      riskLevel,
      status,
    } = options;

    // Get all customers first (for filtering)
    let customers = await this.customerRepository.findAll();

    // Apply filters
    if (search) {
      const term = search.toLowerCase();
      customers = customers.filter(c =>
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
      );
    }

    if (paymentTerm) {
      customers = customers.filter(c => c.paymentTerm === paymentTerm);
    }

    if (riskLevel) {
      customers = customers.filter(c => c.riskLevel === riskLevel);
    }

    if (status) {
      customers = customers.filter(c => c.status === status);
    }

    // Sort
    customers.sort((a, b) => {
      let compareA = a[sortBy];
      let compareB = b[sortBy];

      // Handle string comparison
      if (typeof compareA === 'string') {
        compareA = compareA.toLowerCase();
        compareB = compareB?.toLowerCase() || '';
      }

      // Handle date comparison
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        compareA = new Date(compareA).getTime();
        compareB = new Date(compareB).getTime();
      }

      if (sortOrder === 'ASC') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

    // Calculate pagination
    const total = customers.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedCustomers = customers.slice(offset, offset + limit);

    return {
      data: paginatedCustomers.map((c) => this.#toResponse(c)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
      }
    };
  }

  #toResponse(customer) {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      paymentTerm: customer.paymentTerm,
      creditLimit: customer.creditLimit,
      riskLevel: customer.riskLevel,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
