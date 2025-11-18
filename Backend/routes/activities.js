const express = require('express');
const { pool } = require('../config/database');
const { validateActivity } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all activities for logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
       const [activities] = await pool.execute(
  `SELECT a.*, c.name as category_name 
   FROM Activity a 
   JOIN Category c ON a.category_id = c.category_id 
   WHERE a.user_id = ? 
   ORDER BY a.start_date DESC`,
  [req.session.userId]  
);

    
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Create new activity
router.post('/', authenticate, validateActivity, async (req, res) => {
  try {
    const { activity_name, category_id, start_date, end_date, quantity, unit } = req.body;
    
    // Calculate CO2 result based on category emission factor
    const [categories] = await pool.execute(
      'SELECT emission_factor FROM Category WHERE category_id = ?',
      [category_id]
    );
    
    if (categories.length === 0) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    const emissionFactor = categories[0].emission_factor;
    const CO2_result = quantity * emissionFactor;
    
    // Handle optional end_date - if not provided, use start_date
    const finalEndDate = end_date || start_date;
    
    // Insert activity (activity_id is auto-increment now)
    const [result] = await pool.execute(
      `INSERT INTO Activity (activity_name, user_id, category_id, start_date, end_date, CO2_result, quantity, unit) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [activity_name, req.session.userId, category_id, start_date, finalEndDate, CO2_result, quantity, unit]
    );
    
    // Update user report
    await updateUserReport(req.session.userId);
    
    res.status(201).json({ 
      message: 'Activity logged successfully',
      activityId: result.insertId,
      CO2_result: CO2_result
    });
    
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Update activity
router.put('/:id', authenticate, validateActivity, async (req, res) => {
  try {
    const activityId = req.params.id;
    const { activity_name, category_id, start_date, end_date, quantity, unit } = req.body;
    
    // Verify activity belongs to user
    const [userActivities] = await pool.execute(
      'SELECT user_id FROM Activity WHERE activity_id = ?',
      [activityId]
    );
    
    if (userActivities.length === 0 || userActivities[0].user_id !== req.session.userId) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Recalculate CO2 result
    const [categories] = await pool.execute(
      'SELECT emission_factor FROM Category WHERE category_id = ?',
      [category_id]
    );
    
    const emissionFactor = categories[0].emission_factor;
    const CO2_result = quantity * emissionFactor;
    
    // Handle optional end_date
    const finalEndDate = end_date || start_date;
    
    // Update activity
    await pool.execute(
      `UPDATE Activity 
       SET activity_name = ?, category_id = ?, start_date = ?, end_date = ?, CO2_result = ?, quantity = ?, unit = ?
       WHERE activity_id = ?`,
      [activity_name, category_id, start_date, finalEndDate, CO2_result, quantity, unit, activityId]
    );
    
    // Update user report
    await updateUserReport(req.session.userId);
    
    res.json({ message: 'Activity updated successfully' });
    
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Delete activity
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const activityId = req.params.id;
    
    // Verify activity belongs to user
    const [userActivities] = await pool.execute(
      'SELECT user_id FROM Activity WHERE activity_id = ?',
      [activityId]
    );
    
    if (userActivities.length === 0 || userActivities[0].user_id !== req.session.userId) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Delete activity
    await pool.execute('DELETE FROM Activity WHERE activity_id = ?', [activityId]);
    
    // Update user report
    await updateUserReport(req.session.userId);
    
    res.json({ message: 'Activity deleted successfully' });
    
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// Helper function to update user report
async function updateUserReport(userId) {
  try {
    // Calculate total emissions
    const [totalResult] = await pool.execute(
      'SELECT SUM(CO2_result) as total FROM Activity WHERE user_id = ?',
      [userId]
    );
    
    const totalEmission = totalResult[0].total || 0;
    
    // Update or insert report
    const [existingReport] = await pool.execute(
      'SELECT report_id FROM Report WHERE userID = ?',
      [userId]
    );
    
    if (existingReport.length > 0) {
      await pool.execute(
        'UPDATE Report SET total_emission = ? WHERE userID = ?',
        [totalEmission, userId]
      );
    } else {
      await pool.execute(
        'INSERT INTO Report (userID, total_emission) VALUES (?, ?)',
        [userId, totalEmission]
      );
    }
  } catch (error) {
    console.error('Update report error:', error);
  }
}

module.exports = router;