import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
// import { getLeads, createLead, updateLead } from "../services/leadService";
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
} from "../services/leadService";


function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");
  const idFilter = searchParams.get("edit");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    source: "Website",
    status: "New",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const res = await getLeads();

      setLeads(res.data);


    } catch (err) {
      setError("Leads load nahi ho paaye");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log("idFilter:", idFilter);
    console.log("leads:", leads);
    if (!idFilter || leads.length === 0) return;

    const lead = leads.find((item) => item._id === idFilter);

    if (!lead) return;

    startEdit(lead);

    setTimeout(() => {
      const element = document.getElementById(`lead-${lead._id}`);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 200);

    setSearchParams({});
  }, [idFilter, leads]);

  // 👇 Iske baad tumhara existing code

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLead(formData);
      setFormData({ name: "", email: "", phone: "", address: "", source: "Website", status: "New" });
      setShowForm(false);
      fetchLeads();
    } catch (err) {
      setError("Lead create nahi ho paaya");
    }
  };

  const startEdit = (lead) => {
    setEditingId(lead._id);
    setEditData({
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      address: lead.address || "",
      source: lead.source || "Website",
      status: lead.status || "New",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) return;

    try {
      await deleteLead(id);
      fetchLeads();
      alert("Lead deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Delete failed.");
    }
  };
  const saveEdit = async (id) => {
    try {
      await updateLead(id, editData);

      setEditingId(null);
      setEditData({});

      fetchLeads();

      alert("Lead updated successfully.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Update failed.");
    }
  };

  if (loading) return <p className="p-6">Loading leads...</p>;

  const displayedLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter
      ? lead.status === statusFilter
      : lead.status !== "Converted";

    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      lead.name?.toLowerCase().includes(keyword) ||
      lead.email?.toLowerCase().includes(keyword) ||
      lead.phone?.toLowerCase().includes(keyword);

    return matchesStatus && matchesSearch;
  });

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const statusBadgeColor = {
    New: "bg-blue-100 text-blue-700",
    Contacted: "bg-amber-100 text-amber-700",
    "Proposal Sent": "bg-purple-100 text-purple-700",
    Negotiation: "bg-orange-100 text-orange-700",
    Converted: "bg-green-100 text-green-700",
    Lost: "bg-red-100 text-red-700",
  };

  const sourceOptions = ["Website", "Referral", "Ads", "Walk-in", "Cold Call", "LinkedIn", "Instagram", "Google Ads", "Facebook", "Other"];
  const statusOptions = ["New", "Contacted", "Proposal Sent", "Negotiation", "Converted", "Lost"];

  return (
    <div className="leads-page">
      <div className="leads-header">
        <h2 className="leads-title">Leads</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="add-btn"
        >
          {showForm ? "Cancel" : "+ Add Lead"}
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">

          <div className="flex flex-1 gap-3">

            <input
              type="text"
              placeholder="Search Name / Email / Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <button
              onClick={() => setSearchTerm("")}
              className="px-5 rounded-xl bg-gray-200 hover:bg-gray-300"
            >
              Clear
            </button>

          </div>

          <div className="flex gap-3">

            <button
              className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
            >
              Export CSV
            </button>

            <button
              onClick={fetchLeads}
              className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Refresh
            </button>

          </div>

        </div>
      </div>
      {statusFilter ? (
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            Filtered: {statusFilter}
          </span>
          <button onClick={() => setSearchParams({})} className="text-sm text-gray-500 underline">
            Clear filter
          </button>
        </div>
      ) : (
        !idFilter && (
          <p className="text-xs text-gray-400 mb-4">
            Note: Converted leads yahan nahi dikhte — wo Customers page mein chale jaate hain.
          </p>
        )
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 border rounded-xl p-4 bg-white space-y-3">
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className={inputClass} />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputClass} />
          <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className={inputClass} />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className={inputClass} />

          <select name="source" value={formData.source} onChange={handleChange} className={inputClass}>
            {sourceOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Save Lead
          </button>
        </form>
      )}

      <div className="leads-grid">
        {displayedLeads.length === 0 && <p className="text-gray-500">Koi lead nahi mila.</p>}

        {displayedLeads.map((lead) => (
          <div
            key={lead._id}
            id={`lead-${lead._id}`}
            className="lead-card"
          >

            {editingId === lead._id ? (
              <div className="space-y-2">
                <input type="text" name="name" value={editData.name} onChange={handleEditChange} className={inputClass} placeholder="Name" />
                <input type="email" name="email" value={editData.email} onChange={handleEditChange} className={inputClass} placeholder="Email" />
                <input type="text" name="phone" value={editData.phone} onChange={handleEditChange} className={inputClass} placeholder="Phone" />
                <input type="text" name="address" value={editData.address} onChange={handleEditChange} className={inputClass} placeholder="Address" />

                <select name="source" value={editData.source} onChange={handleEditChange} className={inputClass}>
                  {sourceOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                <select name="status" value={editData.status} onChange={handleEditChange} className={inputClass}>
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => saveEdit(lead._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                  >
                    Save
                  </button>

                  <button
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h4 className="lead-name">{lead.name}</h4>
                <p className="lead-text">{lead.phone}</p>
                <p className="lead-text">{lead.email}</p>
                <p className="text-sm text-gray-500 mt-1">Source: {lead.source}</p>

                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${statusBadgeColor[lead.status] || "bg-gray-100 text-gray-700"}`}>
                  {lead.status}
                </span>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => startEdit(lead)}
                    className="action-btn edit-btn"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(lead._id)}
                    className="action-btn delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leads;