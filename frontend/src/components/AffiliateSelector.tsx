import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Affiliate {
  id: number;
  name: string;
  created_at: string;
}

const AffiliateSelector: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/affiliates');
      if (response.data.status === 'success') {
        setAffiliates(response.data.data);
      } else {
        setError('Failed to fetch affiliates');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching affiliates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAffiliateSelect = (affiliateId: number) => {
    navigate(`/dashboard/${affiliateId}`);
  };

  if (loading) {
    return (
      <div className="affiliate-selector">
        <div className="loading">Loading affiliates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="affiliate-selector">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchAffiliates}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-selector">
      <div className="container">
        <h2>Select Affiliate</h2>
        <p>Choose an affiliate to view their dashboard and postback URL.</p>

        <div className="affiliate-grid">
          {affiliates.map((affiliate) => (
            <div
              key={affiliate.id}
              className="affiliate-card"
              onClick={() => handleAffiliateSelect(affiliate.id)}
            >
              <h3>{affiliate.name}</h3>
              <p>ID: {affiliate.id}</p>
              <p>Created: {new Date(affiliate.created_at).toLocaleDateString()}</p>
              <button className="select-btn">View Dashboard</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AffiliateSelector;

