const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get emissions summary
router.get('/summary', authenticate, async (req, res) => {
    try {
        const userId = req.session.userId;

        // Get weekly trend - FIXED table names
        const weeklyQuery = `
            SELECT DATE(start_date) as date, SUM(CO2_result) as daily_emission
            FROM Activity 
            WHERE user_id = ? AND start_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(start_date)
            ORDER BY date
        `;

        // Get by category - FIXED table names
        const categoryQuery = `
            SELECT c.name as category_name, SUM(a.CO2_result) as total_emission
            FROM Activity a
            JOIN Category c ON a.category_id = c.category_id
            WHERE a.user_id = ?
            GROUP BY c.category_id, c.name
        `;

        const [weeklyResults] = await pool.execute(weeklyQuery, [userId]);
        const [categoryResults] = await pool.execute(categoryQuery, [userId]);

        // Calculate total
        const totalEmission = categoryResults.reduce((sum, item) => sum + item.total_emission, 0);

        res.json({
            weekly_trend: weeklyResults,
            by_category: categoryResults,
            total_emission: totalEmission
        });

    } catch (error) {
        console.error('Emissions summary error:', error);
        res.status(500).json({ error: 'Failed to load emissions data' });
    }
});

// Get emission categories - FIXED table name
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await pool.execute('SELECT * FROM Category');
        res.json(categories);
    } catch (error) {
        console.error('Categories error:', error);
        res.status(500).json({ error: 'Failed to load categories' });
    }
});

// Get suggestions - FIXED table names and session
router.get('/suggestions', authenticate, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        // Get user's high emission categories - FIXED table names
        const highEmissionQuery = `
            SELECT c.category_id, c.name as category_name, SUM(a.CO2_result) as total_emission
            FROM Activity a
            JOIN Category c ON a.category_id = c.category_id
            WHERE a.user_id = ?
            GROUP BY c.category_id, c.name
            ORDER BY total_emission DESC
            LIMIT 3
        `;

        const [highEmissionCats] = await pool.execute(highEmissionQuery, [userId]);

        // Generate suggestions based on high emission categories
        const suggestions = highEmissionCats.map(cat => {
            const categorySuggestions = {
                1: [ // Transportation
                    { title: 'Use Public Transport', description: 'Try taking the bus or train instead of driving to reduce emissions by up to 50%.' },
                    { title: 'Carpool', description: 'Share rides with colleagues or friends to cut transportation emissions.' },
                    { title: 'Walk or Bike', description: 'For short distances, consider walking or biking instead of driving.' }
                ],
                2: [ // Diet
                    { title: 'Plant-Based Meals', description: 'Try incorporating more plant-based meals to significantly reduce dietary emissions.' },
                    { title: 'Local Produce', description: 'Buy local and seasonal foods to reduce transportation emissions.' },
                    { title: 'Reduce Food Waste', description: 'Plan meals and store food properly to minimize waste.' }
                ],
                3: [ // Energy
                    { title: 'Energy Efficient Appliances', description: 'Use energy-efficient appliances and turn them off when not in use.' },
                    { title: 'LED Lighting', description: 'Switch to LED bulbs which use 75% less energy.' },
                    { title: 'Smart Thermostat', description: 'Use a programmable thermostat to optimize heating and cooling.' }
                ],
                4: [ // Shopping
                    { title: 'Buy Second-Hand', description: 'Purchase used items to reduce manufacturing emissions.' },
                    { title: 'Quality Over Quantity', description: 'Invest in durable products that last longer.' }
                ],
                5: [ // Water Use
                    { title: 'Shorter Showers', description: 'Reduce shower time to save water and energy.' },
                    { title: 'Fix Leaks', description: 'Repair leaky faucets to prevent water waste.' }
                ]
            };

            return categorySuggestions[cat.category_id] || [
                { title: 'General Tip', description: 'Monitor your activities regularly to identify emission hotspots.' }
            ];
        }).flat();

        res.json({ suggestions: suggestions.slice(0, 5) }); // Return top 5 suggestions

    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({ error: 'Failed to load suggestions' });
    }
});

module.exports = router;