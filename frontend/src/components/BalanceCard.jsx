import { formatCurrency, getAmountColorClass } from '../utils/money.util.js';

/**
 * BalanceCard Component
 * Displays a financial amount with label and optional icon
 * 
 * @param {Object} props
 * @param {string} props.label - Card label
 * @param {number} props.amount - Amount to display
 * @param {string} props.variant - Color variant: 'default', 'positive', 'negative', 'neutral'
 * @param {React.ReactNode} props.icon - Optional icon
 * @param {string} props.subtitle - Optional subtitle text
 * @param {string} props.className - Additional CSS classes
 */
export const BalanceCard = ({
    label,
    amount,
    variant = 'default',
    icon,
    subtitle,
    className = ''
}) => {
    // Auto-determine variant based on amount if not specified
    const colorClass = variant === 'default'
        ? getAmountColorClass(amount)
        : variant;

    return (
        <div className={`balance-card ${className}`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <p className="balance-card-label">{label}</p>
                    <p className={`balance-card-value balance-card-value--${colorClass}`}>
                        {formatCurrency(amount)}
                    </p>
                    {subtitle && (
                        <p style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-muted)',
                            marginTop: 'var(--spacing-1)'
                        }}>
                            {subtitle}
                        </p>
                    )}
                </div>
                {icon && (
                    <div style={{
                        fontSize: '24px',
                        color: 'var(--color-text-muted)',
                        opacity: 0.5
                    }}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * BalanceCardGroup Component
 * Displays multiple balance cards in a row
 */
export const BalanceCardGroup = ({ children, columns = 3 }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 'var(--spacing-4)',
            marginBottom: 'var(--spacing-6)'
        }}>
            {children}
        </div>
    );
};

/**
 * InvoiceBalanceSummary Component
 * Displays invoice total, paid, and balance
 */
export const InvoiceBalanceSummary = ({ total, paidAmount, balance }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--spacing-4)'
        }}>
            <BalanceCard
                label="Tổng tiền"
                amount={total}
                variant="neutral"
            />
            <BalanceCard
                label="Đã thanh toán"
                amount={paidAmount}
                variant="positive"
            />
            <BalanceCard
                label="Còn lại"
                amount={balance}
                variant={balance > 0 ? 'negative' : 'positive'}
            />
        </div>
    );
};

export default BalanceCard;
