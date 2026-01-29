/**
 * @interface EmailLogRepositoryInterFace
 */
export default class EmailLogRepositoryInterFace {
  hasSent(invoiceId, emailType) {
    throw new Error("EmailLogRepositoryInterface.hasSent() must be implemented");
  }

  hasSentToday(invoiceId, emailType) {
    throw new Error("EmailLogRepositoryInterface.hasSentToday() must be implemented");
  }

  save(emailLog) {
    throw new Error("EmailLogRepositoryInterface.save() must be implemented");
  }

  findAll() {
    throw new Error("EmailLogRepositoryInterface.findAll() must be implemented");
  }
}
