import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../services/orderService";
import { getCustomers } from "../services/customerService";

function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const [formData, setFormData] = useState({
    customer: "",
    amount: "",
    status: "Pending",
    notes: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  const fetchOrders = async (startDate, endDate) => {
    try {
      setLoading(true);
      const res = await getOrders(startDate, endDate);
      setOrders(res.data);
    } catch (err) {
      setError("Orders load nahi ho paaye");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (err) {
      setError("Customers load nahi ho paaye");
    }
  };

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const applyFilter = () => {
    fetchOrders(dateRange.startDate, dateRange.endDate);
  };

  const clearFilter = () => {
    setDateRange({ startDate: "", endDate: "" });
    fetchOrders();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOrder(formData);
      setFormData({ customer: "", amount: "", status: "Pending", notes: "" });
      setShowForm(false);
      fetchOrders(dateRange.startDate, dateRange.endDate);
    } catch (err) {
      setError("Order create nahi ho paaya");
    }
  };

  const startEdit = (order) => {
    setEditingId(order._id);
    setEditData({
      amount: order.amount,
      status: order.status,
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
      fetchOrders(dateRange.startDate, dateRange.endDate);
    } catch (err) {
      setError("Order update nahi ho paaya");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      await deleteOrder(id);

      fetchOrders(dateRange.startDate, dateRange.endDate);

      alert("Order deleted successfully.");
    } catch (err) {
      console.error(err);

      alert(err?.response?.data?.message || "Delete failed.");
    }
  };

  if (loading) return <p className="p-6">Loading orders...</p>;

  // URL se aaye status ke hisaab se filter karo
  const displayedOrders = statusFilter
    ? orders.filter((order) => order.status === statusFilter)
    : orders;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Orders
          </h2>

          <p className="text-sm text-gray-500">
            Manage all customer orders
          </p>
        </div>

        <div className="flex gap-3 items-center">

          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-semibold">
            Total : {displayedOrders.length}
          </span>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add Order"}
          </button>

        </div>
      </div>

      {/* Filter badge — agar URL se status filter aaya hai */}
      {
        statusFilter && (
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Filtered: {statusFilter}
            </span>
            <button
              onClick={() => setSearchParams({})}
              className="text-sm text-gray-500 underline"
            >
              Clear filter
            </button>
          </div>
        )
      }

      {/* Date Range Filter */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-5 mb-6">

        <div className="grid md:grid-cols-4 gap-4">

          <div>
            <label className="text-sm font-medium">
              From
            </label>

            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="w-full mt-1 border rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              To
            </label>

            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="w-full mt-1 border rounded-xl px-3 py-2"
            />
          </div>

          <button
            onClick={applyFilter}
            className="bg-blue-600 text-white rounded-xl"
          >
            Apply Filter
          </button>

          <button
            onClick={clearFilter}
            className="bg-gray-200 rounded-xl"
          >
            Reset
          </button>

        </div>

      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {
        showForm && (
          <form onSubmit={handleSubmit} className="mb-6 border rounded-xl p-4 bg-white space-y-3">
            <select name="customer" value={formData.customer} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" name="notes" placeholder="Notes (optional)" value={formData.notes} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Save Order
            </button>
          </form>
        )
      }

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedOrders.length === 0 && <p className="text-gray-500">Is filter mein koi order nahi mila.</p>}

        {displayedOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 p-5">
            {editingId === order._id ? (
              <>
                <p className="font-semibold text-gray-800 mb-2">{order.customer?.name}</p>
                <input type="number" name="amount" value={editData.amount} onChange={handleEditChange} className="w-full mb-2 px-2 py-1 border rounded text-sm" />
                <select name="status" value={editData.status} onChange={handleEditChange} className="w-full mb-2 px-2 py-1 border rounded text-sm">
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <input type="text" name="notes" value={editData.notes} onChange={handleEditChange} className="w-full mb-2 px-2 py-1 border rounded text-sm" />
                <button onClick={() => saveEdit(order._id)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm mr-2">Save</button>
                <button onClick={cancelEdit} className="px-3 py-1 bg-gray-200 rounded text-sm">Cancel</button>
              </>
            ) : (
              <>
                <h4 className="text-lg font-bold text-gray-800">
                  {order.customer?.name}
                </h4>

                <div className="mt-3">

                  <p className="text-2xl font-bold text-blue-600">
                    ₹{order.amount}
                  </p>

                </div>

                <div className="mt-3">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "Processing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >

                    {order.status}

                  </span>

                </div>

                <p className="text-sm text-gray-500 mt-3">
                  {order.notes}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

                <div className="mt-5">

                  <div className="mt-4 flex gap-2">

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg text-sm"
                    >
                      View
                    </button>

                    <button
                      onClick={() => startEdit(order)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(order._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm"
                    >
                      Delete
                    </button>

                  </div>

                </div>
                {
                  selectedOrder && (
                    <div className="space-y-3">

                      <div className="grid grid-cols-2 gap-3">

                        <div>
                          <p className="text-gray-500 text-sm">Customer</p>
                          <p className="font-semibold">{selectedOrder.customer?.name}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-sm">Phone</p>
                          <p className="font-semibold">{selectedOrder.customer?.phone}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-sm">Email</p>
                          <p className="font-semibold break-all">
                            {selectedOrder.customer?.email}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-sm">Amount</p>
                          <p className="text-green-600 text-xl font-bold">
                            ₹₹{order.amount}
                          </p>
                        </div>

                      </div>

                      <div className="mt-3">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedOrder.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : selectedOrder.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : selectedOrder.status === "Processing"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                        >
                          {selectedOrder.status}
                        </span>

                      </div>

                      <div className="mt-3">
                        <p className="text-gray-500 text-sm">Notes</p>
                        <p>{selectedOrder.notes || "No Notes"}</p>
                      </div>

                      <div className="mt-3">
                        <p className="text-gray-500 text-sm">Created</p>
                        <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      </div>

                    </div>
                  )
                }

              </>
            )}
          </div>
        ))}
      </div>
    </div >
  );
}

export default Orders;