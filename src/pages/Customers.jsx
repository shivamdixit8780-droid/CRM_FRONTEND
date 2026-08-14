import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService";
import "../styles/Customers.css";
import "../styles/leads.css"; // ✅ Leads ka card design use karne ke liye

function Customers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const idFilter = searchParams.get("edit");
  const globalSearch = searchParams.get("search") || "";

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(globalSearch);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [viewCustomer, setViewCustomer] = useState(null);

  const [activeCall, setActiveCall] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (globalSearch) setSearchTerm(globalSearch);
  }, [globalSearch]);

  useEffect(() => {
    if (idFilter && customers.length > 0) {
      const targetCustomer = customers.find((c) => c._id === idFilter);
      if (targetCustomer) {
        startEdit(targetCustomer);
        setTimeout(() => {
          const el = document.getElementById(`customer-${idFilter}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        setSearchParams({});
      }
    }
  }, [idFilter, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (err) {
      setError("Customers load nahi ho paaye");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Copy Lead ID
  const copyLeadId = (leadId, e) => {
    e.stopPropagation();
    if (!leadId) return;
    navigator.clipboard.writeText(leadId);
    setCopiedId(leadId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // ✅ Call function
  const handleCall = (phone, name, customerId) => {
    if (!phone) return alert("Phone number not found");
    const cleanPhone = phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "");

    setActiveCall({ phone: cleanPhone, name, customerId });

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
      setActiveCall((prev) => (prev && prev.customerId === customerId ? { ...prev, ended: true } : prev));
    }, 3000);
    setTimeout(() => setActiveCall(null), 6000);
  };

  const endCall = () => {
    if (activeCall) {
      setActiveCall((prev) => ({ ...prev, ended: true }));
      setTimeout(() => setActiveCall(null), 2000);
    }
  };

  // ✅ WhatsApp function
  const handleWhatsApp = (phone) => {
    if (!phone) return alert("Phone number not found");
    const cleanPhone = phone.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    const finalPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${finalPhone}`, "_blank");
  };

  const startEdit = (customer) => {
    setViewCustomer(null);
    setEditingId(customer._id);
    setEditData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      pincode: customer.pincode || "",
      product: customer.product || "",
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
      await updateCustomer(id, editData);
      setEditingId(null);
      fetchCustomers();
      alert("✅ Customer updated successfully!");
    } catch (err) {
      setError("Update nahi ho paaya");
      alert("❌ Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
      fetchCustomers();
      alert("✅ Customer deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Delete failed.");
    }
  };

  if (loading) return <p className="customers-loading">Loading customers...</p>;

  const filteredCustomers = customers.filter((customer) => {
    const keyword = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(keyword) ||
      customer.email?.toLowerCase().includes(keyword) ||
      customer.phone?.toLowerCase().includes(keyword) ||
      (customer.leadId || "").toLowerCase().includes(keyword) ||
      (customer.city || "").toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="leads-page">
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

      {/* Header */}
      <div className="leads-header">
        <h2 className="leads-title">Customers</h2>
        <span className="orders-total-badge">Total: {filteredCustomers.length}</span>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search Name / Phone / Email / Lead ID / City..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={() => setSearchTerm("")} className="btn btn-secondary">Clear</button>
      </div>

      {error && <p className="customers-error">{error}</p>}

      {/* EDIT MODAL */}
      {editingId && (
        <div className="edit-overlay" onClick={cancelEdit}>
          <div className="edit-full-card" onClick={(e) => e.stopPropagation()}>
            <div className="edit-full-header">
              <h3>✏️ Edit Customer</h3>
              <button onClick={cancelEdit} className="edit-close-btn">✕</button>
            </div>
            <div className="edit-form-grid">
              <div className="form-field"><label className="input-label">Name *</label><input type="text" name="name" value={editData.name} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">Phone</label><input type="tel" name="phone" value={editData.phone} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">Email</label><input type="email" name="email" value={editData.email} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">Product</label><input type="text" name="product" value={editData.product} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">City</label><input type="text" name="city" value={editData.city} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">State</label><input type="text" name="state" value={editData.state} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">Pincode</label><input type="text" name="pincode" value={editData.pincode} onChange={handleEditChange} maxLength={6} className="form-input" /></div>
              <div className="form-field full"><label className="input-label">Address</label><input type="text" name="address" value={editData.address} onChange={handleEditChange} className="form-input" /></div>
            </div>
            <div className="edit-full-actions">
              <button onClick={() => saveEdit(editingId)} className="btn btn-success btn-lg">💾 Save Changes</button>
              <button onClick={cancelEdit} className="btn btn-secondary btn-lg">✕ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMERS GRID - LEAD PAGE STYLE */}
      {!editingId && (
        <div className="leads-grid-new">
          {filteredCustomers.length === 0 && <p className="leads-empty">No customers found.</p>}
          {filteredCustomers.map((customer) => {
            const isCalling = activeCall && activeCall.customerId === customer._id && !activeCall.ended;
            const callEnded = activeCall && activeCall.customerId === customer._id && activeCall.ended;
            const isCopied = copiedId === customer.leadCode;

            return (
              <div
                key={customer._id}
                id={`customer-${customer._id}`}
                className="lead-card-new"
              >
                {/* LEFT PANEL */}
                <div className="lead-card-left">
                  <div
                    className={`lead-id-tag ${isCopied ? "copied" : ""}`}
                    onClick={(e) => copyLeadId(customer.leadCode, e)}
                    title="Click to copy Lead ID"
                  >
                    {isCopied ? "✓ Copied!" : (customer.leadCode || "CUSTOMER")}
                  </div>

                  <h3 className="lead-card-name">{customer.name}</h3>

                  <div className="lead-status-dot">
                    <span className="status-dot status-delivered"></span>
                    <span className="status-text">Active</span>
                  </div>

                  {customer.phone && (
                    <div className="left-call-icon-wrap">
                      <button
                        onClick={() => handleCall(customer.phone, customer.name, customer._id)}
                        className={`big-call-icon ${callEnded ? "ended" : isCalling ? "active" : ""}`}
                        title="Call"
                      >
                        📞
                      </button>
                      <div className="left-status-label">
                        {callEnded ? "CALL ENDED" : isCalling ? "CALLING..." : "CUSTOMER"}
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
                        <div className="info-value">{customer.phone || "N/A"}</div>
                        <div className="info-label">Phone</div>
                      </div>
                    </div>
                    <div className="info-box">
                      <div className="info-icon icon-product">📦</div>
                      <div className="info-text">
                        <div className="info-value">{customer.product || "N/A"}</div>
                        <div className="info-label">Product</div>
                      </div>
                    </div>
                    <div className="info-box">
                      <div className="info-icon icon-money">📧</div>
                      <div className="info-text">
                        <div className="info-value">{customer.email || "N/A"}</div>
                        <div className="info-label">Email</div>
                      </div>
                    </div>
                    <div className="info-box">
                      <div className="info-icon icon-location">📍</div>
                      <div className="info-text">
                        <div className="info-value">{customer.city || "N/A"}</div>
                        <div className="info-label">Location</div>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions-new">
                    {customer.phone && (
                      <>
                        <button onClick={() => handleCall(customer.phone, customer.name, customer._id)} className={`compact-btn ${callEnded ? "btn-call-ended" : isCalling ? "btn-call-active" : "btn-call"}`} title="Call">
                          {callEnded ? "📵" : "📞"} Call
                        </button>
                        <button onClick={() => handleWhatsApp(customer.phone)} className="action-btn btn-action-msg" title="WhatsApp">💬 Message</button>
                      </>
                    )}
                    <button onClick={() => setViewCustomer(customer)} className="action-btn btn-action-view">👁 View</button>
                    <button onClick={() => startEdit(customer)} className="action-btn btn-action-edit">✏️ Edit</button>
                    <button onClick={() => handleDelete(customer._id)} className="action-btn btn-action-delete">🗑 Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODAL */}
      {viewCustomer && (
        <div className="edit-overlay" onClick={() => setViewCustomer(null)}>
          <div className="view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-full-header">
              <h3>👁 Customer Details</h3>
              <button onClick={() => setViewCustomer(null)} className="edit-close-btn">✕</button>
            </div>
            <div className="view-body">
              {viewCustomer.leadCode && (
                <div className="view-row">
                  <strong>Lead ID:</strong>
                  <span
                    className={`lead-id-tag-small ${copiedId === viewCustomer.leadCode ? "copied" : ""}`}
                    onClick={(e) => copyLeadId(viewCustomer.leadCode, e)}
                    title="Click to copy"
                  >
                    {copiedId === viewCustomer.leadCode  ? "✓ Copied!" : viewCustomer.leadCode }
                  </span>
                </div>
              )}
              <div className="view-row"><strong>Name:</strong> <span>{viewCustomer.name}</span></div>
              {viewCustomer.email && <div className="view-row"><strong>Email:</strong> <span>{viewCustomer.email}</span></div>}
              {viewCustomer.phone && <div className="view-row"><strong>Phone:</strong> <span>{viewCustomer.phone}</span></div>}
              {viewCustomer.product && <div className="view-row"><strong>Product:</strong> <span>{viewCustomer.product}</span></div>}
              {viewCustomer.address && <div className="view-row"><strong>Address:</strong> <span>{viewCustomer.address}</span></div>}
              {viewCustomer.city && <div className="view-row"><strong>City/State:</strong> <span>{viewCustomer.city}, {viewCustomer.state}</span></div>}
              {viewCustomer.pincode && <div className="view-row"><strong>Pincode:</strong> <span>{viewCustomer.pincode}</span></div>}
              {viewCustomer.source && <div className="view-row"><strong>Source:</strong> <span>{viewCustomer.source}</span></div>}
              {viewCustomer.createdAt && <div className="view-row"><strong>Since:</strong> <span>{new Date(viewCustomer.createdAt).toLocaleString()}</span></div>}
            </div>
            <div className="edit-full-actions">
              <button onClick={() => startEdit(viewCustomer)} className="btn btn-action-edit btn-lg">✏️ Edit</button>
              <button onClick={() => setViewCustomer(null)} className="btn btn-secondary btn-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;