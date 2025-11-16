const express = require('express');
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get emission summary for user
router.get('/summary', authenticate, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Get total emissions from report
    const [reports] = await pool.execute(
      'SELECT total_emission FROM Report WHERE userID = ?',
      [userId]
    );
    
    // Get emissions by category
    const [categoryEmissions] = await pool.execute(
      `SELECT c.name as category_name, SUM(a.CO2_result) as total_emission
       FROM Activity a
       JOIN Category c ON a.category_id = c.category_id
       WHERE a.user_id = ?
       GROUP BY c.name`,
      [userId]
    );
    
    // Get weekly trend
    const [weeklyTrend] = await pool.execute(
      `SELECT DATE(start_date) as date, SUM(CO2_result) as daily_emission
       FROM Activity 
       WHERE user_id = ? AND start_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(start_date)
       ORDER BY date`,
      [userId]
    );
    
    const summary = {
      total_emission: reports.length > 0 ? reports[0].total_emission : 0,
      by_category: categoryEmissions,
      weekly_trend: weeklyTrend,
      user_id: userId
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Get emissions summary error:', error);
    res.status(500).json({ error: 'Failed to fetch emissions summary' });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute('SELECT * FROM Category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get suggestions based on user activities
router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Get user's high-emission activities
    const [highEmissionActivities] = await pool.execute(
      `SELECT a.activity_name, a.CO2_result, c.name as category_name
       FROM Activity a
       JOIN Category c ON a.category_id = c.category_id
       WHERE a.user_id = ? AND a.CO2_result > (
         SELECT AVG(CO2_result) FROM Activity WHERE user_id = ?
       )
       ORDER BY a.CO2_result DESC
       LIMIT 5`,
      [userId, userId]
    );
    
    // Get relevant suggestions
    let suggestions = [];
    if (highEmissionActivities.length > 0) {
      const activityNames = highEmissionActivities.map(a => a.activity_name);
      const placeholders = activityNames.map(() => '?').join(',');
      
      const [suggestionResults] = await pool.execute(
        `SELECT * FROM Suggestion WHERE activity_name IN (${placeholders})`,
        activityNames
      );
      
      suggestions = suggestionResults;
    }
    
    // If no specific suggestions, get general ones
    if (suggestions.length === 0) {
      const [generalSuggestions] = await pool.execute(
        'SELECT * FROM Suggestion LIMIT 3'
      );
      suggestions = generalSuggestions;
    }
    
    res.json({
      high_emission_activities: highEmissionActivities,
      suggestions: suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

module.exports = router;