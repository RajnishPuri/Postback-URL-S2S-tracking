import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

interface Affiliate {
  id: number;
  name: string;
  created_at: string;
}

const PostbackUrl: React.FC = () => {
  const { affiliateId } = useParams<{ affiliateId: string }>();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (affiliateId) {
      fetchAffiliate(affiliateId);
    }
  }, [affiliateId]);

  const fetchAffiliate = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/affiliate/${id}`);
      if (response.data.status === 'success') {
        setAffiliate(response.data.data.affiliate);
      } else {
        setError('Failed to fetch affiliate data');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching affiliate:', err);
    } finally {
      setLoading(false);
    }
  };

  const postbackUrl = `http://localhost:5000/postback?affiliate_id=${affiliateId}&click_id={click_id}&amount={amount}&currency={currency}`;
  const exampleUrl = `http://localhost:5000/postback?affiliate_id=${affiliateId}&click_id=abc123&amount=100&currency=USD`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (loading) {
    return (
      <div className="postback-url">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !affiliate) {
    return (
      <div className="postback-url">
        <div className="error">
          <h3>Error</h3>
          <p>{error || 'Affiliate not found'}</p>
          <button onClick={() => navigate('/')}>Back to Affiliate Selection</button>
        </div>
      </div>
    );
  }

  return (
    <div className="postback-url">
      <div className="container">
        <div className="header">
          <h2>Postback URL for {affiliate.name}</h2>
          <p>Use this URL to track conversions from advertisers</p>
          <div className="header-actions">
            <Link
              to={`/dashboard/${affiliateId}`}
              className="btn btn-primary"
            >
              View Dashboard
            </Link>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Back to Selection
            </button>
          </div>
        </div>

        <div className="url-section">
          <h3>Your Postback URL Template</h3>
          <div className="url-container">
            <code className="url-code">{postbackUrl}</code>
            <button
              onClick={() => copyToClipboard(postbackUrl)}
              className="copy-btn"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="parameters-section">
          <h3>URL Parameters</h3>
          <div className="parameters-grid">
            <div className="parameter">
              <strong>affiliate_id</strong>
              <p>Your unique affiliate identifier (automatically set to {affiliateId})</p>
            </div>
            <div className="parameter">
              <strong>click_id</strong>
              <p>The unique identifier for the click that generated the conversion</p>
            </div>
            <div className="parameter">
              <strong>amount</strong>
              <p>The conversion amount (e.g., 100.00)</p>
            </div>
            <div className="parameter">
              <strong>currency</strong>
              <p>The currency code (e.g., USD, EUR) - optional, defaults to USD</p>
            </div>
          </div>
        </div>

        <div className="example-section">
          <h3>Example Usage</h3>
          <p>Here's how an advertiser would fire a postback for a $100 USD conversion:</p>
          <div className="url-container">
            <code className="url-code example">{exampleUrl}</code>
            <button
              onClick={() => copyToClipboard(exampleUrl)}
              className="copy-btn"
            >
              Copy Example
            </button>
          </div>
        </div>

        <div className="instructions-section">
          <h3>Integration Instructions</h3>
          <div className="instructions">
            <h4>For Advertisers:</h4>
            <ol>
              <li>Replace <code>{'{click_id}'}</code> with the actual click ID from the affiliate link</li>
              <li>Replace <code>{'{amount}'}</code> with the actual conversion amount</li>
              <li>Replace <code>{'{currency}'}</code> with the appropriate currency code (optional)</li>
              <li>Fire this URL as a server-to-server HTTP GET request when a conversion occurs</li>
            </ol>

            <h4>Response Format:</h4>
            <p>Successful postback will return:</p>
            <pre className="response-example">
              {`{
  "status": "success",
  "message": "Conversion tracked"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostbackUrl;

