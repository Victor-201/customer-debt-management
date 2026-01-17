/**
 * @interface EmailLogRepositoryInterFace
 */
export default class EmailLogRepositoryInterFace {
  hasSent(invoiceId, emailType) {
      throw new Error("EmailLogRepositoryInterface.hasSent() must be implemented");
  }

  save(emailLog) {
      throw new Error("EmailLogRepositoryInterface.save() must be implemented");
  }
}
