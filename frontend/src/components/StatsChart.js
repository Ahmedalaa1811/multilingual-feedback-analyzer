import React, { useEffect, useState } from 'react';
import { fetchStats } from '../api/stats';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatsChart = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      setRefreshing(true);
      const data = await fetchStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('⚠️ Failed to load stats');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!stats) return <p>Loading stats...</p>;

  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        label: 'Sentiment Distribution (%)',
        data: [
          stats.percent_positive,
          stats.percent_neutral,
          stats.percent_negative,
        ],
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
        borderColor: ['#388E3C', '#FFA000', '#D32F2F'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (ctx) {
            return `${ctx.label}: ${ctx.parsed.toFixed(1)}%`;
          },
        },
      },
    },
    animation: {
      animateScale: true,
    },
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3>📊 Sentiment Stats</h3>
        <button onClick={loadStats} disabled={refreshing} style={buttonStyle}>
          {refreshing ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      <Pie data={chartData} options={chartOptions} />

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Total Feedback: <strong>{stats.total}</strong>
      </p>
    </div>
  );
};

// Styles
const containerStyle = {
  maxWidth: '500px',
  margin: '2rem auto',
  padding: '1rem',
  background: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
};

const buttonStyle = {
  padding: '0.3rem 0.75rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '0.85rem',
  cursor: 'pointer',
};

export default StatsChart;
