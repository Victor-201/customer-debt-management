import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";

import {
  fetchCustomers,
  deleteCustomer,
} from "../../store/customer.slice";

import DataTable from "../../components/DataTable";
import ConfirmModal from "../../components/ConfirmModal";
import StatusTag from "../../components/StatusTag";
import { formatCurrency } from "../../utils/money.util";

const CustomerListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: customers, loading, pagination } = useSelector(
    (state) => state.customers
  );

  /* ================= QUERY ================= */
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "DESC",
    status: undefined,
    riskLevel: undefined,
    paymentTerm: undefined,
  });

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    customer: null,
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(fetchCustomers(query));
  }, [dispatch, query]);

  /* ================= HANDLERS ================= */
  const handlePageChange = (page) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleSort = (key) => {
    setQuery((prev) => ({
      ...prev,
      sortBy: key,
      sortOrder:
        prev.sortBy === key && prev.sortOrder === "ASC"
          ? "DESC"
          : "ASC",
      page: 1,
    }));
  };

  const handleDelete = async () => {
    if (!deleteModal.customer) return;
    await dispatch(deleteCustomer(deleteModal.customer.id));
    setDeleteModal({ open: false, customer: null });
  };

  /* ================= HEADER UI ================= */
  const headerBox = (title, filter) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">
          {title}
        </span>
        <span className="text-[10px] text-gray-400">
          ⇅
        </span>
      </div>
      {filter}
    </div>
  );

  const filterClass =
    "w-full text-xs px-2 py-1 border border-gray-300 rounded-md " +
    "bg-white font-medium text-gray-700 " +
    "focus:outline-none focus:ring-1 focus:ring-primary";

  /* ================= COLUMNS ================= */
  const columns = [
    {
      key: "name",
      header: (
        <span className="font-bold text-gray-800">
          Khách hàng
        </span>
      ),
      sortable: true,
      onSort: () => handleSort("name"),
      render: (value, row) => (
        <Link
          to={`/customers/${row.id}`}
          className="font-semibold text-[var(--color-primary)] hover:underline"
        >
          {value}
        </Link>
      ),
    },
    {
      key: "email",
      header: (
        <span className="font-bold text-gray-800">
          Email
        </span>
      ),
      render: (value) => value || "-",
    },
    {
      key: "paymentTerm",
      header: headerBox(
        "Thanh toán",
        <select
          className={filterClass}
          onChange={(e) =>
            setQuery((prev) => ({
              ...prev,
              paymentTerm: e.target.value || undefined,
              page: 1,
            }))
          }
        >
          <option value="">Tất cả</option>
          <option value="NET_7">7 ngày</option>
          <option value="NET_15">15 ngày</option>
          <option value="NET_30">30 ngày</option>
        </select>
      ),
      sortable: true,
      onSort: () => handleSort("paymentTerm"),
      render: (value) => {
        if (value === "NET_7") return "7 ngày";
        if (value === "NET_15") return "15 ngày";
        if (value === "NET_30") return "30 ngày";
        return "-";
      },
    },
    {
      key: "creditLimit",
      header: (
        <span className="font-bold text-gray-800">
          Hạn mức
        </span>
      ),
      sortable: true,
      onSort: () => handleSort("creditLimit"),
      render: (value) => (
        <span className="font-mono font-semibold">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "riskLevel",
      header: headerBox(
        "Rủi ro",
        <select
          className={filterClass}
          onChange={(e) =>
            setQuery((prev) => ({
              ...prev,
              riskLevel: e.target.value || undefined,
              page: 1,
            }))
          }
        >
          <option value="">Tất cả</option>
          <option value="NORMAL">NORMAL</option>
          <option value="WARNING">WARNING</option>
          <option value="HIGH_RISK">HIGH RISK</option>
        </select>
      ),
      sortable: true,
      onSort: () => handleSort("riskLevel"),
      render: (value) => (
        <StatusTag
          status={value}
          mapping={{
            NORMAL: "success",
            WARNING: "warning",
            HIGH_RISK: "danger",
          }}
        />
      ),
    },
    {
      key: "status",
      header: headerBox(
        "Trạng thái",
        <select
          className={filterClass}
          onChange={(e) =>
            setQuery((prev) => ({
              ...prev,
              status: e.target.value || undefined,
              page: 1,
            }))
          }
        >
          <option value="">Tất cả</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      ),
      sortable: true,
      onSort: () => handleSort("status"),
      render: (value) => (
        <StatusTag
          status={value}
          mapping={{
            ACTIVE: "success",
            INACTIVE: "secondary",
          }}
        />
      ),
    },
    {
      key: "actions",
      header: (
        <span className="font-bold text-gray-800">
          Thao tác
        </span>
      ),
      width: "140px",
      render: (_, row) => (
        <div className="flex justify-center gap-1">
          <button
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={() => navigate(`/customers/${row.id}`)}
          >
            <FiEye />
          </button>

          <button
            className="p-2 rounded-lg text-[var(--color-primary)] hover:bg-blue-50"
            onClick={() => navigate(`/customers/${row.id}/edit`)}
          >
            <FiEdit2 />
          </button>

          <button
            className="p-2 rounded-lg text-[var(--color-error)] hover:bg-red-50"
            onClick={() =>
              setDeleteModal({ open: true, customer: row })
            }
          >
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="fc-page-header">
        <div className="fc-page-header__breadcrumb">
          Quản lý / Khách hàng
        </div>

        <div className="flex justify-between items-end">
          <div>
            <h1 className="fc-page-header__title">
              Danh sách Khách hàng
            </h1>
            <p className="fc-page-header__subtitle">
              Tổng cộng {pagination.totalItems} khách hàng
            </p>
          </div>

          <Link to="/customers/new" className="btn">
            <FiPlus /> Thêm khách hàng
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden mt-4">
        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          onRowClick={(row) => navigate(`/customers/${row.id}`)}
          pagination={{
            page: query.page,
            limit: query.limit,
            total: pagination.totalItems,
            onPageChange: handlePageChange,
          }}
        />
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, customer: null })
        }
        onConfirm={handleDelete}
        title="Xóa khách hàng"
        confirmText="Xóa"
        variant="danger"
        message={
          deleteModal.customer && (
            <p>
              Bạn có chắc chắn muốn xóa khách hàng{" "}
              <strong>{deleteModal.customer.name}</strong>?
            </p>
          )
        }
      />
    </div>
  );
};

export default CustomerListPage;
