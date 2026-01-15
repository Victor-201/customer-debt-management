import { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

/**
 * DataTable Component
 * Reusable table with sorting and pagination
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
            return <FiChevronUp className="opacity-30" />;
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
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                                    }`}
                                style={{ width: column.width }}
                                onClick={() => column.sortable && handleSort(column.key)}
                            >
                                <div className="flex items-center gap-1">
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
                            <td colSpan={columns.length} className="px-4 py-12 text-center">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto"></div>
                                <p className="text-gray-500 mt-2">Đang tải...</p>
                            </td>
                        </tr>
                    ) : sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`border-b border-gray-100 ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                                    } transition-colors`}
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className="px-4 py-3">
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
                <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 gap-4">
                    <span className="text-sm text-gray-600">
                        Hiển thị {startItem} - {endItem} trong tổng số {pagination.total} mục
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                                    className={`w-8 h-8 text-sm rounded transition ${pagination.page === pageNum
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'border border-gray-300 hover:bg-gray-100'
                                        }`}
                                    onClick={() => pagination.onPageChange(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
