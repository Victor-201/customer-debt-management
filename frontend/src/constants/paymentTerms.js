// Payment Terms
export const PAYMENT_TERMS = {
    IMMEDIATE: 'IMMEDIATE',
    NET_7: 'NET_7',
    NET_15: 'NET_15',
    NET_30: 'NET_30',
    NET_45: 'NET_45',
    NET_60: 'NET_60'
};

export const PAYMENT_TERMS_LABELS = {
    IMMEDIATE: 'Thanh toán ngay',
    NET_7: '7 ngày',
    NET_15: '15 ngày',
    NET_30: '30 ngày',
    NET_45: '45 ngày',
    NET_60: '60 ngày'
};

export const PAYMENT_TERMS_DAYS = {
    IMMEDIATE: 0,
    NET_7: 7,
    NET_15: 15,
    NET_30: 30,
    NET_45: 45,
    NET_60: 60
};

// Payment Methods
export const PAYMENT_METHODS = {
    CASH: 'CASH',
    BANK_TRANSFER: 'BANK_TRANSFER',
    CREDIT_CARD: 'CREDIT_CARD',
    CHECK: 'CHECK'
};

export const PAYMENT_METHOD_LABELS = {
    CASH: 'Tiền mặt',
    BANK_TRANSFER: 'Chuyển khoản',
    CREDIT_CARD: 'Thẻ tín dụng',
    CHECK: 'Séc'
};

// Helper functions
export const getPaymentTermDays = (term) => PAYMENT_TERMS_DAYS[term] || 30;

export const getPaymentTermLabel = (term) => PAYMENT_TERMS_LABELS[term] || term;

export const getPaymentMethodLabel = (method) => PAYMENT_METHOD_LABELS[method] || method;

// Options for dropdowns
export const PAYMENT_TERMS_OPTIONS = Object.entries(PAYMENT_TERMS).map(([key, value]) => ({
    value: value,
    label: PAYMENT_TERMS_LABELS[key]
}));

export const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHODS).map(([key, value]) => ({
    value: value,
    label: PAYMENT_METHOD_LABELS[key]
}));
