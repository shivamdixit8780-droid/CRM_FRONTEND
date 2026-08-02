import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService";

function Customers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const idFilter = searchParams.get("edit");

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (idFilter && customers.length > 0) {
      const targetCustomer = customers.find(
        (c) => c._id === idFilter
      );

      if (targetCustomer) {
        startEdit(targetCustomer);
        // {
        //   (() => {
        //     console.log("editingId:", editingId);
        //     console.log("customerId:", customer._id);
        //     return null;
        //   })()
        // }

        setTimeout(() => {
          const el = document.getElementById(`customer-${idFilter}`);

          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
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

  const startEdit = (customer) => {
    setEditingId(customer._id);
    setEditData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
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
    } catch (err) {
      setError("Update nahi ho paaya");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await deleteCustomer(id);
      fetchCustomers();
      alert("Customer deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Delete failed.");
    }
  };

  if (loading) return <p className="p-6">Loading customers...</p>;
  const filteredCustomers = customers.filter((customer) => {
    const keyword = searchTerm.toLowerCase();

    return (
      customer.name?.toLowerCase().includes(keyword) ||
      customer.email?.toLowerCase().includes(keyword) ||
      customer.phone?.toLowerCase().includes(keyword)
    );
  });

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Customers
        </h2>

        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-semibold">
          Total : {filteredCustomers.length}
        </span>
      </div>
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="🔍 Search Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => setSearchTerm("")}
            className="bg-gray-200 hover:bg-gray-300 rounded-xl px-4 py-2"
          >
            Clear Search
          </button>

        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {customers.length === 0 && <p className="text-gray-500">Koi customer nahi mila.</p>}

        {filteredCustomers.map((customer) => (
          <div
            key={customer._id}
            id={`customer-${customer._id}`}
            className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 p-5"
          >

            {editingId === customer._id ? (
              <div className="space-y-2">
                <input type="text" name="name" value={editData.name} onChange={handleEditChange} className={inputClass} placeholder="Name" />
                <input type="email" name="email" value={editData.email} onChange={handleEditChange} className={inputClass} placeholder="Email" />
                <input type="text" name="phone" value={editData.phone} onChange={handleEditChange} className={inputClass} placeholder="Phone" />
                <input type="text" name="address" value={editData.address} onChange={handleEditChange} className={inputClass} placeholder="Address" />

                <div className="flex gap-2 pt-1">
                  <button onClick={() => saveEdit(customer._id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    Save
                  </button>
                  <button onClick={cancelEdit} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h4 className="text-lg font-bold text-gray-800">{customer.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{customer.phone}</p>
                <p className="text-sm text-gray-600 mt-1">{customer.email}</p>
                <p className="text-sm text-gray-500 mt-1">{customer.address}</p>
                <div className="mt-3">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {customer.source}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => startEdit(customer)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(customer._id)}
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

export default Customers;