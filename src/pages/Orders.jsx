import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getOrders,
  updateOrder,
  deleteOrder,
} from "../services/orderService";
import "../styles/Orders.css";

const STATUS_OPTIONS = [
  "Pending", "Confirm", "Processing", "In Transit",
  "Out for Delivery", "Pickup", "Shipped", "Delivered", "RTO", "Cancelled",
];

const FILTER_OPTIONS = [
  "All", "Pending", "Confirm", "Processing", "In Transit",
  "Out for Delivery", "Pickup", "Shipped", "RTO", "Cancelled",
];

function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get("status");
  const globalSearch = searchParams.get("search") || "";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(globalSearch);
  const [statusFilter, setStatusFilter] = useState(urlStatus || "All"); // ✅ CHANGED: Default "All"

  const [activeCall, setActiveCall] = useState(null); // ✅ NEW
  const [copiedId, setCopiedId] = useState(null); // ✅ NEW

  const [dateFilter, setDateFilter] = useState({
  startDate: "",
  endDate: "",
});

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (globalSearch) setSearchTerm(globalSearch);
  }, [globalSearch]);

  useEffect(() => {
    if (urlStatus) setStatusFilter(urlStatus);
  }, [urlStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      setOrders(res.data || []);
    } catch (err) {
      setError("Orders load failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Copy Lead ID
  const copyLeadId = (leadId, e) => {
    e.stopPropagation();
    if (!leadId) return;
    navigator.clipboard.writeText(leadId);
    setCopiedId(leadId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // ✅ NEW: Call function
  const handleCall = (phone, name, orderId) => {
    if (!phone) return alert("Phone number not found");
    const cleanPhone = phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "");

    setActiveCall({ phone: cleanPhone, name, orderId });

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `tel:${cleanPhone}`;
    } else {
      const choice = window.confirm(
        `📞 Call ${name}?\nNumber: ${cleanPhone}\n\nOK = Open Call App\nCancel = Copy Number`
      );
      if (choice) {
        window.location.href = `tel:${cleanPhone}`;
      } else {
        navigator.clipboard.writeText(cleanPhone);
        alert(`✅ ${cleanPhone} copied!`);
      }
    }

    setTimeout(() => {
      setActiveCall((prev) => (prev && prev.orderId === orderId ? { ...prev, ended: true } : prev));
    }, 3000);
    setTimeout(() => setActiveCall(null), 6000);
  };

  const endCall = () => {
    if (activeCall) {
      setActiveCall((prev) => ({ ...prev, ended: true }));
      setTimeout(() => setActiveCall(null), 2000);
    }
  };

  // ✅ NEW: WhatsApp function
  const handleWhatsApp = (phone) => {
    if (!phone) return alert("Phone number not found");
    const cleanPhone = phone.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    const finalPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${finalPhone}`, "_blank");
  };

  const startEdit = (order) => {
    setViewOrder(null);
    setEditingId(order._id);
    setEditData({
      customerName: order.customerName || "",
      email: order.email || "",
      phone: order.phone || "",
      address: order.address || "",
      pincode: order.pincode || "",
      city: order.city || "",
      state: order.state || "",
      product: order.product || "",
      amount: order.amount || "",
      status: order.status || "Pending",
      notes: order.notes || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    try {
      await updateOrder(id, editData);
      setEditingId(null);
      setEditData({});
      fetchOrders();
      if (editData.status === "Delivered") {
        alert("✅ Order Delivered! Moved to Customers page. Revenue updated.");
      } else {
        alert("✅ Order updated successfully!");
      }
    } catch (err) {
      alert("❌ " + (err?.response?.data?.message || "Update failed."));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(id);
      fetchOrders();
      alert("✅ Order deleted successfully!");
    } catch (err) {
      alert("❌ " + (err?.response?.data?.message || "Delete failed."));
    }
  };

  const statusColors = {
    Pending: "status-pending",
    Confirm: "status-confirm",
    Processing: "status-processing",
    "In Transit": "status-transit",
    "Out for Delivery": "status-outdelivery",
    Pickup: "status-pickup",
    Shipped: "status-shipped",
    Delivered: "status-delivered",
    RTO: "status-rto",
    Cancelled: "status-cancelled",
  };

  if (loading) return <p className="orders-loading">Loading orders...</p>;

  const filteredOrders = orders.filter((order) => {
    const keyword = searchTerm.toLowerCase();
    const matchSearch =
      order.customerName?.toLowerCase().includes(keyword) ||
      order.phone?.toLowerCase().includes(keyword) ||
      (order.product || "").toLowerCase().includes(keyword) ||
      (order.leadId || "").toLowerCase().includes(keyword) ||
      (order.email || "").toLowerCase().includes(keyword) ||
      (order.city || "").toLowerCase().includes(keyword);

    const matchStatus = statusFilter === "All" ? true : order.status === statusFilter;

    let matchDate = true;
    if (dateFilter.startDate && dateFilter.endDate) {
      const created = new Date(order.createdAt);
      const start = new Date(dateFilter.startDate);
      const end = new Date(dateFilter.endDate);
      end.setHours(23, 59, 59, 999);
      matchDate = created >= start && created <= end;
    }

    return matchSearch && matchStatus && matchDate;
  });

  return (
    <div className="orders-page">
      {/* ✅ Call Banner */}
      {activeCall && (
        <div className={`call-banner ${activeCall.ended ? "ended" : "active"}`}>
          <div className="call-banner-inner">
            <div className={`call-banner-icon ${activeCall.ended ? "ended" : ""}`}>
              {activeCall.ended ? "📵" : "📞"}
            </div>
            <div className="call-banner-info">
              <div className="call-banner-name">
                {activeCall.ended ? `Call Ended: ${activeCall.name}` : `Calling ${activeCall.name}...`}
              </div>
              <div className="call-banner-number">{activeCall.phone}</div>
            </div>
            {!activeCall.ended ? (
              <button onClick={endCall} className="call-banner-end">End Call</button>
            ) : (
              <span className="call-banner-ended-text">Call Ended</span>
            )}
          </div>
        </div>
      )}

      <div className="orders-header">
        <div>
          <h2 className="orders-title">Orders</h2>
          <p className="orders-subtitle">Manage all customer orders</p>
        </div>
        <div className="orders-header-right">
          <span className="orders-total-badge">Total: {filteredOrders.length}</span>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Name / Phone / Product / Lead ID / Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={() => setSearchTerm("")} className="btn btn-secondary">Clear</button>
      </div>

      <div className="date-filter-bar">
        <div className="date-field">
          <label>From</label>
          <input
            type="date"
            value={dateFilter.startDate}
            onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
            className="form-input"
          />
        </div>
        <div className="date-field">
          <label>To</label>
          <input
            type="date"
            value={dateFilter.endDate}
            onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
            className="form-input"
          />
        </div>
        <button onClick={() => {
          const t = new Date().toISOString().split("T")[0];
          setDateFilter({ startDate: t, endDate: t });
        }} className="btn btn-secondary">Today</button>
        <button onClick={() => {
          const now = new Date();
          setDateFilter({
            startDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
            endDate: now.toISOString().split("T")[0],
          });
        }} className="btn btn-secondary">This Month</button>
        <button onClick={() => setDateFilter({ startDate: "", endDate: "" })} className="btn btn-secondary">All Dates</button>
      </div>

      <div className="filter-buttons-full">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => {
              setStatusFilter(opt);
              setSearchParams({});
            }}
            className={`filter-btn-full ${statusFilter === opt ? "active" : ""}`}
          >
            {opt}
          </button>
        ))}
      </div>

      {error && <p className="orders-error">{error}</p>}

      {/* EDIT MODAL */}
      {editingId && (
        <div className="edit-overlay" onClick={cancelEdit}>
          <div className="edit-full-card" onClick={(e) => e.stopPropagation()}>
            <div className="edit-full-header">
              <h3>✏️ Edit Order</h3>
              <button onClick={cancelEdit} className="edit-close-btn">✕</button>
            </div>
            <div className="edit-form-grid">
              <div className="form-field"><label className="input-label">Customer Name *</label><input type="text" name="customerName" value={editData.customerName} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">Phone</label><input type="tel" name="phone" value={editData.phone} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">Email</label><input type="email" name="email" value={editData.email} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">Product</label><input type="text" name="product" value={editData.product} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">Amount (₹) *</label><input type="number" name="amount" value={editData.amount} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field">
                <label className="input-label">Status *</label>
                <select name="status" value={editData.status} onChange={handleEditChange} className="form-input">
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s === "Delivered" ? "✅ Delivered (→ Customers)" : s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field"><label className="input-label">Pincode</label><input type="text" name="pincode" value={editData.pincode} onChange={handleEditChange} maxLength={6} className="form-input" /></div>
              <div className="form-field"><label className="input-label">City</label><input type="text" name="city" value={editData.city} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">State</label><input type="text" name="state" value={editData.state} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field full"><label className="input-label">Address</label><input type="text" name="address" value={editData.address} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field full"><label className="input-label">Notes</label><textarea name="notes" value={editData.notes} onChange={handleEditChange} rows={3} className="form-input" /></div>
            </div>
            <div className="edit-full-actions">
              <button onClick={() => saveEdit(editingId)} className="btn btn-success btn-lg">💾 Save Changes</button>
              <button onClick={cancelEdit} className="btn btn-secondary btn-lg">✕ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS GRID - LEAD PAGE STYLE */}
      {!editingId && (
        <div className="leads-grid-new">
          {filteredOrders.length === 0 && <p className="orders-empty">No orders found.</p>}
          {filteredOrders.map((order) => {
            const isCalling = activeCall && activeCall.orderId === order._id && !activeCall.ended;
            const callEnded = activeCall && activeCall.orderId === order._id && activeCall.ended;
            const isCopied = copiedId === order.leadCode;

            return (
              <div key={order._id} className="lead-card-new">
                {/* LEFT PANEL */}
                <div className="lead-card-left order-left">
                  {/* ✅ Lead ID Tag (agar hai toh) */}
                  <div
                    className={`lead-id-tag ${isCopied ? "copied" : ""}`}
                    onClick={(e) => copyLeadId(order.leadCode, e)}
                    title="Click to copy Lead ID"
                  >
                    {isCopied ? "✓ Copied!" : (order.leadCode || "ORDER")}
                  </div>

                  <h3 className="lead-card-name">{order.customerName}</h3>

                  <div className="lead-status-dot">
                    <span className={`status-dot ${statusColors[order.status] || "status-default"}`}></span>
                    <span className="status-text">{order.status}</span>
                  </div>

                  {order.phone && (
                    <div className="left-call-icon-wrap">
                      <button
                        onClick={() => handleCall(order.phone, order.customerName, order._id)}
                        className={`big-call-icon ${callEnded ? "ended" : isCalling ? "active" : ""}`}
                        title="Call"
                      >
                        📞
                      </button>
                      <div className="left-status-label">
                        {callEnded ? "CALL ENDED" : isCalling ? "CALLING..." : (order.status?.toUpperCase() || "ORDER")}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT PANEL */}
                <div className="lead-card-right">
                  <div className="info-grid">
                    <div className="info-box">
                      <div className="info-icon icon-phone">📞</div>
                      <div className="info-text">
                        <div className="info-value">{order.phone || "N/A"}</div>
                        <div className="info-label">Phone</div>
                      </div>
                    </div>
                    <div className="info-box">
                      <div className="info-icon icon-product">📦</div>
                      <div className="info-text">
                        <div className="info-value">{order.product || "N/A"}</div>
                        <div className="info-label">Product</div>
                      </div>
                    </div>
                    <div className="info-box">
                      <div className="info-icon icon-money">💰</div>
                      <div className="info-text">
                        <div className="info-value">₹{Number(order.amount || 0).toLocaleString()}</div>
                        <div className="info-label">Amount</div>
                      </div>
                    </div>
                    <div className="info-box">
                      <div className="info-icon icon-location">📍</div>
                      <div className="info-text">
                        <div className="info-value">{order.city || "N/A"}</div>
                        <div className="info-label">Location</div>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions-new">
                    {order.phone && (
                      <>
                        <button onClick={() => handleCall(order.phone, order.customerName, order._id)} className={`compact-btn ${callEnded ? "btn-call-ended" : isCalling ? "btn-call-active" : "btn-call"}`} title="Call">
                          {callEnded ? "📵" : "📞"} Call
                        </button>
                        <button onClick={() => handleWhatsApp(order.phone)} className="action-btn btn-action-msg" title="WhatsApp">💬 Message</button>
                      </>
                    )}
                    <button onClick={() => setViewOrder(order)} className="action-btn btn-action-view">👁 View</button>
                    <button onClick={() => startEdit(order)} className="action-btn btn-action-edit">✏️ Edit</button>
                    <button onClick={() => handleDelete(order._id)} className="action-btn btn-action-delete">🗑 Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODAL */}
      {viewOrder && (
        <div className="edit-overlay" onClick={() => setViewOrder(null)}>
          <div className="view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-full-header">
              <h3>👁 Order Details</h3>
              <button onClick={() => setViewOrder(null)} className="edit-close-btn">✕</button>
            </div>
            <div className="view-body">
              {viewOrder.leadId && (
                <div className="view-row">
                  <strong>Lead ID:</strong>
                  <span
                    className={`lead-id-tag-small ${copiedId === viewOrder.leadCode ? "copied" : ""}`}
                    onClick={(e) => copyLeadId(viewOrder.leadCode, e)}
                    title="Click to copy"
                  >
                    {copiedId === viewOrder.leadId ? "✓ Copied!" : viewOrder.leadId}
                  </span>
                </div>
              )}
              <div className="view-row"><strong>Customer:</strong> <span>{viewOrder.customerName}</span></div>
              {viewOrder.email && <div className="view-row"><strong>Email:</strong> <span>{viewOrder.email}</span></div>}
              {viewOrder.phone && <div className="view-row"><strong>Phone:</strong> <span>{viewOrder.phone}</span></div>}
              {viewOrder.product && <div className="view-row"><strong>Product:</strong> <span>{viewOrder.product}</span></div>}
              <div className="view-row"><strong>Amount:</strong> <span>₹{Number(viewOrder.amount || 0).toLocaleString()}</span></div>
              {viewOrder.address && <div className="view-row"><strong>Address:</strong> <span>{viewOrder.address}</span></div>}
              {viewOrder.city && <div className="view-row"><strong>City/State:</strong> <span>{viewOrder.city}, {viewOrder.state}</span></div>}
              {viewOrder.pincode && <div className="view-row"><strong>Pincode:</strong> <span>{viewOrder.pincode}</span></div>}
              <div className="view-row"><strong>Status:</strong> <span className={`compact-status ${statusColors[viewOrder.status]}`}>{viewOrder.status}</span></div>
              {viewOrder.notes && <div className="view-row"><strong>Notes:</strong> <span>{viewOrder.notes}</span></div>}
              <div className="view-row"><strong>Created:</strong> <span>{new Date(viewOrder.createdAt).toLocaleString()}</span></div>
            </div>
            <div className="edit-full-actions">
              <button onClick={() => startEdit(viewOrder)} className="btn btn-action-edit btn-lg">✏️ Edit</button>
              <button onClick={() => setViewOrder(null)} className="btn btn-secondary btn-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;