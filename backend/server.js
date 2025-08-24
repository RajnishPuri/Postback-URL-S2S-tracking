const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Middleware
app.use(cors(
  {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
// pool.connect((err, client, release) => {
//   if (err) {
//     console.error('Error connecting to database:', err);
//   } else {
//     console.log('Connected to PostgreSQL database');
//     release();
//   }
// });

// Click tracking endpoint
app.get('/click', async (req, res) => {
  try {
    const { affiliate_id, campaign_id, click_id } = req.query;

    // Validate required parameters
    if (!affiliate_id || !campaign_id || !click_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: affiliate_id, campaign_id, click_id'
      });
    }

    // Check if affiliate exists
    const affiliateCheck = await pool.query(
      'SELECT id FROM affiliates WHERE id = $1',
      [affiliate_id]
    );

    if (affiliateCheck.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid affiliate_id'
      });
    }

    // Check if campaign exists
    const campaignCheck = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1',
      [campaign_id]
    );

    if (campaignCheck.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid campaign_id'
      });
    }

    // Insert click record
    const result = await pool.query(
      'INSERT INTO clicks (affiliate_id, campaign_id, click_id) VALUES ($1, $2, $3) RETURNING *',
      [affiliate_id, campaign_id, click_id]
    );

    res.json({
      status: 'success',
      message: 'Click tracked successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error tracking click:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({
        status: 'error',
        message: 'Click already exists for this affiliate/campaign/click_id combination'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Postback endpoint
app.get('/postback', async (req, res) => {
  try {
    const { affiliate_id, click_id, amount, currency = 'USD' } = req.query;
    console.log('Postback received:', req.query);

    // Validate required parameters
    if (!affiliate_id || !click_id || !amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: affiliate_id, click_id, amount'
      });
    }

    // Validate amount is a valid number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid amount value'
      });
    }

    // Find the click record
    const clickResult = await pool.query(
      'SELECT id FROM clicks WHERE affiliate_id = $1 AND click_id = $2',
      [affiliate_id, click_id]
    );

    console.log('Click lookup result:', clickResult.rows);

    if (clickResult.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No matching click found for the provided affiliate_id and click_id'
      });
    }

    const clickDbId = clickResult.rows[0].id;

    // Check if conversion already exists for this click
    const existingConversion = await pool.query(
      'SELECT id FROM conversions WHERE click_id = $1',
      [clickDbId]
    );

    if (existingConversion.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Conversion already exists for this click'
      });
    }

    // Insert conversion record
    const conversionResult = await pool.query(
      'INSERT INTO conversions (click_id, amount, currency) VALUES ($1, $2, $3) RETURNING *',
      [clickDbId, parsedAmount, currency]
    );

    res.json({
      status: 'success',
      message: 'Conversion tracked',
      data: conversionResult.rows[0]
    });

  } catch (error) {
    console.error('Error processing postback:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get affiliate data (for dashboard)
app.get('/api/affiliate/:id', async (req, res) => {
  try {
    const affiliateId = req.params.id;

    // Get affiliate info
    const affiliateResult = await pool.query(
      'SELECT * FROM affiliates WHERE id = $1',
      [affiliateId]
    );

    if (affiliateResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Affiliate not found'
      });
    }

    const affiliate = affiliateResult.rows[0];

    // Get clicks with campaign info
    const clicksResult = await pool.query(`
      SELECT c.*, cam.name as campaign_name 
      FROM clicks c 
      JOIN campaigns cam ON c.campaign_id = cam.id 
      WHERE c.affiliate_id = $1 
      ORDER BY c.timestamp DESC
    `, [affiliateId]);

    // Get conversions with click and campaign info
    const conversionsResult = await pool.query(`
      SELECT conv.*, c.click_id as click_identifier, cam.name as campaign_name
      FROM conversions conv
      JOIN clicks c ON conv.click_id = c.id
      JOIN campaigns cam ON c.campaign_id = cam.id
      WHERE c.affiliate_id = $1
      ORDER BY conv.timestamp DESC
    `, [affiliateId]);

    res.json({
      status: 'success',
      data: {
        affiliate,
        clicks: clicksResult.rows,
        conversions: conversionsResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching affiliate data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get all affiliates (for frontend selection)
app.get('/api/affiliates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM affiliates ORDER BY name');
    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get all campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM campaigns ORDER BY name');
    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Postback system backend running on port ${port}`);
});



module.exports = app;

