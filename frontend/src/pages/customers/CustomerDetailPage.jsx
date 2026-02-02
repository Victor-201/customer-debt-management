import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerById,
  clearSelectedCustomer,
  updateCustomer,
} from "../../store/customer.slice";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Edit, Ban, Save, X,
  FileText, DollarSign, AlertCircle, Clock, CheckCircle, Eye
} from "lucide-react";
import invoiceApi from "../../api/invoice.api";

const CustomerDetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { selectedCustomer, loading, error } = useSelector(
    (state) => state.customers
  );

  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  // Invoices state
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [debtSummary, setDebtSummary] = useState({
    total: 0,
    pending: 0,
    overdue: 0,
    paid: 0
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentTerm: "NET_30",
    creditLimit: "",
  });

  useEffect(() => {
    dispatch(fetchCustomerById(id));
    return () => {
      dispatch(clearSelectedCustomer());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedCustomer) {
      setFormData({
        name: selectedCustomer.name ?? "",
        email: selectedCustomer.email ?? "",
        phone: selectedCustomer.phone ?? "",
        address: selectedCustomer.address ?? "",
        paymentTerm: selectedCustomer.paymentTerm ?? "NET_30",
        creditLimit: selectedCustomer.creditLimit ?? "",
      });

      // Load customer invoices
      loadCustomerInvoices();
    }
  }, [selectedCustomer]);

  const loadCustomerInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const result = await invoiceApi.getAll({ customerId: id });
      const invoicesData = result.data || result;
      setInvoices(invoicesData);

      // Calculate debt summary
      const summary = invoicesData.reduce((acc, inv) => {
        acc.total += parseFloat(inv.totalAmount || 0);
        if (inv.status === 'PENDING') acc.pending += parseFloat(inv.totalAmount || 0);
        if (inv.status === 'OVERDUE') acc.overdue += parseFloat(inv.totalAmount || 0);
        if (inv.status === 'PAID') acc.paid += parseFloat(inv.totalAmount || 0);
        return acc;
      }, { total: 0, pending: 0, overdue: 0, paid: 0 });

      setDebtSummary(summary);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  /* ================= HANDLERS ================= */
  const handleSaveConfirm = () => {
    setConfirmData({
      type: 'update',
      data: {
        ...formData,
        creditLimit: Number(formData.creditLimit),
      }
    });
    setShowConfirm(true);
  };

  const handleSave = () => {
    if (confirmData && confirmData.type === 'update') {
      dispatch(
        updateCustomer({
          id,
          data: confirmData.data,
        })
      );
      setIsEditing(false);
    }
    setShowConfirm(false);
    setConfirmData(null);
  };

  const handleDeactivateConfirm = () => {
    setConfirmData({
      type: 'deactivate'
    });
    setShowConfirm(true);
  };

  const handleDeactivate = () => {
    if (confirmData && confirmData.type === 'deactivate') {
      dispatch(
        updateCustomer({
          id,
          data: { status: "INACTIVE" },
        })
      );
    }
    setShowConfirm(false);
    setConfirmData(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setConfirmData(null);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PAID: 'bg-green-100 text-green-800 border-green-200',
      OVERDUE: 'bg-red-100 text-red-800 border-red-200',
      CANCELLED: 'bg-slate-100 text-slate-800 border-slate-200',
      DRAFT: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const labels = {
      PENDING: 'Chờ thanh toán',
      PAID: 'Đã thanh toán',
      OVERDUE: 'Quá hạn',
      CANCELLED: 'Đã hủy',
      DRAFT: 'Nháp'
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${styles[status] || styles.DRAFT}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">
          Đang tải thông tin khách hàng...
        </p>
      </div>
    );
  }

  if (error || !selectedCustomer) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Không tìm thấy khách hàng
          </h3>
          <p className="text-gray-500 mb-6">
            {error || 'Khách hàng không tồn tại hoặc đã bị xóa.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="fc-btn fc-btn--secondary"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
            <button
              onClick={() => navigate('/customers')}
              className="fc-btn fc-btn--primary"
            >
              Danh sách khách hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="fc-page-header">
        <div className="fc-page-header__breadcrumb">
          Quản lý / Khách hàng / {selectedCustomer.name}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="fc-page-header__title">{selectedCustomer.name}</h1>
            <p className="fc-page-header__subtitle">{selectedCustomer.email}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full font-semibold ${selectedCustomer.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
              }`}
          >
            {selectedCustomer.status === "ACTIVE" ? "Đang hoạt động" : "Ngừng hoạt động"}
          </span>
        </div>
      </div>

      {/* Debt Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-500 font-medium">Tổng công nợ</p>
            <DollarSign className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(debtSummary.total)}</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-500 font-medium">Chờ thanh toán</p>
            <Clock className="text-yellow-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(debtSummary.pending)}</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-500 font-medium">Quá hạn</p>
            <AlertCircle className="text-red-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(debtSummary.overdue)}</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-500 font-medium">Đã thanh toán</p>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(debtSummary.paid)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer Info */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Thông tin khách hàng</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Sửa thông tin"
                >
                  <Edit size={18} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <EditableField
                label="Tên"
                value={formData.name}
                isEditing={isEditing}
                onChange={(v) => setFormData({ ...formData, name: v })}
              />

              <EditableField
                label="Email"
                value={formData.email}
                isEditing={isEditing}
                onChange={(v) => setFormData({ ...formData, email: v })}
              />

              <EditableField
                label="Điện thoại"
                value={formData.phone}
                isEditing={isEditing}
                onChange={(v) => setFormData({ ...formData, phone: v })}
              />

              <EditableField
                label="Địa chỉ"
                value={formData.address}
                isEditing={isEditing}
                onChange={(v) => setFormData({ ...formData, address: v })}
              />

              <div>
                <p className="text-sm text-slate-500 mb-1 font-medium">
                  Điều khoản thanh toán
                </p>
                {isEditing ? (
                  <select
                    className="fc-input w-full"
                    value={formData.paymentTerm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentTerm: e.target.value,
                      })
                    }
                  >
                    <option value="NET_7">NET_7 (7 ngày)</option>
                    <option value="NET_15">NET_15 (15 ngày)</option>
                    <option value="NET_30">NET_30 (30 ngày)</option>
                  </select>
                ) : (
                  <p className="font-semibold text-slate-800">
                    {selectedCustomer.paymentTerm}
                  </p>
                )}
              </div>

              <EditableField
                label="Hạn mức tín dụng"
                type="number"
                value={formData.creditLimit}
                isEditing={isEditing}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    creditLimit: v,
                  })
                }
                format={(val) => formatCurrency(val)}
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t space-y-2">
              {isEditing ? (
                <>
                  <button
                    className="fc-btn fc-btn--primary w-full"
                    onClick={handleSaveConfirm}
                  >
                    <Save size={16} />
                    Lưu thay đổi
                  </button>
                  <button
                    className="fc-btn fc-btn--secondary w-full"
                    onClick={() => setIsEditing(false)}
                  >
                    <X size={16} />
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  {selectedCustomer.status === "ACTIVE" && (
                    <button
                      className="fc-btn fc-btn--danger w-full"
                      onClick={handleDeactivateConfirm}
                    >
                      <Ban size={16} />
                      Dừng hoạt động
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Invoices List */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="text-purple-500" size={20} />
                Hóa đơn ({invoices.length})
              </h2>
              <button
                onClick={() => navigate('/invoices/new', { state: { customerId: id } })}
                className="fc-btn fc-btn--primary"
              >
                + Tạo hóa đơn mới
              </button>
            </div>

            {loadingInvoices ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Đang tải hóa đơn...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">Chưa có hóa đơn nào</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{invoice.invoiceNumber || invoice.id}</h3>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-sm text-slate-500">
                          Ngày tạo: {formatDate(invoice.createdAt)} • Đến hạn: {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invoices/${invoice.id}`);
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        Số tiền: <span className="font-bold text-slate-900">{formatCurrency(invoice.totalAmount)}</span>
                      </p>
                      {invoice.status === 'OVERDUE' && (
                        <p className="text-xs text-red-600 font-medium">
                          Quá hạn {Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))} ngày
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={handleCancelConfirm}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-[450px] transform transition-all animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmData?.type === 'deactivate' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                {confirmData?.type === 'deactivate' ? (
                  <Ban className="w-8 h-8 text-red-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-800">
                {confirmData?.type === 'deactivate'
                  ? 'Xác nhận dừng hoạt động'
                  : 'Xác nhận cập nhật'}
              </h3>
            </div>

            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              {confirmData?.type === 'deactivate'
                ? 'Bạn có chắc chắn muốn dừng hoạt động khách hàng này không? Khách hàng sẽ không thể thực hiện giao dịch mới.'
                : 'Bạn có chắc chắn muốn lưu thay đổi thông tin khách hàng không?'}
            </p>

            <div className="flex gap-4">
              <button
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                onClick={handleCancelConfirm}
              >
                Hủy
              </button>
              <button
                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${confirmData?.type === 'deactivate'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                  }`}
                onClick={() => {
                  if (confirmData?.type === 'deactivate') {
                    handleDeactivate();
                  } else {
                    handleSave();
                  }
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

const EditableField = ({
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  format
}) => (
  <div>
    <p className="text-sm text-slate-500 mb-1 font-medium">{label}</p>
    {isEditing ? (
      <input
        type={type}
        className="fc-input w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <p className="font-semibold text-slate-800">
        {format ? format(value) : (value || "-")}
      </p>
    )}
  </div>
);

export default CustomerDetailPage;