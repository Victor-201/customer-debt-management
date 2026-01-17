import nodemailer from "nodemailer";

export default class NodemailerService {
  constructor(config) {
    this.transporter = nodemailer.createTransport(config);
    this.defaultFrom = config.from;
  }

  async send({ to, subject, html, from }) {
    await this.transporter.sendMail({
      from: from || this.defaultFrom,
      to,
      subject,
      html,
    });
  }
}
