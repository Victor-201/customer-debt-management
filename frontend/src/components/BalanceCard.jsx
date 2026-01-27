import { formatCurrency, getAmountColorClass, extractAmount } from '../utils/money.util.js';

/**
 * BalanceCard Component
 * Displays a financial amount with label and optional icon
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
    const numericAmount = extractAmount(amount);
    const colorClass = variant === 'default'
        ? getAmountColorClass(numericAmount)
        : variant;

    const colorStyles = {
        positive: 'text-[var(--color-success)]',
        negative: 'text-[var(--color-error)]',
        neutral: 'text-gray-900'
    };

    return (
        <div className={`card ${className}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{label}</p>
                    <p className={`text-2xl font-bold font-mono ${colorStyles[colorClass] || colorStyles.neutral}`}>
                        {formatCurrency(amount)}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="text-2xl text-gray-300">
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
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4'
    };

    return (
        <div className={`grid ${gridCols[columns] || 'grid-cols-3'} gap-4 mb-6`}>
            {children}
        </div>
    );
};

/**
 * InvoiceBalanceSummary Component
 * Displays invoice total, paid, and balance
 */
export const InvoiceBalanceSummary = ({ total, paidAmount, balance }) => {
    const balanceNum = extractAmount(balance);
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                variant={balanceNum > 0 ? 'negative' : 'positive'}
            />
        </div>
    );
};

export default BalanceCard;
