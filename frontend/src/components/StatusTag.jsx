import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '../constants/invoiceStatus.js';

/**
 * StatusTag Component
 * Displays a colored badge for invoice status
 * 
 * @param {Object} props
 * @param {string} props.status - Status key (e.g., 'PENDING', 'PAID')
 * @param {string} props.size - Size variant: 'small', 'medium', 'large'
 * @param {string} props.className - Additional CSS classes
 */
export const StatusTag = ({ status, size = 'medium', className = '' }) => {
    const label = INVOICE_STATUS_LABELS[status] || status;
    const color = INVOICE_STATUS_COLORS[status] || '#6b7280';

    const sizeClass = {
        small: 'status-tag--small',
        medium: '',
        large: 'status-tag--large'
    }[size] || '';

    return (
        <span
            className={`status-tag ${sizeClass} ${className}`}
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
    const sizeClass = {
        small: 'status-tag--small',
        medium: '',
        large: 'status-tag--large'
    }[size] || '';

    const style = {
        backgroundColor: bgColor || color,
        color: bgColor ? color : '#ffffff'
    };

    return (
        <span
            className={`status-tag ${sizeClass} ${className}`}
            style={style}
        >
            {label}
        </span>
    );
};

export default StatusTag;
