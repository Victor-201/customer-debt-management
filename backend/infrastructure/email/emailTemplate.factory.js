import Handlebars from "handlebars";
import FileEmailTemplateRepository from "../../src/infrastructure/database/repositories/fileEmailTemplate.repository.js";

// Register Helpers
Handlebars.registerHelper("formatCurrency", (amount) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
});

Handlebars.registerHelper("formatDate", (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
});

const emailTemplateRepository = new FileEmailTemplateRepository();

export async function buildEmailTemplate(type, data) {
    // If no type provided or unknown type, fallback to a default or throw error
    // But for now, we try to fetch from repository
    let template = await emailTemplateRepository.getTemplate(type);

    if (!template) {
        // Fallback if file not found (optional, or throw error)
        // For safety, we can return a basic error message template
        console.error(`Template ${type} not found, returning default.`);
        return {
            subject: "Thông báo từ hệ thống",
            html: "<p>Xin lỗi, mẫu email chưa được cấu hình.</p>"
        };
    }

    const compiledSubject = Handlebars.compile(template.subject);
    const compiledHtml = Handlebars.compile(template.html);

    return {
        subject: compiledSubject(data),
        html: compiledHtml(data),
    };
}
