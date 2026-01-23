import nodemailer from "nodemailer";
import config from "../../main/config/env.config.js"

export default class NodemailerService {
  constructor(cron_config) {
    this.transporter = nodemailer.createTransport(cron_config);
    this.defaultFrom = cron_config;
  }

  async send({ to, subject, html, from }) {
    await this.transporter.sendMail({
      from: `${config.email.from} <${config.email.user}>` || this.defaultFrom,
      to,
      subject,
      html,
    });
  }
}
