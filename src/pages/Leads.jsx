import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
} from "../services/leadService";
import { getProducts } from "../services/productService";
import { fetchAddressByPincode } from "../services/pincodeService";
import "../styles/leads.css";

function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const idFilter = searchParams.get("edit");
  const globalSearch = searchParams.get("search") || "";

  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(globalSearch);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All"); // ✅ CHANGED: Default "All"
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [activeCall, setActiveCall] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const [dateFilter, setDateFilter] = useState({
  startDate: "",
  endDate: "",
});

  const initialForm = {
    name: "", email: "", phone: "", address: "",
    pincode: "", city: "", state: "", source: "Website",
    status: "New", product: "", price: "", notes: "", followUpDate: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchLeads();
    fetchProductsList();
  }, []);

  useEffect(() => {
    if (globalSearch) setSearchTerm(globalSearch);
  }, [globalSearch]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await getLeads();
      setLeads(res.data || []);
    } catch (err) {
      setError("Leads not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.error("Products not found");
    }
  };

  useEffect(() => {
    if (!idFilter || leads.length === 0) return;
    const lead = leads.find((item) => item._id === idFilter);
    if (!lead) return;
    startEdit(lead);
    setSearchParams({});
  }, [idFilter, leads]);

  const validateIndianPhone = (phone) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    return /^[6-9]\d{9}$/.test(cleanPhone);
  };

  const copyLeadId = (leadId, e) => {
    e.stopPropagation();
    if (!leadId) return;
    navigator.clipboard.writeText(leadId);
    setCopiedId(leadId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCall = (phone, name, leadId) => {
    if (!phone) return alert("Phone number not found");
    const cleanPhone = phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "");

    setActiveCall({ phone: cleanPhone, name, leadId });

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
      setActiveCall((prev) => (prev && prev.leadId === leadId ? { ...prev, ended: true } : prev));
    }, 3000);
    setTimeout(() => setActiveCall(null), 6000);
  };

  const endCall = () => {
    if (activeCall) {
      setActiveCall((prev) => ({ ...prev, ended: true }));
      setTimeout(() => setActiveCall(null), 2000);
    }
  };

  const handleWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    const finalPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${finalPhone}`, "_blank");
  };

  const handlePincodeChange = async (pincode, isEdit = false) => {
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPincodeLoading(true);
      const result = await fetchAddressByPincode(pincode);
      setPincodeLoading(false);
      if (result) {
        const update = { pincode, city: result.city, state: result.state };
        if (isEdit) setEditData((prev) => ({ ...prev, ...update, address: prev.address || result.fullAddress }));
        else setFormData((prev) => ({ ...prev, ...update, address: prev.address || result.fullAddress }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "product") {
      const sp = products.find((p) => p.name === value);
      setFormData({ ...formData, product: value, price: sp ? sp.price : "" });
      return;
    }

    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, phone: cleaned });
      return;
    }

    if (name === "pincode") {
      const cleaned = value.replace(/\D/g, "").slice(0, 6);
      setFormData({ ...formData, pincode: cleaned });
      if (cleaned.length === 6) handlePincodeChange(cleaned, false);
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "product") {
      const sp = products.find((p) => p.name === value);
      setEditData({ ...editData, product: value, price: sp ? sp.price : editData.price });
      return;
    }

    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      setEditData({ ...editData, phone: cleaned });
      return;
    }

    if (name === "pincode") {
      const cleaned = value.replace(/\D/g, "").slice(0, 6);
      setEditData({ ...editData, pincode: cleaned });
      if (cleaned.length === 6) handlePincodeChange(cleaned, true);
      return;
    }

    setEditData({ ...editData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) return alert("⚠️ Name is required!");
    if (!formData.phone?.trim()) return alert("⚠️ Phone is required!");
    if (!validateIndianPhone(formData.phone)) return alert("⚠️ Invalid Indian phone number! Must be 10 digits starting with 6-9.");
    if (!formData.email?.trim()) return alert("⚠️ Email is required!");
    if (!formData.address?.trim()) return alert("⚠️ Address is required!");
    if (!formData.pincode?.trim() || formData.pincode.length !== 6) return alert("⚠️ Valid 6-digit Pincode is required!");
    if (!formData.product) return alert("⚠️ Product is required!");
    if (!formData.price || Number(formData.price) <= 0) return alert("⚠️ Price is required!");

    if (formData.status === "Interested" && !formData.followUpDate) {
      return alert("⚠️ Please select Follow-up Date for Interested lead!");
    }

    try {
      await createLead(formData);
      setFormData(initialForm);
      setShowForm(false);
      fetchLeads();

      if (formData.status === "Order Done") {
        alert("✅ Success! Lead moved to Orders page.");
      } else if (formData.status === "Interested") {
        alert("✅ Interested lead added with follow-up date!");
      } else {
        alert("✅ Lead added successfully!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create lead";
      setError(msg);
      alert("❌ " + msg);
    }
  };

  const startEdit = (lead) => {
    setViewLead(null);
    setEditingId(lead._id);
    setEditData({
      name: lead.name, email: lead.email || "", phone: lead.phone || "",
      address: lead.address || "", pincode: lead.pincode || "",
      city: lead.city || "", state: lead.state || "",
      source: lead.source || "Website", status: lead.status || "New",
      product: lead.product || "", price: lead.price || "",
      notes: lead.notes || "",
      followUpDate: lead.followUpDate ? lead.followUpDate.slice(0, 10) : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteLead(id);
      fetchLeads();
      alert("✅ Lead deleted successfully!");
    } catch {
      alert("❌ Delete failed.");
    }
  };

  const saveEdit = async (id) => {
    if (!editData.name?.trim()) return alert("⚠️ Name is required!");
    if (!editData.phone?.trim()) return alert("⚠️ Phone is required!");
    if (!validateIndianPhone(editData.phone)) return alert("⚠️ Invalid Indian phone number!");

    if (editData.status === "Interested" && !editData.followUpDate)
      return alert("⚠️ Please select Follow-up Date for Interested lead!");

    if (editData.status === "Order Done") {
      if (!editData.price || Number(editData.price) <= 0)
        return alert("⚠️ Price is required for Order!");
      if (!editData.product) return alert("⚠️ Product is required for Order!");
    }
    try {
      await updateLead(id, editData);
      setEditingId(null);
      setEditData({});
      fetchLeads();
      if (editData.status === "Order Done") {
        alert("✅ Success! Lead moved to Orders page.");
      } else if (editData.status === "Interested") {
        alert("✅ Lead marked as Interested with follow-up date!");
      } else {
        alert("✅ Lead updated successfully!");
      }
    } catch (err) {
      alert("❌ " + (err?.response?.data?.message || "Update failed."));
    }
  };

  if (loading) return <p className="leads-loading">Loading leads...</p>;

  const filteredLeads = leads.filter((lead) => {
    const keyword = searchTerm.toLowerCase();
    const matchSearch =
      lead.name?.toLowerCase().includes(keyword) ||
      lead.phone?.toLowerCase().includes(keyword) ||
      (lead.product || "").toLowerCase().includes(keyword) ||
      (lead.leadId || "").toLowerCase().includes(keyword) ||
      (lead.email || "").toLowerCase().includes(keyword) ||
      (lead.city || "").toLowerCase().includes(keyword);

    const matchStatus = statusFilter === "All" ? true : lead.status === statusFilter;

    let matchDate = true;
    if (dateFilter.startDate && dateFilter.endDate) {
      const created = new Date(lead.createdAt);
      const start = new Date(dateFilter.startDate);
      const end = new Date(dateFilter.endDate);
      end.setHours(23, 59, 59, 999);
      matchDate = created >= start && created <= end;
    }

    return matchSearch && matchStatus && matchDate;
  });

  const statusColors = {
    New: "status-new",
    Pending: "status-pending",
    "Call Back": "status-call-back",
    NPC: "status-npc",
    "Not Interested": "status-not-interested",
    "High Price": "status-high-price",
    "Switch Off": "status-switch-off",
    Interested: "status-interested",
    "Order Done": "status-order-done",
  };

  const statusOptions = ["New", "Pending", "Call Back", "NPC", "Not Interested", "High Price", "Switch Off", "Interested", "Order Done"];

  const filterOptions = ["All", "New", "Pending", "Call Back", "NPC", "Not Interested", "High Price", "Switch Off", "Interested"];

  const sourceOptions = ["Website", "Referral", "Ads", "Walk-in", "Cold Call", "LinkedIn", "Instagram", "Google Ads", "Facebook", "Other"];

  return (
    <div className="leads-page">

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

      <div className="leads-header">
        <h2 className="leads-title">Leads</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="btn btn-primary">
          {showForm ? "Cancel" : "+ Add Lead"}
        </button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search Name / Phone / Product / Lead ID / Email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
        <button onClick={() => setSearchTerm("")} className="btn btn-secondary">Clear</button>
      </div>

      <div className="date-filter-bar">
        <div className="date-field">
          <label>From</label>
          <input type="date" value={dateFilter.startDate} onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })} className="form-input" />
        </div>
        <div className="date-field">
          <label>To</label>
          <input type="date" value={dateFilter.endDate} onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })} className="form-input" />
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
        <span className="filter-count">Showing: {filteredLeads.length} leads</span>
      </div>

      <div className="filter-buttons-full">
        {filterOptions.map((opt) => (
          <button key={opt} onClick={() => setStatusFilter(opt)} className={`filter-btn-full ${statusFilter === opt ? "active" : ""}`}>
            {opt}
          </button>
        ))}
      </div>

      {error && <p className="leads-error">{error}</p>}

      {/* ADD FORM */}
      {showForm && (
        <div className="add-form-wrapper">
          <form onSubmit={handleSubmit} className="lead-form-narrow">
            <h3 className="form-title">➕ Add New Lead</h3>
            <div className="form-grid-narrow">
              <div className="form-field">
                <label className="input-label">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="Enter name" />
              </div>
              <div className="form-field">
                <label className="input-label">Phone * <small>(10 digits)</small></label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required maxLength={10} className="form-input" placeholder="9876543210" />
              </div>
              <div className="form-field">
                <label className="input-label">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" placeholder="email@example.com" />
              </div>
              <div className="form-field">
                <label className="input-label">Pincode *</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required maxLength={6} className="form-input" placeholder="6-digit" />
                {formData.city && <span className="address-fetched">✓ {formData.city}, {formData.state}</span>}
              </div>
              <div className="form-field full">
                <label className="input-label">Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required className="form-input" placeholder="Full address" />
              </div>
              <div className="form-field">
                <label className="input-label">Product *</label>
                <select name="product" value={formData.product} onChange={handleChange} required className="form-input">
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (<option key={p._id} value={p.name}>{p.name} — ₹{p.price?.toLocaleString()}</option>))}
                </select>
              </div>
              <div className="form-field">
                <label className="input-label">Price (₹) * <small>(Auto)</small></label>
                <input type="number" name="price" value={formData.price} readOnly className="form-input readonly-input" placeholder="Auto-filled" />
              </div>
              <div className="form-field">
                <label className="input-label">Source</label>
                <select name="source" value={formData.source} onChange={handleChange} className="form-input">
                  {sourceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="input-label">Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                  {statusOptions.map((o) => (
                    <option key={o} value={o}>
                      {o === "Order Done" ? "✅ Order Done (→ Orders)" :
                       o === "Interested" ? "⭐ Interested (with date)" : o}
                    </option>
                  ))}
                </select>
              </div>

              {formData.status === "Interested" && (
                <div className="form-field">
                  <label className="input-label">Follow-up Date *</label>
                  <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} required className="form-input" />
                </div>
              )}

              <div className="form-field full">
                <label className="input-label">Notes <small>(Optional)</small></label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="form-input" placeholder="Any notes..." />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg">
                {formData.status === "Order Done" ? "💾 Create & Move to Orders" :
                 formData.status === "Interested" ? "💾 Save as Interested" : "💾 Save Lead"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-lg">✕ Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT OVERLAY */}
      {editingId && (
        <div className="edit-overlay" onClick={cancelEdit}>
          <div className="edit-full-card" onClick={(e) => e.stopPropagation()}>
            <div className="edit-full-header">
              <h3>✏️ Edit Lead — Full Details</h3>
              <button onClick={cancelEdit} className="edit-close-btn">✕</button>
            </div>
            <div className="edit-form-grid">
              <div className="form-field"><label className="input-label">Name *</label><input type="text" name="name" value={editData.name} onChange={handleEditChange} required className="form-input" /></div>
              <div className="form-field"><label className="input-label">Email</label><input type="email" name="email" value={editData.email} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">Phone *</label><input type="tel" name="phone" value={editData.phone} onChange={handleEditChange} maxLength={10} className="form-input" /></div>
              <div className="form-field"><label className="input-label">Pincode</label><input type="text" name="pincode" value={editData.pincode || ""} onChange={handleEditChange} maxLength={6} className="form-input" />{pincodeLoading && <span className="pincode-loading">🔄</span>}{editData.city && <span className="address-fetched">✓ {editData.city}, {editData.state}</span>}</div>
              <div className="form-field"><label className="input-label">City</label><input type="text" name="city" value={editData.city || ""} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">State</label><input type="text" name="state" value={editData.state || ""} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field full"><label className="input-label">Address</label><input type="text" name="address" value={editData.address || ""} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">Product</label><select name="product" value={editData.product || ""} onChange={handleEditChange} className="form-input"><option value="">-- Select --</option>{products.map((p) => (<option key={p._id} value={p.name}>{p.name} — ₹{p.price?.toLocaleString()}</option>))}</select></div>
              <div className="form-field"><label className="input-label">Price (₹) *</label><input type="number" name="price" value={editData.price || ""} onChange={handleEditChange} className="form-input" /></div>
              <div className="form-field"><label className="input-label">Source</label><select name="source" value={editData.source || ""} onChange={handleEditChange} className="form-input">{sourceOptions.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
              <div className="form-field">
                <label className="input-label">Status *</label>
                <select name="status" value={editData.status || "New"} onChange={handleEditChange} className="form-input">
                  {statusOptions.map((o) => (
                    <option key={o} value={o}>
                      {o === "Order Done" ? "✅ Order Done (→ Orders)" :
                       o === "Interested" ? "⭐ Interested (with date)" : o}
                    </option>
                  ))}
                </select>
              </div>

              {editData.status === "Interested" && (
                <div className="form-field">
                  <label className="input-label">Follow-up Date *</label>
                  <input type="date" name="followUpDate" value={editData.followUpDate || ""} onChange={handleEditChange} required className="form-input" />
                </div>
              )}

              <div className="form-field full"><label className="input-label">Notes (Optional)</label><textarea name="notes" value={editData.notes || ""} onChange={handleEditChange} rows={3} className="form-input" /></div>
            </div>
            <div className="edit-full-actions">
              <button onClick={() => saveEdit(editingId)} className="btn btn-success btn-lg">💾 Save Changes</button>
              <button onClick={cancelEdit} className="btn btn-secondary btn-lg">✕ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* LEADS GRID */}
      {!editingId && (
        <div className="leads-grid-new">
          {filteredLeads.length === 0 && <p className="leads-empty">No leads found.</p>}
          {filteredLeads.map((lead) => {
            const isCalling = activeCall && activeCall.leadId === lead._id && !activeCall.ended;
            const callEnded = activeCall && activeCall.leadId === lead._id && activeCall.ended;
            const isCopied = copiedId === lead.leadId;

            return (
              <div key={lead._id} className="lead-card-new">
                <div className="lead-card-left">
                  <div
                    className={`lead-id-tag ${isCopied ? "copied" : ""}`}
                    onClick={(e) => copyLeadId(lead.leadId, e)}
                    title="Click to copy ID"
                  >
                    {isCopied ? "✓ Copied!" : (lead.leadId || "LD-----")}
                  </div>

                  <h3 className="lead-card-name">{lead.name}</h3>

                  <div className="lead-status-dot">
                    <span className={`status-dot ${statusColors[lead.status] || "status-default"}`}></span>
                    <span className="status-text">{lead.status}</span>
                  </div>

                  {lead.phone && (
                    <div className="left-call-icon-wrap">
                      <button
                        onClick={() => handleCall(lead.phone, lead.name, lead._id)}
                        className={`big-call-icon ${callEnded ? "ended" : isCalling ? "active" : ""}`}
                        title="Call"
                      >
                        📞
                      </button>
                      <div className="left-status-label">
                        {callEnded ? "CALL ENDED" : isCalling ? "CALLING..." : (lead.status?.toUpperCase() || "NEW LEAD")}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lead-card-right">
                  <div className="info-grid">
                    <div className="info-box">
                      <div className="info-icon icon-phone">📞</div>
                      <div className="info-text">
                        <div className="info-value">{lead.phone || "N/A"}</div>
                        <div className="info-label">Phone</div>
                      </div>
                    </div>

                    <div className="info-box">
                      <div className="info-icon icon-product">📦</div>
                      <div className="info-text">
                        <div className="info-value">{lead.product || "N/A"}</div>
                        <div className="info-label">Product</div>
                      </div>
                    </div>

                    <div className="info-box">
                      <div className="info-icon icon-money">💰</div>
                      <div className="info-text">
                        <div className="info-value">₹{Number(lead.price || 0).toLocaleString()}</div>
                        <div className="info-label">Value</div>
                      </div>
                    </div>

                    <div className="info-box">
                      <div className="info-icon icon-location">📍</div>
                      <div className="info-text">
                        <div className="info-value">{lead.city || "N/A"}</div>
                        <div className="info-label">Location</div>
                      </div>
                    </div>

                    {lead.status === "Interested" && lead.followUpDate && (
                      <div className="info-box interested-date-box">
                        <div className="info-icon icon-calendar">📅</div>
                        <div className="info-text">
                          <div className="info-value">{new Date(lead.followUpDate).toLocaleDateString()}</div>
                          <div className="info-label">Follow-up Date</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card-actions-new">
                    {lead.phone && (
                      <>
                        <button onClick={() => handleCall(lead.phone, lead.name, lead._id)} className={`compact-btn ${callEnded ? "btn-call-ended" : isCalling ? "btn-call-active" : "btn-call"}`} title="Call">
                          {callEnded ? "📵" : "📞"} Call
                        </button>
                        <button onClick={() => handleWhatsApp(lead.phone)} className="action-btn btn-action-msg" title="WhatsApp">💬 Message</button>
                      </>
                    )}
                    <button onClick={() => setViewLead(lead)} className="action-btn btn-action-view">👁 View</button>
                    <button onClick={() => startEdit(lead)} className="action-btn btn-action-edit">✏️ Edit</button>
                    <button onClick={() => handleDelete(lead._id)} className="action-btn btn-action-delete">🗑 Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODAL */}
      {viewLead && (
        <div className="edit-overlay" onClick={() => setViewLead(null)}>
          <div className="view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-full-header">
              <h3>👁 Lead Details</h3>
              <button onClick={() => setViewLead(null)} className="edit-close-btn">✕</button>
            </div>
            <div className="view-body">
              <div className="view-row">
                <strong>Lead ID:</strong>
                <span
                  className={`lead-id-tag-small ${copiedId === viewLead.leadId ? "copied" : ""}`}
                  onClick={(e) => copyLeadId(viewLead.leadId, e)}
                  title="Click to copy"
                >
                  {copiedId === viewLead.leadId ? "✓ Copied!" : (viewLead.leadId || "N/A")}
                </span>
              </div>
              <div className="view-row"><strong>Name:</strong> <span>{viewLead.name}</span></div>
              {viewLead.email && <div className="view-row"><strong>Email:</strong> <span>{viewLead.email}</span></div>}
              {viewLead.phone && <div className="view-row"><strong>Phone:</strong> <span>{viewLead.phone}</span></div>}
              {viewLead.product && <div className="view-row"><strong>Product:</strong> <span>{viewLead.product}</span></div>}
              {viewLead.price > 0 && <div className="view-row"><strong>Price:</strong> <span>₹{Number(viewLead.price).toLocaleString()}</span></div>}
              {viewLead.address && <div className="view-row"><strong>Address:</strong> <span>{viewLead.address}</span></div>}
              {viewLead.city && <div className="view-row"><strong>City/State:</strong> <span>{viewLead.city}, {viewLead.state}</span></div>}
              {viewLead.pincode && <div className="view-row"><strong>Pincode:</strong> <span>{viewLead.pincode}</span></div>}
              {viewLead.source && <div className="view-row"><strong>Source:</strong> <span>{viewLead.source}</span></div>}
              <div className="view-row"><strong>Status:</strong> <span className={`compact-status ${statusColors[viewLead.status]}`}>{viewLead.status}</span></div>
              {viewLead.status === "Interested" && viewLead.followUpDate && (
                <div className="view-row"><strong>Follow-up Date:</strong> <span>📅 {new Date(viewLead.followUpDate).toLocaleDateString()}</span></div>
              )}
              {viewLead.notes && <div className="view-row"><strong>Notes:</strong> <span>{viewLead.notes}</span></div>}
              <div className="view-row"><strong>Created:</strong> <span>{new Date(viewLead.createdAt).toLocaleString()}</span></div>
            </div>
            <div className="edit-full-actions">
              <button onClick={() => startEdit(viewLead)} className="btn btn-action-edit btn-lg">✏️ Edit</button>
              <button onClick={() => setViewLead(null)} className="btn btn-secondary btn-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;