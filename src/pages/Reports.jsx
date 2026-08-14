import { useState, useEffect } from "react";
import { getReports } from "../services/reportService";
import "../styles/Reports.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Chart date filter — default LAST 7 DAYS
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [chartDateRange, setChartDateRange] = useState({
    startDate: sevenDaysAgo.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
  });

  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async (startDate, endDate) => {
    try {
      setLoading(true);
      const res = await getReports(startDate, endDate);
      setReport(res.data);
    } catch (err) {
      setError("Report load failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const applyFilter = () => {
    fetchReport(dateRange.startDate, dateRange.endDate);
  };

  const clearFilter = () => {
    setDateRange({ startDate: "", endDate: "" });
    fetchReport();
  };

  // ✅ Filter chart data by date range
  const filterChartByDate = (data) => {
    if (!data || !chartDateRange.startDate || !chartDateRange.endDate) return data;
    const start = new Date(chartDateRange.startDate);
    const end = new Date(chartDateRange.endDate);
    end.setHours(23, 59, 59, 999);
    return data.filter((item) => {
      if (!item.date && !item.month) return true;
      const d = new Date(item.date || item.month);
      return d >= start && d <= end;
    });
  };

  const chartData = filterChartByDate(report?.monthlyRevenue || []);

  const pieData = report?.leadStatus?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];

  const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#a855f7", "#f97316", "#06b6d4", "#8b5cf6"];
  const activities = report?.recentActivities || [];

  if (loading) return <p className="reports-loading">Loading report...</p>;

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h2 className="reports-title">📊 Reports Dashboard</h2>
        <p className="reports-subtitle">Comprehensive business analytics</p>
      </div>

      {/* Main Date Filter */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="filter-field">
            <label>From</label>
            <input type="date" name="startDate" value={dateRange.startDate} onChange={handleDateChange} className="filter-input" />
          </div>
          <div className="filter-field">
            <label>To</label>
            <input type="date" name="endDate" value={dateRange.endDate} onChange={handleDateChange} className="filter-input" />
          </div>
          <button onClick={applyFilter} className="btn btn-primary">Apply Filter</button>
          <button onClick={clearFilter} className="btn btn-secondary">Reset</button>
        </div>
      </div>

      {error && <p className="reports-error">{error}</p>}

      {report && (
        <>
          {/* ✅ 5 STATS CARDS (Revenue card removed) */}
          <div className="stats-grid">
            {/* 1. Total Leads */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-icon blue">👥</span>
                <div className="stat-card-content">
                  <p className="stat-label">Total Leads</p>
                  <h2 className="stat-value">{report.totalLeads || 0}</h2>
                </div>
              </div>
            </div>

            {/* 2. Total Orders */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-icon purple">📦</span>
                <div className="stat-card-content">
                  <p className="stat-label">Total Orders</p>
                  <h2 className="stat-value">{report.totalOrders || 0}</h2>
                </div>
              </div>
            </div>

            {/* 3. Total Sales */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-icon green">💰</span>
                <div className="stat-card-content">
                  <p className="stat-label">Total Sales</p>
                  <h2 className="stat-value">₹{Number(report.totalSales || 0).toLocaleString()}</h2>
                </div>
              </div>
            </div>

            {/* ✅ 4. Delivered Revenue (ONLY THIS ONE KEEP) */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-icon teal">✅</span>
                <div className="stat-card-content">
                  <p className="stat-label">Delivered Revenue</p>
                  <h2 className="stat-value">₹{Number(report.deliveredRevenue || report.revenue || 0).toLocaleString()}</h2>
                </div>
              </div>
            </div>

            {/* 5. Conversion Rate */}
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-icon red">📊</span>
                <div className="stat-card-content">
                  <p className="stat-label">Conversion Rate</p>
                  <h2 className="stat-value">{report.conversionRate || "0%"}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Date Filter */}
          <div className="chart-filter-bar">
            <div className="date-field">
              <label>Chart From</label>
              <input
                type="date"
                value={chartDateRange.startDate}
                onChange={(e) => setChartDateRange({ ...chartDateRange, startDate: e.target.value })}
                className="filter-input"
              />
            </div>
            <div className="date-field">
              <label>Chart To</label>
              <input
                type="date"
                value={chartDateRange.endDate}
                onChange={(e) => setChartDateRange({ ...chartDateRange, endDate: e.target.value })}
                className="filter-input"
              />
            </div>
            <button onClick={() => {
              const t = new Date();
              const s = new Date();
              s.setDate(t.getDate() - 6);
              setChartDateRange({
                startDate: s.toISOString().split("T")[0],
                endDate: t.toISOString().split("T")[0],
              });
            }} className="btn btn-secondary">Last 7 Days</button>
            <button onClick={() => {
              const now = new Date();
              setChartDateRange({
                startDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
                endDate: now.toISOString().split("T")[0],
              });
            }} className="btn btn-secondary">This Month</button>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="chart-card">
              <h3 className="chart-title">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Lead Status Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" outerRadius={90} label>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value} Leads`, "Count"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="activities-card">
            <h3 className="activities-title">📝 Recent Activities</h3>
            <div className="activities-list">
              {activities.length === 0 ? (
                <p className="activities-empty">No recent activities found.</p>
              ) : (
                activities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <p className="activity-name">{activity.title}</p>
                      <p className="activity-type">{activity.type}</p>
                    </div>
                    <span className="activity-time">
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;