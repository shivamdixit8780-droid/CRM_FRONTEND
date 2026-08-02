import { useState, useEffect } from "react";
import { getReports } from "../services/reportService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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
      setError("Report load nahi ho paaya");
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
    fetchReport(); // default: current month
  };
  const chartData = report?.monthlyRevenue || [];

  const pieData =
    report?.leadStatus?.map((item) => ({
      name: item._id,
      value: item.count,
    })) || [];

  const COLORS = [
    "#3B82F6",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
  ];
  const activities = report?.recentActivities || [];

  if (loading) return <p>Loading report...</p>;

  return (

    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Reports Dashboard
        </h2>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow border p-5 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            className="border rounded-lg px-4 py-2"
          />

          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            className="border rounded-lg px-4 py-2"
          />

          <button
            onClick={applyFilter}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
          >
            Apply Filter
          </button>

          <button
            onClick={clearFilter}
            className="bg-gray-200 rounded-lg px-4 py-2 hover:bg-gray-300"
          >
            Reset
          </button>

        </div>

      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {report && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

            <div className="bg-white rounded-xl shadow border p-5">
              <p className="text-gray-500 text-sm">Total Leads</p>
              <h2 className="text-3xl font-bold text-blue-600">
                {report.totalLeads}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow border p-5">
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h2 className="text-3xl font-bold text-purple-600">
                {report.totalOrders}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow border p-5">
              <p className="text-gray-500 text-sm">Total Sales</p>
              <h2 className="text-3xl font-bold text-green-600">
                {report.totalSales}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow border p-5">
              <p className="text-gray-500 text-sm">Revenue</p>
              <h2 className="text-3xl font-bold text-orange-600">
                ₹{report.revenue}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow border p-5">
              <p className="text-gray-500 text-sm">Conversion Rate</p>
              <h2 className="text-3xl font-bold text-red-600">
                {report.conversionRate}
              </h2>
            </div>

          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-8">

            <div className="bg-white rounded-2xl shadow p-5">

              <h3 className="text-lg font-semibold mb-4">
                Lead Status Distribution
              </h3>

              <ResponsiveContainer width="100%" height={320}>

                <LineChart data={chartData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

            <div className="bg-white rounded-2xl shadow p-5">

              <h3 className="text-lg font-semibold mb-4">
                Revenue Distribution
              </h3>

              <ResponsiveContainer width="100%" height={300}>

                <PieChart>

                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={100}
                    label
                  >

                    {pieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}

                  </Pie>

                  <Legend />
                  <Tooltip formatter={(value) => [`${value} Leads`, "Count"]} />

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>
          <div className="bg-white rounded-2xl shadow p-6 mt-8">

            <h3 className="text-xl font-bold mb-6">
              Recent Activities
            </h3>

            <div className="space-y-4">

              {activities.length === 0 ? (

                <p className="text-gray-500">
                  No recent activities found.
                </p>

              ) : (

                activities.map((activity, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-3"
                  >

                    <div>

                      <p className="font-semibold">

                        {activity.title}

                      </p>

                      <p className="text-sm text-gray-500">

                        {activity.type}

                      </p>

                    </div>

                    <span className="text-xs text-gray-400">

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