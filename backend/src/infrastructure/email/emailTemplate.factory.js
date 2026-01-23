const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("vi-VN");
};

export function buildEmailTemplate(type, { customer, invoice }) {
  const commonStyles = `
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
  `;

  const headerStyles = `
    border-bottom: 2px solid #0056b3;
    padding-bottom: 10px;
    margin-bottom: 20px;
    text-align: center;
  `;

  const infoTableStyles = `
    width: 100%;
    margin-bottom: 20px;
    border-collapse: collapse;
  `;

  const footerStyles = `
    margin-top: 30px;
    font-size: 0.9em;
    color: #777;
    text-align: center;
  `;

  const generateInvoiceHtml = (title, message) => `
    <div style="${commonStyles}">
      <div style="${headerStyles}">
        <h2 style="color: #0056b3; margin: 0;">${title}</h2>
        <p style="margin: 5px 0;">THÔNG BÁO THANH TOÁN HÓA ĐƠN</p>
      </div>

      <p>Kính gửi <strong>${customer.name}</strong>,</p>
      <p>${message}</p>

      <table style="${infoTableStyles}">
        <tr>
          <td style="padding: 5px 0;"><strong>Số hóa đơn:</strong></td>
          <td style="text-align: right;">${invoice.invoice_number}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;"><strong>Ngày phát hành:</strong></td>
          <td style="text-align: right;">${formatDate(invoice.issue_date)}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;"><strong>Ngày hạn thanh toán:</strong></td>
          <td style="text-align: right; color: #d9534f;"><strong>${formatDate(invoice.due_date)}</strong></td>
        </tr>
      </table>

      <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px dashed #0056b3;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 5px 0;">Tổng tiền hóa đơn:</td>
            <td style="text-align: right;">${formatCurrency(invoice.total_amount.amount)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">Đã thanh toán:</td>
            <td style="text-align: right; color: #5cb85c;">${formatCurrency(invoice.paid_amount.amount)}</td>
          </tr>
          <tr style="font-size: 1.2em; font-weight: bold;">
            <td style="padding: 10px 0;">Số tiền còn lại:</td>
            <td style="text-align: right; color: #d9534f;">${formatCurrency(invoice.balance_amount.amount)}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 25px; text-align: center;">
        <p>Vui lòng thanh toán sớm để tránh làm gián đoạn dịch vụ.</p>
        <div style="display: inline-block; padding: 12px 25px; background-color: #0056b3; border-radius: 5px;">
           <a href="#" style="color: #ffffff; text-decoration: none; font-weight: bold;">THANH TOÁN NGAY</a>
        </div>
      </div>

      <div style="${footerStyles}">
        <p>Đây là email tự động, vui lòng không phản hồi email này.<br>
        Mọi thắc mắc xin liên hệ bộ phận hỗ trợ khách hàng của chúng tôi.</p>
      </div>
    </div>
  `;

  switch (type) {
    case "BEFORE_DUE":
      return {
        subject: `[Nhắc nợ] Hóa đơn #${invoice.invoice_number} sắp đến hạn`,
        html: generateInvoiceHtml(
          "Nhắc Hạn Thanh Toán",
          `Hóa đơn của bạn sẽ hết hạn vào ngày <strong>${formatDate(invoice.due_date)}</strong>. Vui lòng kiểm tra và hoàn tất thanh toán.`
        ),
      };

    case "OVERDUE_1":
      return {
        subject: `[Quá hạn] Hóa đơn #${invoice.invoice_number} đã quá hạn thanh toán`,
        html: generateInvoiceHtml(
          "Thông Báo Quá Hạn (Lần 1)",
          `Hóa đơn của bạn đã quá hạn thanh toán từ ngày ${formatDate(invoice.due_date)}. Vui lòng hoàn tất thanh toán trong thời gian sớm nhất.`
        ),
      };

    case "OVERDUE_2":
      return {
        subject: `[Cảnh báo] Hóa đơn #${invoice.invoice_number} quá hạn - Yêu cầu thanh toán ngay`,
        html: generateInvoiceHtml(
          "Yêu Cầu Thanh Toán Khẩn Cấp",
          `Ghi chú của chúng tôi cho thấy hóa đơn này vẫn chưa được thanh toán. Để tránh các thủ tục xử lý công nợ tiếp theo, vui lòng thực hiện thanh toán ngay lập tức.`
        ),
      };

    default:
      return {
        subject: `Thông tin hóa đơn #${invoice.invoice_number}`,
        html: generateInvoiceHtml("Thông Tin Hóa Đơn", "Thông tin chi tiết về hóa đơn của bạn."),
      };
  }
}
