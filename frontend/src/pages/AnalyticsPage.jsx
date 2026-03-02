import { useEffect, useState } from "react";
import API from "../api/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    async function fetchSessions() {
      const { data } = await API.get("/sessions");
      setSessions(data.reverse()); // oldest → newest
    }

    fetchSessions();
  }, []);

  if (!sessions.length) return <div>Loading...</div>;

  // Transform data for charts
  const chartData = sessions.map((s, index) => ({
    index: index + 1,
    netWPM: s.netWPM,
    accuracy: s.accuracy,
    stability: s.stabilityScore
  }));

  // Weak key aggregation
  const weakKeyCount = {};
  sessions.forEach((s) => {
    s.weakKeys?.forEach((key) => {
      weakKeyCount[key] = (weakKeyCount[key] || 0) + 1;
    });
  });

  const weakKeyData = Object.entries(weakKeyCount).map(
    ([key, count]) => ({ key, count })
  );

  return (
    <div style={{ padding: "40px" }}>
      <h2>Performance Analytics</h2>

      {/* WPM Trend */}
      <h3>Net WPM Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="netWPM" stroke="#2563eb" />
        </LineChart>
      </ResponsiveContainer>

      {/* Accuracy Trend */}
      <h3>Accuracy Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="accuracy" stroke="#16a34a" />
        </LineChart>
      </ResponsiveContainer>

      {/* Stability Trend */}
      <h3>Stability Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="stability" stroke="#f59e0b" />
        </LineChart>
      </ResponsiveContainer>

      {/* Weak Keys */}
      <h3>Weak Key Frequency</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weakKeyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}