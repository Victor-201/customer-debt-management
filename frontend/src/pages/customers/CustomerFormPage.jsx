import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createCustomer } from "../../store/customer.slice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerFormPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ================= FORM ================= */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    paymentTerm: "NET_30",
    creditLimit: "",
  });

  /* ================= ADDRESS ================= */
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  const [provinceCode, setProvinceCode] = useState("");
  const [wardCode, setWardCode] = useState("");

  /* ===== PROVINCE AUTOCOMPLETE ===== */
  const [provinceSearch, setProvinceSearch] = useState("");
  const [filteredProvinces, setFilteredProvinces] = useState([]);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  /* ===== WARD AUTOCOMPLETE ===== */
  const [wardSearch, setWardSearch] = useState("");
  const [filteredWards, setFilteredWards] = useState([]);
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  /* ================= FETCH PROVINCES ================= */
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get(
          "https://provinces.open-api.vn/api/v2/p/"
        );
        setProvinces(res.data);
      } catch (error) {
        console.error("Lỗi load tỉnh:", error);
      }
    };

    fetchProvinces();
  }, []);

  /* ================= FILTER PROVINCES ================= */
  useEffect(() => {
    if (!provinceSearch) {
      setFilteredProvinces([]);
      return;
    }

    const keyword = provinceSearch.toLowerCase();
    setFilteredProvinces(
      provinces.filter((p) =>
        p.name.toLowerCase().includes(keyword)
      )
    );
  }, [provinceSearch, provinces]);

  /* ================= FETCH WARDS BY PROVINCE ================= */
  useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      setWardCode("");
      setWardSearch("");
      return;
    }

    const fetchWards = async () => {
      try {
        const res = await axios.get(
          `https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`
        );
        setWards(res.data.wards || []);
      } catch (error) {
        console.error("Lỗi load xã:", error);
      }
    };

    fetchWards();
  }, [provinceCode]);

  /* ================= FILTER WARDS ================= */
  useEffect(() => {
    if (!wardSearch) {
      setFilteredWards([]);
      return;
    }

    const keyword = wardSearch.toLowerCase();
    setFilteredWards(
      wards.filter((w) =>
        w.name.toLowerCase().includes(keyword)
      )
    );
  }, [wardSearch, wards]);

  /* ================= HANDLERS ================= */
  const handleSelectProvince = (province) => {
    setProvinceCode(province.code.toString());
    setProvinceSearch(province.name);
    setShowProvinceDropdown(false);

    // reset xã
    setWardSearch("");
    setWardCode("");
  };

  const handleSelectWard = (ward) => {
    setWardCode(ward.code.toString());
    setWardSearch(ward.name);
    setShowWardDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const province = provinces.find(
      (p) => p.code === Number(provinceCode)
    );
    const ward = wards.find(
      (w) => w.code === Number(wardCode)
    );

    const address = [ward?.name, province?.name]
      .filter(Boolean)
      .join(", ");

    dispatch(
      createCustomer({
        ...formData,
        address,
        creditLimit: Number(formData.creditLimit),
      })
    );

    navigate("/customers");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">
          Thêm khách hàng mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME */}
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Tên khách hàng"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          {/* EMAIL */}
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          {/* PHONE */}
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          {/* PROVINCE AUTOCOMPLETE */}
          <div className="relative">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Nhập tỉnh / thành phố"
              value={provinceSearch}
              onChange={(e) => {
                setProvinceSearch(e.target.value);
                setShowProvinceDropdown(true);
                setProvinceCode("");
              }}
              onFocus={() => setShowProvinceDropdown(true)}
              required
            />

            {showProvinceDropdown && filteredProvinces.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-auto">
                {filteredProvinces.map((p) => (
                  <li
                    key={p.code}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectProvince(p)}
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* WARD AUTOCOMPLETE */}
          <div className="relative">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder={
                provinceCode
                  ? "Nhập xã / phường"
                  : "Chọn tỉnh trước"
              }
              value={wardSearch}
              disabled={!provinceCode}
              onChange={(e) => {
                setWardSearch(e.target.value);
                setShowWardDropdown(true);
                setWardCode("");
              }}
              onFocus={() => setShowWardDropdown(true)}
              required
            />

            {showWardDropdown && filteredWards.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-auto">
                {filteredWards.map((w) => (
                  <li
                    key={w.code}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectWard(w)}
                  >
                    {w.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* PAYMENT TERM */}
          <select
            className="w-full border rounded px-3 py-2"
            value={formData.paymentTerm}
            onChange={(e) =>
              setFormData({
                ...formData,
                paymentTerm: e.target.value,
              })
            }
          >
            <option value="NET_7">NET 7 ngày</option>
            <option value="NET_15">NET 15 ngày</option>
            <option value="NET_30">NET 30 ngày</option>
          </select>

          {/* CREDIT LIMIT */}
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            placeholder="Hạn mức tín dụng"
            value={formData.creditLimit}
            onChange={(e) =>
              setFormData({
                ...formData,
                creditLimit: e.target.value,
              })
            }
          />

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button type="submit" className="btn">
              Tạo khách hàng
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded-lg border"
              onClick={() => navigate("/customers")}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormPage;
