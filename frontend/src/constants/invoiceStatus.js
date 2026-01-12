// Invoice Status Constants
export const INVOICE_STATUS = {
    DRAFT: 'DRAFT',
    PENDING: 'PENDING',
    PARTIAL: 'PARTIAL',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED'
};

export const INVOICE_STATUS_LABELS = {
    DRAFT: 'Nháp',
    PENDING: 'Chờ thanh toán',
    PARTIAL: 'Thanh toán một phần',
    PAID: 'Đã thanh toán',
    OVERDUE: 'Quá hạn',
    CANCELLED: 'Đã hủy'
};

export const INVOICE_STATUS_COLORS = {
    DRAFT: '#6b7280',
    PENDING: '#f59e0b',
    PARTIAL: '#3b82f6',
    PAID: '#10b981',
    OVERDUE: '#ef4444',
    CANCELLED: '#9ca3af'
};

// Helper function to get status info
export const getStatusInfo = (status) => ({
    key: status,
    label: INVOICE_STATUS_LABELS[status] || status,
    color: INVOICE_STATUS_COLORS[status] || '#6b7280'
});

// Status options for dropdowns
export const INVOICE_STATUS_OPTIONS = Object.entries(INVOICE_STATUS).map(([key, value]) => ({
    value: value,
    label: INVOICE_STATUS_LABELS[key]
}));
