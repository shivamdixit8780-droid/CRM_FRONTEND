import "../styles/dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardOverview } from "../services/dashboardService";
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
  DollarSign,
} from "lucide-react";

// ============================================
// 🎨 STATUS COLORS (Predefined for known statuses)
// ============================================
const STATUS_COLORS = {
  // Lead statuses
  New: "#3b82f6",              // Blue
  Contacted: "#f59e0b",        // Amber
  "Proposal Sent": "#a855f7",  // Purple
  Negotiation: "#f97316",      // Orange
  "Order Done": "#22c55e",     // Green (renamed from Converted)
  Converted: "#22c55e",        // Backward compatibility
  Lost: "#ef4444",             // Red
  "Follow-up": "#eab308",      // Yellow
  Interested: "#06b6d4",       // Cyan
  NPC: "#94a3b8",              // Gray

  // Order statuses
  Pending: "#f59e0b",
  Processing: "#3b82f6",
  "In Transit": "#0ea5e9",
  "Out for Delivery": "#8b5cf6",
  Pickup: "#eab308",
  Shipped: "#06b6d4",
  Delivered: "#22c55e",
  Completed: "#22c55e",
  Cancelled: "#ef4444",
};

// ============================================
// 🎨 DYNAMIC COLOR PALETTE
// Agar koi status COLORS me nahi mila to auto assign hoga
// ============================================
const DYNAMIC_COLORS = [
  "#6366f1", "#ec4899", "#14b8a6", "#f43f5e", "#8b5cf6",
  "#10b981", "#f59e0b", "#3b82f6", "#a855f7", "#06b6d4",
  "#84cc16", "#f97316", "#0ea5e9", "#d946ef", "#22c55e",
];

