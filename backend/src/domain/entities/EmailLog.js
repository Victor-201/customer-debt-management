class EmailLog {
  constructor({
    id,
    customerId,
    invoiceId,
    emailType,
    sentAt,
    status,
    errorMessage,
  }) {
    this.id = id ?? null;
    this.customerId = customerId;
    this.invoiceId = invoiceId;
    this.emailType = emailType;
    this.sentAt = sentAt ?? new Date();
    this.status = status;
    this.errorMessage = errorMessage ?? null;
  }
}

export default EmailLog;
