import { useState, useEffect } from "react";
import { getLeads } from "../services/leadService";
import { getCustomers } from "../services/customerService";
import {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
} from "../services/followUpService";

function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    type: "Lead",
    refId: "",
    note: "",
    followUpDate: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [followUpRes, leadRes, customerRes] = await Promise.all([
        getFollowUps(),
        getLeads(),
        getCustomers(),
      ]);
      setFollowUps(followUpRes.data);
      setLeads(leadRes.data);
      setCustomers(customerRes.data);
    } catch (err) {
      setError("Data load nahi ho paaya");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setFormData({ ...formData, type: value, refId: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        note: formData.note,
        followUpDate: formData.followUpDate,
        lead: formData.type === "Lead" ? formData.refId : undefined,
        customer: formData.type === "Customer" ? formData.refId : undefined,
      };

      await createFollowUp(payload);

      setFormData({ type: "Lead", refId: "", note: "", followUpDate: "" });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError("Follow-up create nahi ho paaya");
    }
  };

  const startEdit = (f) => {
    setEditingId(f._id);
    setEditData({
      note: f.note,
      followUpDate: f.followUpDate ? f.followUpDate.slice(0, 10) : "",
      status: f.status,
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
    if (!window.confirm("Delete this follow-up?")) return;

    try {
      await deleteFollowUp(id);
      fetchAll();
      alert("Follow-up deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Delete failed.");
    }
  };

  const saveEdit = async (id) => {
    try {
      await updateFollowUp(id, editData);
      setEditingId(null);
      fetchAll();
    } catch (err) {
      setError("Follow-up update nahi ho paaya");
    }
  };

  if (loading) return <p className="p-6">Loading follow-ups...</p>;
  const filteredFollowUps = followUps.filter((f) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(f.followUpDate);
    date.setHours(0, 0, 0, 0);

    switch (filterType) {
      case "pending":
        return f.status === "Pending";

      case "completed":
        return f.status === "Completed";

      case "missed":
        return f.status === "Missed";

      case "today":
        return date.getTime() === today.getTime();

      case "upcoming":
        return date > today;

      case "overdue":
        return date < today && f.status !== "Completed";

      default:
        return true;
    }
  });

  const optionsList = formData.type === "Lead" ? leads : customers;

  const totalFollowUps = followUps.length;
  const pendingCount = followUps.filter(f => f.status === "Pending").length;
  const completedCount = followUps.filter(f => f.status === "Completed").length;
  const missedCount = followUps.filter(f => f.status === "Missed").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCount = followUps.filter((f) => {
    const date = new Date(f.followUpDate);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  }).length;

  const upcomingCount = followUps.filter((f) => {
    const date = new Date(f.followUpDate);
    date.setHours(0, 0, 0, 0);
    return date > today;
  }).length;

  const overdueCount = followUps.filter((f) => {
    const date = new Date(f.followUpDate);
    date.setHours(0, 0, 0, 0);
    return date < today && f.status !== "Completed";
  }).length;

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const statusBadgeColor = {
    Pending: "bg-amber-100 text-amber-700",
    Completed: "bg-green-100 text-green-700",
    Missed: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Follow-ups</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Follow-up"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <div
          onClick={() => setFilterType("all")}
          className="bg-white rounded-xl shadow border p-5 cursor-pointer hover:shadow-lg"
        >
          <p className="text-gray-500 text-sm">Total Follow-ups</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {totalFollowUps}
          </h2>
        </div>

        <div
          onClick={() => setFilterType("pending")}
          className="bg-white rounded-xl shadow border p-5 cursor-pointer hover:shadow-lg"
        >
          <p className="text-gray-500 text-sm">Pending</p>
          <h2 className="text-3xl font-bold text-yellow-500">
            {pendingCount}
          </h2>
        </div>

        <div
          onClick={() => setFilterType("completed")}
          className="bg-white rounded-xl shadow border p-5 cursor-pointer hover:shadow-lg"
        >
          <p className="text-gray-500 text-sm">Completed</p>
          <h2 className="text-3xl font-bold text-green-600">
            {completedCount}
          </h2>
        </div>

        <div
          onClick={() => setFilterType("missed")}
          className="bg-white rounded-xl shadow border p-5 cursor-pointer hover:shadow-lg"
        >
          <p className="text-gray-500 text-sm">Missed</p>
          <h2 className="text-3xl font-bold text-red-600">
            {missedCount}
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div
          onClick={() => setFilterType("today")}
          className="bg-blue-50 border border-blue-200 rounded-xl p-5 cursor-pointer hover:shadow-lg"
        >
          <p className="text-sm text-gray-500">Today's Follow-ups</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {todayCount}
          </h2>
        </div>


        <div
          onClick={() => setFilterType("upcoming")}
          className="bg-green-50 border border-green-200 rounded-xl p-5 cursor-pointer hover:shadow-lg"
        >
          <p className="text-sm text-gray-500">Upcoming</p>
          <h2 className="text-3xl font-bold text-green-600">
            {upcomingCount}
          </h2>
        </div>


        <div
          onClick={() => setFilterType("overdue")}
          className="bg-red-50 border border-red-200 rounded-xl p-5 cursor-pointer hover:shadow-lg"
        >
          <p className="text-sm text-gray-500">Overdue</p>
          <h2 className="text-3xl font-bold text-red-600">
            {overdueCount}
          </h2>
        </div>

      </div>


      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Name or Note..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-3 mb-6">

        <button
          onClick={() => setStatusFilter("All")}
          className={`px-4 py-2 rounded-lg ${statusFilter === "All"
            ? "bg-blue-600 text-white"
            : "bg-gray-200"
            }`}
        >
          All
        </button>

        <button
          onClick={() => setStatusFilter("Pending")}
          className={`px-4 py-2 rounded-lg ${statusFilter === "Pending"
            ? "bg-yellow-500 text-white"
            : "bg-gray-200"
            }`}
        >
          Pending
        </button>

        <button
          onClick={() => setStatusFilter("Completed")}
          className={`px-4 py-2 rounded-lg ${statusFilter === "Completed"
            ? "bg-green-600 text-white"
            : "bg-gray-200"
            }`}
        >
          Completed
        </button>

        <button
          onClick={() => setStatusFilter("Missed")}
          className={`px-4 py-2 rounded-lg ${statusFilter === "Missed"
            ? "bg-red-600 text-white"
            : "bg-gray-200"
            }`}
        >
          Missed
        </button>

      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 border rounded-xl p-4 bg-white space-y-3">
          <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
            <option value="Lead">Lead</option>
            <option value="Customer">Customer</option>
          </select>

          <select name="refId" value={formData.refId} onChange={handleChange} required className={inputClass}>
            <option value="">-- Select {formData.type} --</option>
            {optionsList.map((item) => (
              <option key={item._id} value={item._id}>{item.name}</option>
            ))}
          </select>

          <input
            type="text"
            name="note"
            placeholder="Note (e.g. Pricing discuss karni hai)"
            value={formData.note}
            onChange={handleChange}
            required
            className={inputClass}
          />

          <input
            type="date"
            name="followUpDate"
            value={formData.followUpDate}
            onChange={handleChange}
            required
            className={inputClass}
          />

          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Save Follow-up
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {followUps.length === 0 && <p className="text-gray-500">Koi follow-up nahi mila.</p>}

        {filteredFollowUps
          .filter((f) => {
            if (statusFilter === "All") return true;
            return f.status === statusFilter;
          })
          .filter((f) => {
            const keyword = searchTerm.toLowerCase();

            const personName = (
              f.lead?.name ||
              f.customer?.name ||
              ""
            ).toLowerCase();

            return (
              personName.includes(keyword) ||
              f.note.toLowerCase().includes(keyword)
            );
          })
          .map((f) => (
            <div key={f._id} className="bg-white border rounded-xl p-4 shadow-sm">

              {editingId === f._id ? (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-800">
                    {f.lead ? f.lead.name : f.customer ? f.customer.name : "Unknown"}
                    <span className="ml-2 text-xs text-gray-400">
                      ({f.lead ? "Lead" : "Customer"})
                    </span>
                  </p>

                  <textarea
                    name="note"
                    value={editData.note}
                    onChange={handleEditChange}
                    rows={2}
                    className={inputClass}
                  />

                  <input
                    type="date"
                    name="followUpDate"
                    value={editData.followUpDate}
                    onChange={handleEditChange}
                    className={inputClass}
                  />

                  <select name="status" value={editData.status} onChange={handleEditChange} className={inputClass}>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Missed">Missed</option>
                  </select>

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => saveEdit(f._id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                      Save
                    </button>
                    <button onClick={cancelEdit} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {f.lead ? f.lead.name : f.customer ? f.customer.name : "Unknown"}
                  </h4>
                  <span className="text-xs text-gray-400 mb-2 block">
                    Linked to: {f.lead ? "Lead" : "Customer"}
                  </span>
                  {f.lead && (
                    <>
                      <p className="text-sm text-gray-600">
                        📞 {f.lead.phone}
                      </p>

                      <p className="text-sm text-gray-600">
                        ✉ {f.lead.email}
                      </p>
                    </>
                  )}

                  {f.customer && (
                    <>
                      <p className="text-sm text-gray-600">
                        📞 {f.customer.phone}
                      </p>

                      <p className="text-sm text-gray-600">
                        ✉ {f.customer.email}
                      </p>
                    </>
                  )}

                  <p className="text-sm text-gray-600">{f.note}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Date: {new Date(f.followUpDate).toLocaleDateString()}
                  </p>

                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${statusBadgeColor[f.status] || "bg-gray-100 text-gray-700"}`}>
                    {f.status}
                  </span>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => startEdit(f)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(f._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
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

export default FollowUps;