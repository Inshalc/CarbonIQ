const express = require('express');
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Calculate carbon footprint using external API
router.post('/calculate-footprint', authenticate, async (req, res) => {
    try {
        const { activityType, value, unit, vehicleType, country, dietType } = req.body;

        let carbonResult;

        if (activityType === 'transport') {
            carbonResult = await calculateTransportEmission(value, unit, vehicleType);
        } else if (activityType === 'electricity') {
            carbonResult = await calculateElectricityEmission(value, unit, country);
        } else if (activityType === 'diet') {
            carbonResult = await calculateDietEmission(value, dietType);
        } else {
            return res.status(400).json({ error: 'Unsupported activity type' });
        }

        res.json(carbonResult);
    } catch (error) {
        console.error('Carbon calculation error:', error);
        res.status(500).json({ error: 'Calculation failed' });
    }
});

// Get current weather
router.get('/weather/current', authenticate, async (req, res) => {
    try {
        const city = req.query.city || 'London';
        
        // Mock weather response for now (replace with actual OpenWeather API)
        const mockWeather = {
            success: true,
            data: {
                city: city,
                country: 'GB',
                temperature: Math.round(Math.random() * 30 + 5), // 5-35°C
                description: 'Partly cloudy',
                humidity: Math.round(Math.random() * 50 + 30), // 30-80%
                windSpeed: (Math.random() * 10).toFixed(1),
                icon: '01d'
            }
        };

        res.json(mockWeather);
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ error: 'Weather data unavailable' });
    }
});

// Helper functions
async function calculateTransportEmission(distance, unit, vehicleType) {
    // Mock calculation - replace with Carbon Interface API
    const emissionFactors = {
        'car_petrol_medium': 0.23, // kg CO2 per km
        'car_diesel_medium': 0.20,
        'bus': 0.08,
        'train': 0.05,
        'bicycle': 0,
        'walking': 0
    };

    const factor = emissionFactors[vehicleType] || 0.15;
    const carbonKg = distance * factor;

    return {
        success: true,
        carbon_emission: {
            carbon_kg: carbonKg,
            source: 'local_calculator'
        },
        calculation: `${distance} ${unit} × ${factor} kg CO2/${unit}`
    };
}

async function calculateElectricityEmission(usage, unit, country) {
    // Mock calculation
    const countryFactors = {
        'US': 0.5, // kg CO2 per kWh
        'CA': 0.15,
        'GB': 0.3,
        'DE': 0.4,
        'FR': 0.08
    };

    const factor = countryFactors[country] || 0.35;
    const carbonKg = usage * factor;

    return {
        success: true,
        carbon_emission: {
            carbon_kg: carbonKg,
            source: 'local_calculator'
        },
        calculation: `${usage} ${unit} × ${factor} kg CO2/${unit}`
    };
}

async function calculateDietEmission(meals, dietType) {
    const emissionFactors = {
        'meat_heavy': 2.5,
        'average': 1.8,
        'vegetarian': 0.9,
        'vegan': 0.7
    };

    const factor = emissionFactors[dietType] || 1.8;
    const carbonKg = meals * factor;

    return {
        success: true,
        carbon_emission: {
            carbon_kg: carbonKg,
            source: 'local_calculator'
        },
        calculation: `${meals} meals × ${factor} kg CO2/meal`
    };
}

module.exports = router;