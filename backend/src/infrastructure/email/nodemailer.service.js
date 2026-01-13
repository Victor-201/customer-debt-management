import nodemailer from "nodemailer";

export default class NodemailerService {
  constructor(config) {
    this.transporter = nodemailer.createTransport(config);
  }

  async send({ to, subject, html }) {
    await this.transporter.sendMail({
      to,
      subject,
      html,
    });
  }
}
