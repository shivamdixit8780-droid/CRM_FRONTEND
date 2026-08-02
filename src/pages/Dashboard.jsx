import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import StatusBadge from "../components/common/StatusBadge";
import { getDashboardOverview } from "../services/dashboardService";
import { globalSearch } from "../services/searchService";
import { getEmployees } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users,
  UserCheck,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

const STATUS_COLORS = {
  New: "#3b82f6",
  Contacted: "#f59e0b",
  "Proposal Sent": "#a855f7",
  Negotiation: "#f97316",
  Converted: "#22c55e",
  Lost: "#ef4444",
  Pending: "#f59e0b",
  Processing: "#3b82f6",
  Completed: "#22c55e",
  Cancelled: "#ef4444",
};

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canFilterByEmployee = user?.role === "admin" || user?.role === "manager";

  const [data, setData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
    if (canFilterByEmployee) fetchEmployees();
  }, []);

  const fetchDashboard = async (employeeId) => {
    try {
      setLoading(true);
      const res = await getDashboardOverview(employeeId);
      setData(res.data);
    } catch (err) {
      setError("Dashboard load nahi ho paaya");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      setError("Employees load nahi ho paaye");
    }
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmployee(empId);
    fetchDashboard(empId);
  };
  const handleSearch = async (value) => {
    setSearchTerm(value);

    if (!value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setSearchLoading(true);

      const res = await globalSearch(value);

      const results = [
        ...res.data.leads.map((item) => ({
          ...item,
          type: "Lead",
        })),
        ...res.data.customers.map((item) => ({
          ...item,
          type: "Customer",
        })),
      ];

      setSearchResults(results);
      setShowResults(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };
  if (loading) return <p className="p-6">Loading dashboard...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueChartData = data.revenueTrend.map((item) => ({
    month: monthNames[item._id.month - 1],
    revenue: item.total,
  }));

    return (
  <div className="min-h-screen bg-slate-100 p-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        {/* Total Leads */}
        <div className="bg-white rounded-2xl shadow-md border p-6 min-h-[140px] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center">

            <div>
              <p className="text-gray-500 text-sm">
                Total Leads
              </p>

              <h2 className="text-4xl font-bold mt-2 text-gray-800">
                {data.totalLeads}
              </h2>

              <p className="text-green-600 text-sm mt-3 flex items-center gap-1">
                <TrendingUp size={16} />
                +12% this month
              </p>
            </div>

            <div className="bg-blue-100 p-4 rounded-xl">
              <Users className="text-blue-600" size={32} />
            </div>

          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-2xl shadow-md border p-6 min-h-[140px] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center">

            <div>
              <p className="text-gray-500 text-sm">
                Total Customers
              </p>

              <h2 className="text-4xl font-bold mt-2 text-gray-800">
                {data.totalCustomers}
              </h2>

              <p className="text-green-600 text-sm mt-3 flex items-center gap-1">
                <TrendingUp size={16} />
                Active Customers
              </p>
            </div>

            <div className="bg-green-100 p-4 rounded-xl">
              <UserCheck className="text-green-600" size={32} />
            </div>

          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl shadow-md border p-6 min-h-[140px] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center">

            <div>
              <p className="text-gray-500 text-sm">
                Total Orders
              </p>

              <h2 className="text-4xl font-bold mt-2 text-gray-800">
                {data.totalOrders}
              </h2>

              <p className="text-blue-600 text-sm mt-3 flex items-center gap-1">
                <ShoppingCart size={16} />
                Orders Received
              </p>
            </div>

            <div className="bg-purple-100 p-4 rounded-xl">
              <ShoppingCart className="text-purple-600" size={32} />
            </div>

          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-2xl shadow-md border p-6 min-h-[140px] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center">

            <div>
              <p className="text-gray-500 text-sm">
                Revenue
              </p>

              <h2 className="text-3xl font-bold mt-2 text-gray-800">
                ₹{data.revenue.toLocaleString()}
              </h2>

              <p className="text-orange-600 text-sm mt-3 flex items-center gap-1">
                <IndianRupee size={16} />
                Total Revenue
              </p>
            </div>

            <div className="bg-orange-100 p-4 rounded-xl">
              <IndianRupee className="text-orange-600" size={32} />
            </div>

          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Leads by Status <span className="text-xs text-gray-400 font-normal">(click a slice)</span>
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.leadsByStatus}
                dataKey="count"
                nameKey="_id"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {data.leadsByStatus.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={STATUS_COLORS[entry._id] || "#999"}
                    onClick={() => navigate(`/leads?status=${entry._id}`)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Orders by Status <span className="text-xs text-gray-400 font-normal">(click a row)</span>
          </h3>
          <div className="space-y-3">
            {data.ordersByStatus.map((item) => {
              const total = data.ordersByStatus.reduce((sum, o) => sum + o.count, 0);
              const percent = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
              return (
                <div
                  key={item._id}
                  onClick={() => navigate(`/orders?status=${item._id}`)}
                  className="cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors"
                >
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{item._id}</span>
                    <span>{item.count} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${percent}%`, backgroundColor: STATUS_COLORS[item._id] || "#999" }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Leads</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLeads.map((lead) => (
                  <tr key={lead._id} className="border-b last:border-0">
                    <td className="py-2 pr-2 font-medium text-gray-800">{lead.name}</td>
                    <td className="py-2 pr-2">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${STATUS_COLORS[lead.status]}20`, color: STATUS_COLORS[lead.status] }}
                      >
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-2">Customer</th>
                  <th className="py-2 pr-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b last:border-0">
                    <td className="py-2 pr-2 font-medium text-gray-800">{order.customer?.name || "—"}</td>
                    <td className="py-2 pr-2">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status] }}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;