import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '../constants/invoiceStatus.js';

/**
 * StatusTag Component
 * Displays a colored badge for invoice status
 */
export const StatusTag = ({ status, size = 'medium', className = '' }) => {
    const label = INVOICE_STATUS_LABELS[status] || status;
    const color = INVOICE_STATUS_COLORS[status] || '#6b7280';

    const sizeClasses = {
        small: 'px-2 py-0.5 text-xs',
        medium: 'px-3 py-1 text-sm',
        large: 'px-4 py-1.5 text-base'
    };

    return (
        <span
            className={`inline-flex items-center rounded-full font-semibold text-white ${sizeClasses[size] || sizeClasses.medium} ${className}`}
            style={{ backgroundColor: color }}
        >
            {label}
        </span>
    );
};

/**
 * GenericStatusTag Component
 * For custom status with provided label and color
 */
export const GenericStatusTag = ({
    label,
    color = '#6b7280',
    bgColor,
    size = 'medium',
    className = ''
}) => {
    const sizeClasses = {
        small: 'px-2 py-0.5 text-xs',
        medium: 'px-3 py-1 text-sm',
        large: 'px-4 py-1.5 text-base'
    };

    return (
        <span
            className={`inline-flex items-center rounded-full font-semibold ${sizeClasses[size] || sizeClasses.medium} ${className}`}
            style={{
                backgroundColor: bgColor || color,
                color: bgColor ? color : '#ffffff'
            }}
        >
            {label}
        </span>
    );
};

export default StatusTag;
