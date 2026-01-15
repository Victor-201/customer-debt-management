import { BusinessRuleError } from "../../../shared/errors/BusinessRuleError.js";
import { Money } from "../../../domain/value-objects/Money.js";

class ValidateCreditLimitUseCase {
  constructor(customerRepository, invoiceRepository) {
    this.customerRepository = customerRepository;
    this.invoiceRepository = invoiceRepository;
  }

  async execute({ customerId, invoiceId, newTotalAmount }) {
    let existingInvoice = null;
    let finalCustomerId = customerId;

    // 1. Resolve invoice + customer
    if (invoiceId) {
      existingInvoice = await this.invoiceRepository.findById(invoiceId);
      if (!existingInvoice) {
        throw new BusinessRuleError("Invoice not found");
      }
      finalCustomerId ??= existingInvoice.customer_id;
    }

    if (!finalCustomerId) {
      throw new BusinessRuleError("Customer not found");
    }

    const customer = await this.customerRepository.findById(finalCustomerId);
    if (!customer) {
      throw new BusinessRuleError("Customer not found");
    }

    const creditLimit = new Money(customer.creditLimit, "VND");
    const currency = creditLimit.currency;

    // 2. Tính current outstanding (trừ invoice đang update)
    const outstandingInvoices =
      await this.invoiceRepository.findOutstandingByCustomer(finalCustomerId);

    let currentDebt = new Money(0, currency);

    for (const inv of outstandingInvoices) {
      if (invoiceId && inv.id === invoiceId) continue;

      currentDebt = currentDebt.add(
        new Money(inv.balance_amount.amount, currency)
      );
    }

    // 3. Tính balance mới của invoice
    let newInvoiceBalance = new Money(0, currency);

    if (existingInvoice && newTotalAmount !== undefined) {
      const paid = new Money(existingInvoice.paid_amount.amount, currency);
      const newTotal = new Money(newTotalAmount, currency);

      if (paid.isGreaterThan(newTotal)) {
        throw new BusinessRuleError(
          "Total amount cannot be less than paid amount"
        );
      }

      newInvoiceBalance = newTotal.subtract(paid);
    }

    // 4. Tổng exposure
    const totalExposure = currentDebt.add(newInvoiceBalance);

    if (totalExposure.isGreaterThan(creditLimit)) {
      throw new BusinessRuleError(
        `Credit limit exceeded. Limit: ${creditLimit.amount}, Exposure: ${totalExposure.amount}`
      );
    }

    return {
      success: true,
      limit: creditLimit.amount,
      exposure: totalExposure.amount,
      remaining: creditLimit.subtract(totalExposure).amount,
    };
  }
}

export default ValidateCreditLimitUseCase;
