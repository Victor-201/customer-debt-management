export function buildEmailTemplate(type, { customer, invoice }) {
  switch (type) {
    case "BEFORE_DUE":
      return {
        subject: "Invoice due soon",
        html: `<p>Dear ${customer.name}, invoice #${invoice.code} is due soon.</p>`,
      };

    case "OVERDUE_1":
      return {
        subject: "Invoice overdue",
        html: `<p>Your invoice #${invoice.code} is overdue.</p>`,
      };

    case "OVERDUE_2":
      return {
        subject: "Final overdue notice",
        html: `<p>Final notice for invoice #${invoice.code}.</p>`,
      };
  }
}
