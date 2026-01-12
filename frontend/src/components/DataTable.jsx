import { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

/**
 * DataTable Component
 * Reusable table with sorting and pagination
 * 
 * @param {Object} props
 * @param {Array} props.columns - Column definitions [{key, header, render, sortable, width}]
 * @param {Array} props.data - Data array
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onRowClick - Row click handler
 * @param {string} props.emptyMessage - Message when no data
 * @param {Object} props.pagination - Pagination config {page, limit, total, onPageChange}
 */
export const DataTable = ({
    columns = [],
    data = [],
    loading = false,
    onRowClick,
    emptyMessage = 'Không có dữ liệu',
    pagination,
    sortConfig,
    onSort
}) => {
    const [localSort, setLocalSort] = useState({ key: null, direction: 'asc' });

    const currentSort = sortConfig || localSort;

    // Handle sort
    const handleSort = (columnKey) => {
        const newDirection =
            currentSort.key === columnKey && currentSort.direction === 'asc'
                ? 'desc'
                : 'asc';

        const newSort = { key: columnKey, direction: newDirection };

        if (onSort) {
            onSort(newSort);
        } else {
            setLocalSort(newSort);
        }
    };

    // Sort data locally if no external sort handler
    let sortedData = [...data];
    if (!onSort && localSort.key) {
        sortedData.sort((a, b) => {
            const aVal = a[localSort.key];
            const bVal = b[localSort.key];

            if (aVal < bVal) return localSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return localSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Render sort icon
    const renderSortIcon = (columnKey) => {
        if (currentSort.key !== columnKey) {
            return <FiChevronUp style={{ opacity: 0.3 }} />;
        }
        return currentSort.direction === 'asc'
            ? <FiChevronUp />
            : <FiChevronDown />;
    };

    // Calculate pagination
    const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0;
    const startItem = pagination ? (pagination.page - 1) * pagination.limit + 1 : 1;
    const endItem = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : data.length;

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                style={{
                                    width: column.width,
                                    cursor: column.sortable ? 'pointer' : 'default'
                                }}
                                onClick={() => column.sortable && handleSort(column.key)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {column.header}
                                    {column.sortable && renderSortIcon(column.key)}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="table-empty">
                                <div className="loading-spinner"></div>
                                <p style={{ marginTop: 'var(--spacing-2)' }}>Đang tải...</p>
                            </td>
                        </tr>
                    ) : sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="table-empty">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                onClick={() => onRowClick && onRowClick(row)}
                                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                            >
                                {columns.map((column) => (
                                    <td key={column.key}>
                                        {column.render
                                            ? column.render(row[column.key], row, rowIndex)
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {pagination && pagination.total > 0 && (
                <div className="pagination">
                    <span className="pagination-info">
                        Hiển thị {startItem} - {endItem} trong tổng số {pagination.total} mục
                    </span>

                    <div className="pagination-controls">
                        <button
                            className="pagination-btn"
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                        >
                            Trước
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                                pageNum = i + 1;
                            } else if (pagination.page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = pagination.page - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    className={`pagination-btn ${pagination.page === pageNum ? 'active' : ''}`}
                                    onClick={() => pagination.onPageChange(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            className="pagination-btn"
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= totalPages}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
