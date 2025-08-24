import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

interface Affiliate {
  id: number;
  name: string;
  created_at: string;
}

interface Click {
  id: number;
  affiliate_id: number;
  campaign_id: number;
  click_id: string;
  timestamp: string;
  campaign_name: string;
}

interface Conversion {
  id: number;
  click_id: number;
  amount: string;
  currency: string;
  timestamp: string;
  click_identifier: string;
  campaign_name: string;
}

interface AffiliateData {
  affiliate: Affiliate;
  clicks: Click[];
  conversions: Conversion[];
}

const Dashboard: React.FC = () => {
  const { affiliateId } = useParams<{ affiliateId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (affiliateId) {
      fetchAffiliateData(affiliateId);
    }
  }, [affiliateId]);

  const fetchAffiliateData = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/affiliate/${id}`);
      if (response.data.status === 'success') {
        setData(response.data.data);
      } else {
        setError('Failed to fetch affiliate data');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching affiliate data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRevenue = () => {
    if (!data) return 0;
    return data.conversions.reduce((total, conversion) => {
      return total + parseFloat(conversion.amount);
    }, 0);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dashboard">
        <div className="error">
          <h3>Error</h3>
          <p>{error || 'Affiliate not found'}</p>
          <button onClick={() => navigate('/')}>Back to Affiliate Selection</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <h2>{data.affiliate.name} Dashboard</h2>
            <p>Affiliate ID: {data.affiliate.id}</p>
          </div>
          <div className="header-actions">
            <Link
              to={`/postback-url/${affiliateId}`}
              className="btn btn-primary"
            >
              View Postback URL
            </Link>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Back to Selection
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Clicks</h3>
            <div className="stat-value">{data.clicks.length}</div>
          </div>
          <div className="stat-card">
            <h3>Total Conversions</h3>
            <div className="stat-value">{data.conversions.length}</div>
          </div>
          <div className="stat-card">
            <h3>Conversion Rate</h3>
            <div className="stat-value">
              {data.clicks.length > 0
                ? ((data.conversions.length / data.clicks.length) * 100).toFixed(2) + '%'
                : '0%'
              }
            </div>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <div className="stat-value">${calculateTotalRevenue().toFixed(2)}</div>
          </div>
        </div>

        <div className="data-sections">
          <div className="section">
            <h3>Recent Clicks</h3>
            {data.clicks.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Click ID</th>
                      <th>Campaign</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.clicks.slice(0, 10).map((click) => (
                      <tr key={click.id}>
                        <td>{click.click_id}</td>
                        <td>{click.campaign_name}</td>
                        <td>{new Date(click.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No clicks recorded yet.</p>
            )}
          </div>

          <div className="section">
            <h3>Recent Conversions</h3>
            {data.conversions.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Click ID</th>
                      <th>Campaign</th>
                      <th>Amount</th>
                      <th>Currency</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.conversions.slice(0, 10).map((conversion) => (
                      <tr key={conversion.id}>
                        <td>{conversion.click_identifier}</td>
                        <td>{conversion.campaign_name}</td>
                        <td>${conversion.amount}</td>
                        <td>{conversion.currency}</td>
                        <td>{new Date(conversion.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No conversions recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