// Hash function - same status = same color always
const getColorForStatus = (status) => {
  if (STATUS_COLORS[status]) return STATUS_COLORS[status];
  
  // Hash based on status string
  let hash = 0;
  for (let i = 0; i < status.length; i++) {
    hash = status.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DYNAMIC_COLORS.length;
  return DYNAMIC_COLORS[index];
};

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canFilterByEmployee = user?.role === "admin" || user?.role === "manager";

  const [data, setData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <p className="dashboard-loading">Loading dashboard...</p>;
  if (error) return <p className="dashboard-error">{error}</p>;

  // ============================================
  // 📅 CURRENT MONTH INFO
  // ============================================
  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthName = monthNames[currentMonthIndex];
  const daysInCurrentMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

  // ============================================
  // 📊 REVENUE TREND — CURRENT MONTH DAILY DATA
  // ============================================
  const buildCurrentMonthData = () => {
    const dailyMap = {};

    // Har din ka slot banao (1 se 31 tak)
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      dailyMap[day] = 0;
    }

    // revenueTrend me se sirf current month ke data lo
    // Backend agar daily data deta hai to use karo, warna monthly data se latest month lo
    if (data.revenueTrend && data.revenueTrend.length > 0) {
      data.revenueTrend.forEach((item) => {
        // Agar backend day-wise data bhejta hai
        if (item._id.day && item._id.month === currentMonthIndex + 1 && item._id.year === currentYear) {
          dailyMap[item._id.day] = item.total;
        }
        // Agar backend month-wise deta hai to current month ka total distribute na karo
        // Simply latest month ke daily orders se calculate karo (fallback)
      });
    }

    // Agar backend se daily data nahi mila, to recentOrders se banao
    const hasAnyDailyData = Object.values(dailyMap).some(v => v > 0);
    if (!hasAnyDailyData && data.recentOrders) {
      data.recentOrders.forEach((order) => {
        if (!order.createdAt) return;
        const orderDate = new Date(order.createdAt);
        if (orderDate.getMonth() === currentMonthIndex && 
            orderDate.getFullYear() === currentYear) {
          const day = orderDate.getDate();
          dailyMap[day] = (dailyMap[day] || 0) + (Number(order.amount) || 0);
        }
      });
    }

    return Object.entries(dailyMap).map(([day, revenue]) => ({
      day: day.padStart(2, "0"),
      revenue,
    }));
  };

  const revenueChartData = buildCurrentMonthData();

  // ============================================
  // 🎨 LEAD ANALYTICS DATA (with rename)
  // "Converted" → "Order Done"
  // ============================================
  const leadAnalyticsData = (data.leadsByStatus || []).map((entry) => ({
    ...entry,
    _id: entry._id === "Converted" ? "Order Done" : entry._id,
  }));

  return (
    <div className="dashboard-page">

      {/* ================ STATS CARDS ================ */}
      <div className="dashboard-cards">

        {/* Total Leads */}
        <div className="dashboard-card">
          <div className="card-top">
            <div className="card-left">
              <p className="card-title">Total Leads</p>
              <h2 className="card-number">{data.totalLeads}</h2>
              <p className="card-info green">
                <TrendingUp size={16} />
                Active Leads
              </p>
            </div>
            <div className="icon-box blue">
              <Users size={28} />
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="dashboard-card">
          <div className="card-top">
            <div className="card-left">
              <p className="card-title">Total Customers</p>
              <h2 className="card-number">{data.totalCustomers}</h2>
              <p className="card-info green">
                <TrendingUp size={16} />
                Active Customers
              </p>
            </div>
            <div className="icon-box green">
              <UserCheck size={28} />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="dashboard-card">
          <div className="card-top">
            <div className="card-left">
              <p className="card-title">Total Orders</p>
              <h2 className="card-number">{data.totalOrders}</h2>
              <p className="card-info purple">
                <ShoppingCart size={16} />
                Orders Received
              </p>
            </div>
            <div className="icon-box purple">
              <ShoppingCart size={28} />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="dashboard-card">
          <div className="card-top">
            <div className="card-left">
              <p className="card-title">Revenue</p>
              <h2 className="card-number">₹{(data.revenue || 0).toLocaleString()}</h2>
              <p className="card-info orange">
                <IndianRupee size={16} />
                Delivered Order
              </p>
            </div>
            <div className="icon-box orange">
              <IndianRupee size={28} />
            </div>
          </div>
        </div>

        {/* Total Sales */}
        <div className="dashboard-card">
          <div className="card-top">
            <div className="card-left">
              <p className="card-title">Total Sales</p>
              <h2 className="card-number">₹{(data.totalSales || 0).toLocaleString()}</h2>
              <p className="card-info green">
                <TrendingUp size={16} />
                All Orders
              </p>
            </div>
            <div className="icon-box green">
              <DollarSign size={28} />
            </div>
          </div>
        </div>

      </div>

      {/* ================ CHARTS SECTION ================ */}
      <div className="chart-grid">

        {/* ================ REVENUE TREND ================ */}
        <div className="chart-card">
          <div className="card-header">
            <h3>Revenue Trend</h3>
            <span>{currentMonthName} {currentYear}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={2}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(day) => `${currentMonthName} ${day}`}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#6366f1' }}
                activeDot={{ r: 6, fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ================ LEAD ANALYTICS ================ */}
        <div className="chart-card">
          <div className="card-header">
            <h3>Lead Analytics</h3>
            <span>Click to Filter</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={leadAnalyticsData}
                dataKey="count"
                nameKey="_id"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {leadAnalyticsData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={getColorForStatus(entry._id)}
                    onClick={() => navigate(`/leads?status=${entry._id === "Order Done" ? "Converted" : entry._id}`)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
                formatter={(value, name) => [`${value} leads`, name]}
              />
              <Legend 
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: 'inherit', fontSize: '13px' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ================ BOTTOM SECTION ================ */}
      <div className="bottom-grid">

        {/* Orders Overview */}
        <div className="dashboard-box">
          <div className="card-header">
            <h3>Orders Overview</h3>
            <span>Live Status</span>
          </div>
          <div className="order-list">
            {data.ordersByStatus.map((item) => {
              const total = data.ordersByStatus.reduce((sum, o) => sum + o.count, 0);
              const percent = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
              return (
                <div
                  key={item._id}
                  onClick={() => navigate(`/orders?status=${item._id}`)}
                  className="order-item"
                >
                  <div className="order-row">
                    <span className="order-status-name">{item._id}</span>
                    <span className="order-count">{item.count} ({percent}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: getColorForStatus(item._id),
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="dashboard-box">
          <div className="card-header">
            <h3>Recent Leads</h3>
            <span>Latest Entries</span>
          </div>
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLeads.map((lead) => {
                  const displayStatus = lead.status === "Converted" ? "Order Done" : lead.status;
                  const color = getColorForStatus(displayStatus);
                  return (
                    <tr key={lead._id}>
                      <td className="lead-name">{lead.name}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: `${color}20`,
                            color: color,
                          }}
                        >
                          {displayStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-box">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <span>Latest Orders</span>
          </div>
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => {
                  const color = getColorForStatus(order.status);
                  return (
                    <tr key={order._id}>
                      <td className="customer-name">{order.customer?.name || "—"}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: `${color}20`,
                            color: color,
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;