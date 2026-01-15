import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";

class ValidateCreditLimitUseCase {
  constructor(customerRepository, invoiceRepository) {
    this.customerRepository = customerRepository;
    this.invoiceRepository = invoiceRepository;
  }

  async execute({ customerId, invoiceTotalAmount, invoiceId }) {
    let finalCustomerId = customerId;

    let existingInvoice = null;
    if (!finalCustomerId && invoiceId) {
      existingInvoice = await this.invoiceRepository.findById(invoiceId);
      if (existingInvoice) {
        finalCustomerId = existingInvoice.customer_id;
      }
    }

    if (!finalCustomerId) {
      throw new BusinessRuleError(
        "Customer not found (ID required for credit check)"
      );
    }

    const customer = await this.customerRepository.findById(finalCustomerId);
    if (!customer) {
      throw new BusinessRuleError("Customer not found");
    }

    const outstandingInvoices =
      await this.invoiceRepository.findOutstandingByCustomer(finalCustomerId);

    let currentDebt = 0;
    for (const inv of outstandingInvoices) {
      if (invoiceId && inv.id === invoiceId) continue;
      currentDebt += inv.balance_amount.amount;
    }

    const newTotal = Number(invoiceTotalAmount);
    if (Number.isNaN(newTotal) || newTotal < 0) {
      throw new BusinessRuleError("Invalid invoice total amount");
    }

    let newInvoiceBalance = newTotal;

    if (invoiceId) {
      if (!existingInvoice) {
        existingInvoice = await this.invoiceRepository.findById(invoiceId);
      }

      if (!existingInvoice) {
        throw new BusinessRuleError("Invoice not found");
      }

      const paidAmount = existingInvoice.paid_amount.amount;
      newInvoiceBalance = newTotal - paidAmount;

      if (newInvoiceBalance < 0) {
        throw new BusinessRuleError(
          "Invoice total cannot be less than paid amount"
        );
      }
    }

    const totalExposure = currentDebt + newInvoiceBalance;

    if (totalExposure > customer.creditLimit.amount) {
      throw new BusinessRuleError(
        `Credit limit exceeded. Limit=${customer.creditLimit.amount}, Exposure=${totalExposure}`
      );
    }

    return {
      success: true,
      limit: customer.creditLimit.amount,
      outstanding: currentDebt,
      newInvoiceBalance,
      newExposure: totalExposure,
      remainingCredit: customer.creditLimit.amount - totalExposure,
    };
  }
}

export default ValidateCreditLimitUseCase;
