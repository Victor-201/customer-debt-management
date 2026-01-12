// Risk Level Constants
export const RISK_LEVELS = {
    NORMAL: 'NORMAL',
    WARNING: 'WARNING',
    HIGH_RISK: 'HIGH_RISK'
};

export const RISK_LEVEL_LABELS = {
    NORMAL: 'Bình thường',
    WARNING: 'Cảnh báo',
    HIGH_RISK: 'Rủi ro cao'
};

export const RISK_LEVEL_COLORS = {
    NORMAL: '#10b981',
    WARNING: '#f59e0b',
    HIGH_RISK: '#ef4444'
};

export const getRiskLevelInfo = (level) => ({
    key: level,
    label: RISK_LEVEL_LABELS[level] || level,
    color: RISK_LEVEL_COLORS[level] || '#6b7280'
});

export const RISK_LEVEL_OPTIONS = Object.entries(RISK_LEVELS).map(([key, value]) => ({
    value: value,
    label: RISK_LEVEL_LABELS[key]
}));
